const User = require('../models/User');
exports.userFlags = async (id) => {
  const u = await User.findById(id).select('saved liked disliked');
  return { saved: new Set(u.saved.map(String)), liked: new Set(u.liked.map(String)), disliked: new Set(u.disliked.map(String)) };
};
exports.decorate = (items, f) => items.map((i) => ({ ...i, saved: f.saved.has(String(i._id)), liked: f.liked.has(String(i._id)) }));
