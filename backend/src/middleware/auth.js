const jwt = require('jsonwebtoken');

// JWT auth middleware
// Expected header: Authorization: Bearer <token>
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing Bearer token' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = {
      id: decoded?.id,
      role: decoded?.role,
      tenantId: decoded?.tenantId || 'default',
    };

    if (!user.id || !user.role) {
      return res.status(401).json({ success: false, message: 'Invalid token claims' });
    }

    // Existing code expects `req.admin` for authorizing role-gated admin routes.
    req.user = user;
    req.admin = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', status: 401, success: false, message: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid or expired token', status: 401, success: false, message: 'Invalid or expired token' });
  }
};

const protect = authenticate;
const protectUser = authenticate;
const protectAny = authenticate;

module.exports = { authenticate, protect, protectUser, protectAny };
