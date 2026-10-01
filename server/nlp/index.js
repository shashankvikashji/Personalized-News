/**
 * Lightweight NLP toolkit (no external dependencies).
 * tokenize -> stop-word removal -> stemming -> term counts, keywords,
 * extractive summary, lexicon sentiment and reading time.
 */
const STOP = new Set(('a an the and or but if then else when at by for with about against between into through during before after above below to from up down in out on off over under again further once here there all any both each few more most other some such no nor not only own same so than too very can will just don should now is are was were be been being have has had do does did of this that these those it its i you he she they we our your their what which who whom as while also said says say would could may might new one two three four many much per via year years week month day days according among within without around across still even like make made says').split(' '));

const RULES = [['sses', 'ss'], ['ies', 'y'], ['ing', ''], ['edly', ''], ['ed', ''], ['ly', ''], ['ers', ''], ['s', '']];

function stem(w) {
  for (const [suf, rep] of RULES) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      if (suf === 's' && (w.endsWith('ss') || w.endsWith('us') || w.endsWith('is'))) return w;
      let s = w.slice(0, -suf.length) + rep;
      if ((suf === 'ing' || suf === 'ed') && /([^aeioull])\1$/.test(s)) s = s.slice(0, -1); // runn -> run
      return s;
    }
  }
  return w;
}

const words = (text) => (String(text).toLowerCase().match(/[a-z][a-z'-]*/g) || []).map((w) => w.replace(/['-]/g, ''));
const tokens = (text) => words(text).filter((w) => w.length > 2 && !STOP.has(w));
const topN = (obj, n) => Object.fromEntries(Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n));

function termCounts(text, max = 60) {
  const c = {};
  for (const w of tokens(text)) { const s = stem(w); c[s] = (c[s] || 0) + 1; }
  return topN(c, max);
}

function keywords(text, n = 6) {
  const c = {};
  for (const w of tokens(text)) c[w] = (c[w] || 0) + 1;
  const ranked = Object.entries(c).map(([w, k]) => [w, k * (1 + w.length / 10)]).sort((a, b) => b[1] - a[1]);
  const seen = new Set(), out = [];
  for (const [w] of ranked) { const s = stem(w); if (!seen.has(s)) { seen.add(s); out.push(w); } if (out.length === n) break; }
  return out;
}

const sentences = (text) => String(text).replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 20);

function summarize(text, k = 3) {
  const sents = sentences(text);
  if (sents.length <= k) return sents;
  const freq = termCounts(text, 500);
  const scored = sents.map((s, i) => {
    const t = tokens(s).map(stem);
    const score = t.reduce((a, x) => a + (freq[x] || 0), 0) / Math.pow(t.length || 1, 0.6);
    return { s, i, score: score * (i === 0 ? 1.15 : 1) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, k).sort((a, b) => a.i - b.i).map((x) => x.s);
}

const POS = new Set('good great growth gain gains win wins record success breakthrough improve improved improves strong boost benefit benefits hope progress celebrate best leading innovative surge rise rises praised support healthy safe cure award welcomed stable faster cleaner better attractive lower'.split(' '));
const NEG = new Set('bad crisis loss losses fall falls fear risk risks threat war attack decline drop cut cuts warn warns warned warning concern concerns fail failed failure shortage disease danger crash damage worst weak slump layoffs conflict storm floods displaced injury injured harming struggle wasted'.split(' '));

function sentiment(text) {
  const w = words(text);
  let p = 0, n = 0;
  for (const x of w) { if (POS.has(x)) p++; else if (NEG.has(x)) n++; }
  const score = Math.max(-1, Math.min(1, (p - n) / Math.sqrt(w.length || 1) * 2));
  return { score: +score.toFixed(2), label: score > 0.15 ? 'positive' : score < -0.15 ? 'negative' : 'neutral' };
}

const readingTime = (text) => Math.max(1, Math.round(words(text).length / 220));

module.exports = { stem, tokens, termCounts, keywords, summarize, sentiment, readingTime };
