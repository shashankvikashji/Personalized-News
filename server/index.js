require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/recommendations', require('./routes/recommend'));
app.use('/api/me', require('./routes/me'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ message: 'Something went wrong on the server.' }); });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumen')
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('API running on :' + (process.env.PORT || 5000))))
  .catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
