require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Article = require('./models/Article');
const Interaction = require('./models/Interaction');
const { buildArticle } = require('./utils/articleBuilder');
const { getIndex, invalidate } = require('./recommender/store');
const { seedProfile } = require('./recommender/engine');
const rows = require('./data/articles');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumen');
  await Promise.all([Article.deleteMany({}), Interaction.deleteMany({})]);
  const docs = rows.map(([category, title, content], i) => ({
    ...buildArticle({ title, content, category }),
    publishedAt: new Date(Date.now() - (i * 5 + (i % 3) * 2) * 36e5),
    views: 20 + ((i * 37) % 180), likes: (i * 11) % 40, saves: (i * 7) % 25,
  }));
  await Article.insertMany(docs); invalidate();
  const pw = (p) => bcrypt.hash(p, 10);
  await User.deleteMany({ email: { $in: ['admin@lumen.dev', 'demo@lumen.dev'] } });
  await User.create({ name: 'Admin', email: 'admin@lumen.dev', password: await pw('admin123'), role: 'admin', onboarded: true });
  const arts = await Article.find().select('category').lean();
  const idx = await getIndex();
  const interests = ['Technology', 'Science'];
  await User.create({ name: 'Demo Reader', email: 'demo@lumen.dev', password: await pw('demo123'), interests, onboarded: true,
    profile: seedProfile(idx.vecs, arts, interests), categoryScores: { Technology: 5, Science: 5 } });
  console.log(`Seeded ${docs.length} articles.\nAdmin: admin@lumen.dev / admin123\nDemo:  demo@lumen.dev / demo123`);
  process.exit(0);
})();
