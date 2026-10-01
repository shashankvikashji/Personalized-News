const router = require('express').Router();
const User = require('../models/User');
const Article = require('../models/Article');
const Interaction = require('../models/Interaction');
const { auth } = require('../middleware/auth');
const { getIndex } = require('../recommender/store');
const { userFlags, decorate } = require('../utils/flags');

router.get('/saved', auth, async (req, res) => {
  const u = await User.findById(req.user.id).select('saved');
  const [items, f] = await Promise.all([Article.find({ _id: { $in: u.saved } }).select('-content -terms').lean(), userFlags(req.user.id)]);
  res.json(decorate(items, f));
});

router.get('/history', auth, async (req, res) => {
  const [rows, f] = await Promise.all([
    Interaction.find({ user: req.user.id, type: 'view' }).sort('-createdAt').limit(100).populate('article', '-content -terms').lean(), userFlags(req.user.id)]);
  res.json(rows.filter((r) => r.article).map((r) => ({ _id: r._id, at: r.createdAt, dwell: r.dwell, read: r.read, article: decorate([r.article], f)[0] })));
});
router.delete('/history', auth, async (req, res) => { await Interaction.deleteMany({ user: req.user.id, type: 'view' }); res.json({ ok: true }); });

router.get('/insights', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const [views, idx] = await Promise.all([Interaction.find({ user: user._id, type: 'view' }).populate('article', 'category sentiment').lean(), getIndex()]);
  const day = (d) => new Date(d).toISOString().slice(0, 10);
  const days = {}; views.forEach((v) => { days[day(v.createdAt)] = (days[day(v.createdAt)] || 0) + 1; });
  const activity = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5); return { label: d.toLocaleDateString('en', { weekday: 'short' }), date: day(d), value: days[day(d)] || 0 }; });
  let streak = 0; for (let i = 0; i < 365; i++) { if (days[day(new Date(Date.now() - i * 864e5))]) streak++; else if (i > 0) break; }
  const byCat = {}, sent = { positive: 0, neutral: 0, negative: 0 };
  views.forEach((v) => { if (!v.article) return; byCat[v.article.category] = (byCat[v.article.category] || 0) + 1; if (v.read) sent[v.article.sentiment?.label || 'neutral']++; });
  const terms = Object.entries(user.profile || {}).filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([s, w]) => ({ label: idx.stemWord[s] || s, value: +w.toFixed(2) }));
  const cats = Object.entries(user.categoryScores || {}).filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value: +value.toFixed(1) }));
  res.json({
    totals: { views: views.length, read: views.filter((v) => v.read).length, minutes: Math.round(views.reduce((s, v) => s + v.dwell, 0) / 60), likes: user.liked.length, saved: user.saved.length, streak },
    activity, categories: Object.entries(byCat).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value), sentiment: sent, terms, affinity: cats,
  });
});
module.exports = router;
