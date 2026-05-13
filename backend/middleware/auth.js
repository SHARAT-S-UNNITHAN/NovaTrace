const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Protect routes - requires valid JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        plan: true,
        isBanned: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    logger.error(`Auth error: ${err.message}`);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Authorize roles
 * @param {...string} roles 
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};

/**
 * API Key authentication middleware
 */
const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const matchedKey = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true },
    });

    if (!matchedKey || matchedKey.user.isBanned) {
      return res.status(401).json({ error: 'Invalid or revoked API key' });
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: matchedKey.id },
      data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
    });

    req.user = matchedKey.user;
    req.apiKey = matchedKey;
    next();
  } catch (err) {
    logger.error(`API Key Auth error: ${err.message}`);
    return res.status(500).json({ error: 'API key validation failed' });
  }
};

/**
 * Optional auth - attaches user if token present but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user && !user.isBanned) req.user = user;
    }
  } catch (_) {}
  next();
};

module.exports = { authenticate, authorize, authenticateApiKey, optionalAuth };
