const { getIndex } = require('./store');
const { updateProfile } = require('./engine');

exports.W = { view: 1, read: 2, like: 3, save: 3, dislike: -3 };

// Learn from one interaction: nudges the term profile and the category affinity.
exports.applySignal = async (user, article, weight) => {
  const idx = await getIndex();
  const vec = idx.vecs.get(String(article._id));
  if (vec) user.profile = updateProfile(user.profile || {}, vec, weight);
  const cs = { ...(user.categoryScores || {}) };
  cs[article.category] = (cs[article.category] || 0) + weight;
  user.categoryScores = cs;
  user.markModified('profile');
  user.markModified('categoryScores');
};
