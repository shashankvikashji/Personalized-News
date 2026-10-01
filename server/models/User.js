const { Schema, model } = require('mongoose');
const id = { type: Schema.Types.ObjectId, ref: 'Article' };
module.exports = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  interests: [String],
  onboarded: { type: Boolean, default: false },
  theme: { type: String, default: 'system' },
  profile: { type: Schema.Types.Mixed, default: {} },        // term -> weight (learned)
  categoryScores: { type: Schema.Types.Mixed, default: {} }, // category -> weight
  liked: [id], saved: [id], disliked: [id],
}, { timestamps: true, minimize: false }));
