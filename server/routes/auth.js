const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Article = require('../models/Article');
const { auth } = require('../middleware/auth');
const { getIndex } = require('../recommender/store');
const { seedProfile } = require('../recommender/engine');
const { CATS } = require('../utils/constants');

const sign = (u) => jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, interests: u.interests, onboarded: u.onboarded, theme: u.theme });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Enter your name, a valid email and a password of at least 6 characters.' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'That email is already registered. Try signing in instead.' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.json({ token: sign(user), user: pub(user) });
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.json({ token: sign(user), user: pub(user) });
});

router.get('/me', auth, async (req, res) => res.json(pub(await User.findById(req.user.id))));

router.patch('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const { name, theme, interests, onboarded } = req.body;
  if (name) user.name = name;
  if (theme) user.theme = theme;
  if (typeof onboarded === 'boolean') user.onboarded = onboarded;
  if (Array.isArray(interests)) {
    const next = interests.filter((c) => CATS.includes(c));
    const added = next.filter((c) => !user.interests.includes(c));
    const removed = user.interests.filter((c) => !next.includes(c));
    const [idx, arts] = [await getIndex(), await Article.find().select('category').lean()];
    const seed = seedProfile(idx.vecs, arts, added);
    const profile = { ...(user.profile || {}) };
    for (const t in seed) profile[t] = (profile[t] || 0) + seed[t];
    const cs = { ...(user.categoryScores || {}) };
    added.forEach((c) => { cs[c] = (cs[c] || 0) + 5; });
    removed.forEach((c) => { cs[c] = (cs[c] || 0) - 5; });
    user.interests = next; user.profile = profile; user.categoryScores = cs;
    user.markModified('profile'); user.markModified('categoryScores');
  }
  await user.save();
  res.json(pub(user));
});

router.post('/reset-personalization', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.profile = {}; user.categoryScores = {}; user.disliked = []; user.interests = []; user.onboarded = false;
  user.markModified('profile'); user.markModified('categoryScores');
  await user.save();
  res.json(pub(user));
});
module.exports = router;
