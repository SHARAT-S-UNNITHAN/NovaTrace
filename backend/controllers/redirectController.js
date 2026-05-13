const prisma = require('../config/database');
const logger = require('../utils/logger');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

/**
 * GET /r/:slug - Handle short URL redirection with advanced analytics
 */
const handleRedirect = async (req, res) => {
  const { slug } = req.params;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const referer = req.headers['referer'] || 'Direct';

  try {
    const url = await prisma.shortenedUrl.findUnique({
      where: { slug },
      include: { workspace: true }
    });

    if (!url || !url.isActive || url.isDeleted) {
      return res.status(404).send('URL not found or inactive');
    }

    // Check expiry
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).send('This link has expired');
    }

    // Parse User Agent
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();
    
    // Parse GeoIP
    const geo = geoip.lookup(ip);

    // Track click asynchronously
    prisma.click.create({
      data: {
        urlId: url.id,
        ip,
        userAgent,
        referer,
        device: uaResult.device.type || 'desktop',
        browser: uaResult.browser.name || 'Unknown',
        os: uaResult.os.name || 'Unknown',
        country: geo?.country || 'Unknown',
        city: geo?.city || 'Unknown',
      }
    }).then(() => {
      // Emit realtime update via socket.io (will be handled in server.js)
      if (global.io) {
        global.io.to(`url_${url.id}`).emit('new_click', {
          urlId: url.id,
          timestamp: new Date()
        });
      }
    }).catch(err => logger.error(`Click track error: ${err.message}`));

    // Handle password protection
    if (url.password) {
      // For simplicity in this demo, we'll redirect to a password page on the frontend
      // In a real app, you'd handle this via a session or cookie
      return res.redirect(`${process.env.FRONTEND_URL}/p/${slug}`);
    }

    // Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (err) {
    logger.error(`Redirect error: ${err.message}`);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { handleRedirect };
