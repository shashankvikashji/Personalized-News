const { Schema, model } = require('mongoose');
module.exports = model('Interaction', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  article: { type: Schema.Types.ObjectId, ref: 'Article' },
  type: { type: String, enum: ['view', 'like', 'save', 'dislike'] },
  dwell: { type: Number, default: 0 }, // seconds spent reading
  read: { type: Boolean, default: false },
}, { timestamps: true }));
