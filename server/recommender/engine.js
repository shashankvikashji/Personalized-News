/**
 * Hybrid recommender (pure functions, easy to unit test).
 *   score = 0.40 * content similarity (user profile vs article TF-IDF, cosine)
 *         + 0.30 * category affinity
 *         + 0.20 * recency (exp decay)
 *         + 0.10 * popularity (log scaled)
 * Already-read stories are down-weighted; "not interested" stories are removed.
 */
const { stem } = require('../nlp');

function buildIndex(docs) {
  const N = docs.length, df = {};
  for (const d of docs) for (const t in d.terms) df[t] = (df[t] || 0) + 1;
  const idf = {};
  for (const t in df) idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1;
  const vecs = new Map();
  for (const d of docs) {
    const v = {}; let n = 0;
    for (const t in d.terms) { const w = (1 + Math.log(d.terms[t])) * idf[t]; v[t] = w; n += w * w; }
    n = Math.sqrt(n) || 1;
    for (const t in v) v[t] /= n;
    vecs.set(d.id, v);
  }
  return { idf, vecs };
}

const dot = (a, b) => {
  const [x, y] = Object.keys(a).length < Object.keys(b).length ? [a, b] : [b, a];
  let s = 0; for (const k in x) if (y[k]) s += x[k] * y[k]; return s;
};
const norm = (v) => Math.sqrt(Object.values(v).reduce((s, x) => s + x * x, 0));
const prune = (p, keep) => Object.fromEntries(Object.entries(p).filter(([, v]) => Math.abs(v) > 0.01).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, keep));

function updateProfile(profile, vec, weight, decay = 0.97, keep = 120) {
  const next = {};
  for (const t in profile) next[t] = profile[t] * decay;
  for (const t in vec) next[t] = (next[t] || 0) + weight * vec[t];
  return prune(next, keep);
}

function seedProfile(vecs, articles, cats) {
  const p = {};
  for (const c of cats) {
    const list = articles.filter((a) => a.category === c);
    for (const a of list) {
      const v = vecs.get(String(a._id)); if (!v) continue;
      for (const t in v) p[t] = (p[t] || 0) + (2 * v[t]) / list.length;
    }
  }
  return prune(p, 120);
}

function rank({ articles, vecs, profile = {}, catScores = {}, seen = new Set(), disliked = new Set(), now = Date.now() }) {
  const pn = norm(profile);
  const maxCat = Math.max(0, ...Object.values(catScores));
  const cold = pn === 0 && maxCat === 0;
  const pops = articles.map((a) => Math.log1p((a.views || 0) + 3 * (a.likes || 0) + 2 * (a.saves || 0)));
  const maxPop = Math.max(1, ...pops);

  const rows = articles.filter((a) => !disliked.has(String(a._id))).map((a) => {
    const id = String(a._id), vec = vecs.get(id) || {};
    const content = pn ? Math.max(0, dot(profile, vec) / pn) : 0;
    const cat = maxCat ? Math.max(0, catScores[a.category] || 0) / maxCat : 0;
    const ageDays = (now - new Date(a.publishedAt).getTime()) / 864e5;
    const recency = Math.exp(-Math.max(0, ageDays) / 6);
    const pop = Math.log1p((a.views || 0) + 3 * (a.likes || 0) + 2 * (a.saves || 0)) / maxPop;
    let score = 0.4 * content + 0.3 * cat + 0.2 * recency + 0.1 * pop;
    const wasSeen = seen.has(id);
    if (wasSeen) score *= 0.35;
    return { a, score, content, cat, recency, pop, wasSeen };
  });

  const best = Math.max(...rows.map((r) => r.score), 0.0001);
  return {
    cold,
    items: rows.sort((x, y) => y.score - x.score).map((r) => {
      const reasons = [];
      if (!cold) {
        if (r.cat > 0.6) reasons.push(`You read a lot of ${r.a.category}`);
        else if (r.cat > 0) reasons.push(`Matches your interest in ${r.a.category}`);
        const hit = (r.a.keywords || []).filter((k) => (profile[stem(k)] || 0) > 0.05).slice(0, 3);
        if (hit.length) reasons.push(`Mentions ${hit.join(', ')}`);
      }
      if (r.recency > 0.8) reasons.push('Fresh today');
      if (r.pop > 0.75) reasons.push('Popular with readers');
      return { ...r.a, score: +r.score.toFixed(4), match: cold ? null : Math.min(99, Math.round(50 + 49 * (r.score / best))), reasons: reasons.slice(0, 3), seen: r.wasSeen };
    }),
  };
}

// Content-based similarity: cosine of TF-IDF vectors, plus a small bonus for the same category.
function similar(vecs, id, n = 4, cats = {}) {
  const base = vecs.get(String(id)); if (!base) return [];
  return [...vecs].filter(([k]) => k !== String(id))
    .map(([k, v]) => [k, dot(base, v) + (cats[k] && cats[k] === cats[String(id)] ? 0.15 : 0)])
    .sort((a, b) => b[1] - a[1]).slice(0, n);
}

module.exports = { buildIndex, updateProfile, seedProfile, rank, similar, dot };
