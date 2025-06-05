const verifyToken = (req, res, next) => {

  if (req.session && req.session.user) {
    req.user = req.session.user; // attach session user to request
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized - Session required' });
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session?.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: 'Forbidden - Role required' });
    }
    next();
  };
};

module.exports = {
  verifyToken,   // ✅ same name, different logic
  requireRole
};