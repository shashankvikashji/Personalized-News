const router = require('express').Router();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const { auth } = require('../middleware/auth');
const { getIndex } = require('../recommender/store');
const { similar } = require('../recommender/engine');
const { applySignal, W } = require('../recommender/signals');
const { userFlags, decorate } = require('../utils/flags');

const LIST = '-content -terms';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', auth, async (req, res) => {
  const { q, category, sort = 'latest' } = req.query;
  const page = Math.max(1, +req.query.page || 1), limit = 12;
  const filter = {};
  if (category && category !== 'All') filter.category = category;
  if (q) { const r = new RegExp(esc(q.trim()), 'i'); filter.$or = [{ title: r }, { excerpt: r }, { keywords: r }, { source: r }]; }
  const order = sort === 'popular' ? { views: -1, likes: -1 } : { publishedAt: -1 };
  const [items, total, f] = await Promise.all([
    Article.find(filter).select(LIST).sort(order).skip((page - 1) * limit).limit(limit).lean(),
    Article.countDocuments(filter), userFlags(req.user.id)]);
  res.json({ items: decorate(items, f), total, page, pages: Math.ceil(total / limit) });
});

router.get('/categories', auth, async (_req, res) => {
  const rows = await Article.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  res.json(rows.map((r) => ({ name: r._id, count: r.count })));
});

router.get('/trending', auth, async (req, res) => {
  const [arts, f] = await Promise.all([Article.find().select(LIST).lean(), userFlags(req.user.id)]);
  const now = Date.now();
  const scored = arts.map((a) => {
    const hours = (now - new Date(a.publishedAt)) / 36e5;
    return { ...a, trend: +(((a.views || 0) + 3 * (a.likes || 0) + 2 * (a.saves || 0)) / Math.pow(hours + 2, 0.6)).toFixed(2) };
  }).sort((a, b) => b.trend - a.trend).slice(0, 15);
  res.json(decorate(scored, f));
});

router.get('/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Article not found.' });
  const a = await Article.findById(req.params.id).select('-terms').lean();
  if (!a) return res.status(404).json({ message: 'Article not found.' });
  const [idx, f] = await Promise.all([getIndex(), userFlags(req.user.id)]);
  const ids = similar(idx.vecs, a._id, 4, idx.cats);
  const docs = await Article.find({ _id: { $in: ids.map(([i]) => i) } }).select(LIST).lean();
  const sim = ids.map(([i, s]) => ({ ...docs.find((d) => String(d._id) === i), similarity: Math.min(99, Math.round(s * 100)) })).filter((d) => d._id);
  res.json({ ...decorate([a], f)[0], similar: decorate(sim, f) });
});

router.post('/:id/view', auth, async (req, res) => {
  const art = await Article.findById(req.params.id);
  if (!art) return res.status(404).json({ message: 'Article not found.' });
  const recent = await Interaction.findOne({ user: req.user.id, article: art._id, type: 'view', createdAt: { $gt: new Date(Date.now() - 30 * 60000) } });
  if (!recent) {
    await Interaction.create({ user: req.user.id, article: art._id, type: 'view' });
    await Article.updateOne({ _id: art._id }, { $inc: { views: 1 } });
    const user = await User.findById(req.user.id);
    await applySignal(user, art, W.view); await user.save();
  }
  res.json({ ok: true });
});

// Sent when the reader leaves the page. 20+ seconds counts as a real read.
router.post('/:id/read', auth, async (req, res) => {
  const dwell = Math.min(3600, Math.max(0, +req.body.dwell || 0));
  const doc = await Interaction.findOne({ user: req.user.id, article: req.params.id, type: 'view' }).sort('-createdAt');
  if (!doc) return res.json({ ok: false });
  doc.dwell = Math.max(doc.dwell, dwell);
  if (doc.dwell >= 20 && !doc.read) {
    doc.read = true;
    const [user, art] = [await User.findById(req.user.id), await Article.findById(req.params.id)];
    await applySignal(user, art, W.read); await user.save();
  }
  await doc.save();
  res.json({ ok: true });
});

const toggle = (field, type, weight, counter) => async (req, res) => {
  const [user, art] = [await User.findById(req.user.id), await Article.findById(req.params.id)];
  if (!art) return res.status(404).json({ message: 'Article not found.' });
  const has = user[field].some((i) => i.equals(art._id));
  if (has) user[field].pull(art._id); else user[field].push(art._id);
  await applySignal(user, art, has ? -weight : weight);
  if (counter) await Article.updateOne({ _id: art._id }, { $inc: { [counter]: has ? -1 : 1 } });
  if (!has) await Interaction.create({ user: user._id, article: art._id, type });
  await user.save();
  res.json({ active: !has });
};
router.post('/:id/like', auth, toggle('liked', 'like', W.like, 'likes'));
router.post('/:id/save', auth, toggle('saved', 'save', W.save, 'saves'));
router.post('/:id/dislike', auth, toggle('disliked', 'dislike', W.dislike));
module.exports = router;
