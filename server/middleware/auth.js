// Auth middleware — protects API routes by requiring a valid Bearer token
function authMiddleware(sessions) {
  return (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !sessions[token]) {
      return res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }

    // Attach user info to request
    req.user = sessions[token];
    next();
  };
}

module.exports = authMiddleware;
