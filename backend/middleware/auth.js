const jwt = require('jsonwebtoken');

function getBearerToken(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function requireAuth() {
  return async (req, res, next) => {
    try {
      const token = getBearerToken(req);
      if (!token) return res.status(401).json({ message: 'Missing token' });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const query = req.app.locals.query;
      const db = req.app.locals.db;

      const rows = await query(db, 'SELECT id, full_name, email, role FROM users WHERE id = ? LIMIT 1', [payload.id]);
      if (!Array.isArray(rows) || rows.length === 0) return res.status(401).json({ message: 'Invalid token' });

      req.user = {
        id: rows[0].id,
        fullName: rows[0].full_name,
        email: rows[0].email,
        role: rows[0].role
      };

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
