const router = require('express').Router();
const Article = require('../models/Article');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const { auth } = require('../middleware/auth');
const { getIndex } = require('../recommender/store');
const { rank } = require('../recommender/engine');
const { userFlags, decorate } = require('../utils/flags');

router.get('/', auth, async (req, res) => {
  const [user, arts, idx, f] = await Promise.all([
    User.findById(req.user.id), Article.find().select('-content -terms').lean(), getIndex(), userFlags(req.user.id)]);
  const seen = new Set((await Interaction.distinct('article', { user: user._id, type: 'view' })).map(String));
  const out = rank({ articles: arts, vecs: idx.vecs, profile: user.profile || {}, catScores: user.categoryScores || {}, seen, disliked: f.disliked });
  let items = out.items;
  if (req.query.category && req.query.category !== 'All') items = items.filter((i) => i.category === req.query.category);
  const profileTerms = Object.entries(user.profile || {}).filter(([, v]) => v > 0.05).sort((a, b) => b[1] - a[1])
    .map(([s]) => idx.stemWord[s]).filter(Boolean).slice(0, 8);
  res.json({ cold: out.cold, profileTerms, items: decorate(items.slice(0, 30), f) });
});
module.exports = router;
