// Run: npm test   (no database needed)
const assert = require('assert');
const nlp = require('../nlp');
const { buildArticle } = require('../utils/articleBuilder');
const { buildIndex, rank, seedProfile, similar, updateProfile } = require('../recommender/engine');
const rows = require('../data/articles');

const arts = rows.map(([category, title, content], i) => ({ _id: String(i), ...buildArticle({ title, content, category }), publishedAt: new Date(Date.now() - i * 36e5), views: 10, likes: 1, saves: 1 }));
const { vecs } = buildIndex(arts.map((a) => ({ id: a._id, terms: a.terms })));

assert.strictEqual(nlp.stem('running'), 'run');
assert.strictEqual(nlp.stem('companies'), 'company');
assert.ok(nlp.keywords('chip energy chip data center energy chip').includes('chip'));
assert.strictEqual(nlp.sentiment('record growth and strong success').label, 'positive');
assert.strictEqual(nlp.sentiment('crisis, war and heavy losses').label, 'negative');
console.log('NLP ok. Sample keywords:', arts[0].keywords.join(', '), '| summary sentences:', arts[0].summary.length);

const sim = similar(vecs, '0', 3, Object.fromEntries(arts.map((a) => [a._id, a.category]))).map(([id]) => arts[+id].category);
console.log('Similar to "' + arts[0].title + '":', sim.join(', '));
assert.ok(sim.filter((c) => c === 'Technology').length >= 2);

const profile = seedProfile(vecs, arts, ['Technology']);
const out = rank({ articles: arts, vecs, profile, catScores: { Technology: 5 } });
console.log('Top 5 for a Technology reader:', out.items.slice(0, 5).map((i) => `${i.category} ${i.match}%`).join(' | '));
assert.strictEqual(out.items[0].category, 'Technology');
assert.ok(out.items[0].reasons.length > 0);

const cold = rank({ articles: arts, vecs });
assert.ok(cold.cold && cold.items[0].match === null);
const liked = updateProfile({}, vecs.get('8'), 3);
assert.ok(Object.keys(liked).length > 0);
console.log('All tests passed.');
