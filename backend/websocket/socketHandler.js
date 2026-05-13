const logger = require('../utils/logger');
const { verifyAccessToken } = require('../utils/jwt');

const setupSocketIO = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        socket.userId = decoded.userId;
        return next();
      } catch (err) {
        logger.warn('Socket authentication failed:', err.message);
        // We still allow connection for public features, or we could call next(new Error('...'))
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userId || 'Guest'})`);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      logger.debug(`User ${socket.userId} joined their private room`);
    }

    socket.on('join:url', (urlId) => {
      socket.join(`url:${urlId}`);
      logger.debug(`Socket ${socket.id} joined room for URL: ${urlId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocketIO };
