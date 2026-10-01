// In-memory TF-IDF index. Rebuilt lazily after articles change (fine for thousands of articles).
const Article = require('../models/Article');
const { buildIndex } = require('./engine');
const { stem } = require('../nlp');

let cache = null;
exports.invalidate = () => { cache = null; };
exports.getIndex = async () => {
  if (cache) return cache;
  const arts = await Article.find().select('terms keywords category').lean();
  const idx = buildIndex(arts.map((a) => ({ id: String(a._id), terms: a.terms || {} })));
  idx.stemWord = {}; idx.cats = Object.fromEntries(arts.map((a) => [String(a._id), a.category]));
  for (const a of arts) for (const k of a.keywords || []) idx.stemWord[stem(k)] = k;
  return (cache = idx);
};
