const { Schema, model } = require('mongoose');
module.exports = model('Article', new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: String,
  summary: [String],
  keywords: [String],
  terms: { type: Schema.Types.Mixed, default: {} },
  sentiment: { score: Number, label: String },
  readingTime: Number,
  category: { type: String, required: true, index: true },
  source: { type: String, default: 'Lumen Wire' },
  url: { type: String, index: { unique: true, sparse: true } },
  image: String,
  publishedAt: { type: Date, default: Date.now, index: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
}, { timestamps: true, minimize: false }));
