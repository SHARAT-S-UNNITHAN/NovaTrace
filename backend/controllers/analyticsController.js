const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/analytics/summary
 */
const getSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const [totalUrls, totalClicks, clicks24h] = await Promise.all([
      prisma.shortenedUrl.count({ where: { userId, isDeleted: false } }),
      prisma.click.count({ where: { url: { userId } } }),
      prisma.click.count({
        where: {
          url: { userId },
          clickedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    res.json({ totalUrls, totalClicks, clicks24h });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

/**
 * GET /api/analytics/detailed/:urlId
 */
const getDetailedAnalytics = async (req, res) => {
  const { urlId } = req.params;
  const userId = req.user.id;

  try {
    const url = await prisma.shortenedUrl.findFirst({
      where: { id: urlId, userId }
    });

    if (!url) return res.status(404).json({ error: 'URL not found' });

    const [clicks, devices, browsers, oss, countries, referers] = await Promise.all([
      prisma.click.findMany({ where: { urlId }, orderBy: { clickedAt: 'desc' }, take: 100 }),
      prisma.click.groupBy({ by: ['device'], where: { urlId }, _count: true }),
      prisma.click.groupBy({ by: ['browser'], where: { urlId }, _count: true }),
      prisma.click.groupBy({ by: ['os'], where: { urlId }, _count: true }),
      prisma.click.groupBy({ by: ['country'], where: { urlId }, _count: true }),
      prisma.click.groupBy({ by: ['referer'], where: { urlId }, _count: true }),
    ]);

    res.json({
      clicks,
      stats: {
        devices: devices.map(d => ({ name: d.device, value: d._count })),
        browsers: browsers.map(b => ({ name: b.browser, value: b._count })),
        oss: oss.map(o => ({ name: o.os, value: o._count })),
        countries: countries.map(c => ({ name: c.country, value: c._count })),
        referers: referers.map(r => ({ name: r.referer, value: r._count })),
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch detailed analytics' });
  }
};

/**
 * GET /api/analytics/public/:slug
 */
const getPublicAnalytics = async (req, res) => {
  const { slug } = req.params;

  try {
    const url = await prisma.shortenedUrl.findUnique({
      where: { slug },
      select: { id: true, originalUrl: true, createdAt: true }
    });

    if (!url) return res.status(404).json({ error: 'URL not found' });

    const [totalClicks, countries, recentClicks] = await Promise.all([
      prisma.click.count({ where: { urlId: url.id } }),
      prisma.click.groupBy({ by: ['country'], where: { urlId: url.id }, _count: true, take: 5 }),
      prisma.click.findMany({ where: { urlId: url.id }, orderBy: { clickedAt: 'desc' }, take: 5 }),
    ]);

    res.json({
      originalUrl: url.originalUrl,
      totalClicks,
      countries: countries.map(c => ({ name: c.country, value: c._count })),
      recentClicks,
      timeline: [] // Mock timeline for now
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public analytics' });
  }
};

module.exports = { getSummary, getDetailedAnalytics, getPublicAnalytics };
