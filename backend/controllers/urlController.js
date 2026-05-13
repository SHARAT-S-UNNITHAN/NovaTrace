const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const { generateSlug } = require('../utils/slugGenerator');
const logger = require('../utils/logger');

/**
 * POST /api/urls - Create short URL
 */
const createUrl = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const {
    originalUrl, slug: customSlug, title, description, password,
    expiresAt, utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
    tags, workspaceId,
  } = req.body;

  try {
    let slug = customSlug;
    if (slug) {
      const exists = await prisma.shortenedUrl.findUnique({ where: { slug } });
      if (exists) return res.status(409).json({ error: 'This alias is already taken' });
    } else {
      do { slug = generateSlug(7); }
      while (await prisma.shortenedUrl.findUnique({ where: { slug } }));
    }

    let passwordHash = null;
    if (password) passwordHash = await bcrypt.hash(password, 10);

    const url = await prisma.shortenedUrl.create({
      data: {
        originalUrl, slug, title, description, password: passwordHash,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
        tags: tags ? JSON.stringify(tags) : null,
        workspaceId,
        userId: req.user.id,
      },
    });

    // Emit realtime event
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${req.user.id}`).emit('url:created', {
        id: url.id, slug: url.slug, originalUrl: url.originalUrl,
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id, action: 'CREATE', resource: 'url',
        resourceId: url.id, newValue: JSON.stringify({ slug, originalUrl }),
        ipAddress: req.ip,
      },
    });

    res.status(201).json({
      ...url,
      shortUrl: `${process.env.SHORT_URL_BASE}/${slug}`,
    });
  } catch (err) {
    logger.error('Create URL error:', err);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
};

/**
 * GET /api/urls - List user's URLs
 */
const getUrls = async (req, res) => {
  const {
    page = 1, limit = 20, search, status, workspaceId,
    sortBy = 'createdAt', sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = { userId: req.user.id };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
      { originalUrl: { contains: search } },
    ];
  }
  if (status === 'active') where.isActive = true;
  if (status === 'expired') where.expiresAt = { lt: new Date() };
  if (status === 'protected') where.password = { not: null };
  if (workspaceId) where.workspaceId = workspaceId;

  try {
    const [urls, total] = await Promise.all([
      prisma.shortenedUrl.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { clicks: true } } },
      }),
      prisma.shortenedUrl.count({ where }),
    ]);

    res.json({
      data: urls.map(u => ({
        ...u,
        shortUrl: `${process.env.SHORT_URL_BASE}/${u.slug}`,
        password: !!u.password,
        tags: u.tags ? JSON.parse(u.tags) : [],
      })),
      pagination: {
        page: parseInt(page), limit: parseInt(limit),
        total, pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    logger.error('Get URLs error:', err);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
};

/**
 * GET /api/urls/:id - Get single URL with stats
 */
const getUrl = async (req, res) => {
  try {
    const url = await prisma.shortenedUrl.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        _count: { select: { clicks: true } },
        clicks: {
          take: 10,
          orderBy: { clickedAt: 'desc' },
          select: { country: true, device: true, browser: true, clickedAt: true },
        },
      },
    });
    if (!url) return res.status(404).json({ error: 'URL not found' });
    res.json({ ...url, shortUrl: `${process.env.SHORT_URL_BASE}/${url.slug}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch URL' });
  }
};

/**
 * PUT /api/urls/:id - Update URL
 */
const updateUrl = async (req, res) => {
  const { title, description, originalUrl, isActive, expiresAt, tags } = req.body;
  try {
    const existing = await prisma.shortenedUrl.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'URL not found' });

    const url = await prisma.shortenedUrl.update({
      where: { id: req.params.id },
      data: {
        title, description, originalUrl, isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : existing.expiresAt,
        tags: tags ? JSON.stringify(tags) : existing.tags,
      },
    });

    const io = req.app.get('io');
    if (io) io.to(`user:${req.user.id}`).emit('url:updated', { id: url.id });

    res.json({ ...url, shortUrl: `${process.env.SHORT_URL_BASE}/${url.slug}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update URL' });
  }
};

/**
 * DELETE /api/urls/:id
 */
const deleteUrl = async (req, res) => {
  try {
    const existing = await prisma.shortenedUrl.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'URL not found' });

    await prisma.shortenedUrl.delete({ where: { id: req.params.id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id, action: 'DELETE', resource: 'url',
        resourceId: req.params.id, oldValue: JSON.stringify({ slug: existing.slug }),
      },
    });

    res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete URL' });
  }
};

/**
 * POST /api/urls/bulk - Bulk create URLs
 */
const bulkCreate = async (req, res) => {
  const { urls } = req.body;
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'URLs array required' });
  }
  if (urls.length > 100) {
    return res.status(400).json({ error: 'Maximum 100 URLs per bulk request' });
  }

  try {
    const results = await Promise.allSettled(
      urls.map(async ({ originalUrl, slug: customSlug, title }) => {
        let slug = customSlug;
        if (!slug) {
          do { slug = generateSlug(7); }
          while (await prisma.shortenedUrl.findUnique({ where: { slug } }));
        }
        return prisma.shortenedUrl.create({
          data: { originalUrl, slug, title, userId: req.user.id },
        });
      })
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').map(r => ({
      ...r.value, shortUrl: `${process.env.SHORT_URL_BASE}/${r.value.slug}`,
    }));
    const failed = results.filter(r => r.status === 'rejected').length;

    res.status(201).json({ created: succeeded.length, failed, data: succeeded });
  } catch (err) {
    res.status(500).json({ error: 'Bulk creation failed' });
  }
};

module.exports = { createUrl, getUrls, getUrl, updateUrl, deleteUrl, bulkCreate };
