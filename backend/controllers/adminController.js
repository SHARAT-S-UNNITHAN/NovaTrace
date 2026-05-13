const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
  try {
    const [userCount, urlCount, clickCount, activeUsers24h] = await Promise.all([
      prisma.user.count(),
      prisma.shortenedUrl.count({ where: { isDeleted: false } }),
      prisma.click.count(),
      prisma.user.count({
        where: {
          updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, username: true, createdAt: true, role: true }
    });

    res.json({
      stats: {
        totalUsers: userCount,
        totalUrls: urlCount,
        totalClicks: clickCount,
        activeUsers24h
      },
      recentUsers
    });
  } catch (err) {
    logger.error(`Admin Stats error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

/**
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = search ? {
      OR: [
        { email: { contains: search } },
        { username: { contains: search } },
        { displayName: { contains: search } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { urls: true } } }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      data: users,
      meta: {
        total,
        page: parseInt(page),
        lastPage: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error(`Admin GetUsers error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * PATCH /api/admin/users/:id/ban
 */
const toggleBanUser = async (req, res) => {
  const { id } = req.params;
  const { isBanned } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isBanned }
    });

    logger.info(`Admin ${req.user.id} ${isBanned ? 'banned' : 'unbanned'} user ${id}`);
    res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

/**
 * GET /api/admin/urls
 */
const getAllUrls = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  try {
    const where = search ? {
      OR: [
        { title: { contains: search } },
        { slug: { contains: search } },
        { originalUrl: { contains: search } }
      ]
    } : {};

    const [urls, total] = await Promise.all([
      prisma.shortenedUrl.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { 
          user: { select: { email: true, username: true } },
          _count: { select: { clicks: true } }
        }
      }),
      prisma.shortenedUrl.count({ where })
    ]);

    res.json({
      data: urls,
      meta: {
        total,
        page: parseInt(page),
        lastPage: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleBanUser,
  getAllUrls
};
