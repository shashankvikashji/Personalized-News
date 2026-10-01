const router = require('express').Router();
const Parser = require('rss-parser');
const Article = require('../models/Article');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const { auth, adminOnly } = require('../middleware/auth');
const { buildArticle } = require('../utils/articleBuilder');
const { invalidate } = require('../recommender/store');
const { CATS } = require('../utils/constants');

router.use(auth, adminOnly);

router.get('/stats', async (_req, res) => {
  const [users, articles, interactions, byCat, top, recentUsers, recent] = await Promise.all([
    User.countDocuments(), Article.countDocuments(), Interaction.countDocuments(),
    Article.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } }, { $sort: { views: -1 } }]),
    Article.find().sort('-views').limit(5).select('title views likes saves category').lean(),
    User.find().sort('-createdAt').limit(5).select('name email createdAt role').lean(),
    Interaction.find({ createdAt: { $gt: new Date(Date.now() - 14 * 864e5) } }).select('createdAt').lean()]);
  const days = {}; recent.forEach((r) => { const d = r.createdAt.toISOString().slice(0, 10); days[d] = (days[d] || 0) + 1; });
  const activity = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5); return { label: d.toLocaleDateString('en', { weekday: 'short' }), value: days[d.toISOString().slice(0, 10)] || 0 }; });
  res.json({ users, articles, interactions, byCategory: byCat.map((c) => ({ label: c._id, value: c.views, count: c.count })), top, recentUsers, activity });
});

router.get('/articles', async (_req, res) => res.json(await Article.find().sort('-publishedAt').select('title category source views likes saves publishedAt sentiment').lean()));

router.post('/articles', async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content || content.length < 80 || !CATS.includes(category)) return res.status(400).json({ message: 'Add a title, a category and at least 80 characters of article text.' });
  const a = await Article.create(buildArticle(req.body));
  invalidate();
  res.json(a);
});

router.delete('/articles/:id', async (req, res) => { await Article.findByIdAndDelete(req.params.id); invalidate(); res.json({ ok: true }); });

const strip = (h = '') => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
router.post('/ingest', async (req, res) => {
  const { url, category } = req.body;
  if (!url || !CATS.includes(category)) return res.status(400).json({ message: 'Enter an RSS feed URL and choose a category.' });
  let feed;
  try { feed = await new Parser({ timeout: 10000 }).parseURL(url); }
  catch { return res.status(400).json({ message: 'Could not read that feed. Check the URL and your internet connection.' }); }
  let added = 0;
  for (const it of feed.items.slice(0, 20)) {
    const content = strip(it['content:encoded'] || it.content || it.contentSnippet || '');
    if (!it.title || content.length < 80 || (it.link && await Article.exists({ url: it.link }))) continue;
    await Article.create(buildArticle({ title: it.title, content, category, source: feed.title, url: it.link, publishedAt: it.isoDate ? new Date(it.isoDate) : new Date() }));
    added++;
  }
  invalidate();
  res.json({ added, scanned: feed.items.length });
});
module.exports = router;
