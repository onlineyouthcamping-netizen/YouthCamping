// AUTH BYPASSED FOR DEVELOPMENT
const authenticate = (req, res, next) => {
  // Always grant access and mock a default tenant
  req.user = { id: 'dev_user', role: 'admin', tenantId: 'default' };
  req.admin = { id: 'dev_admin', role: 'admin', name: 'Dev Admin', tenantId: 'default' };
  next();
};

const protect = authenticate;
const protectUser = authenticate;
const protectAny = authenticate;

module.exports = { authenticate, protect, protectUser, protectAny };
