const jwt = require('jsonwebtoken');
exports.auth = (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET || 'dev-secret'); next(); }
  catch { res.status(401).json({ message: 'Please sign in again.' }); }
};
exports.adminOnly = (req, res, next) => (req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only.' }));
