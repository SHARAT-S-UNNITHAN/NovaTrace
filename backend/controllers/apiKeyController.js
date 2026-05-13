const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateApiKey } = require('../utils/slugGenerator');

/**
 * POST /api/keys - Generate new API key
 */
const createApiKey = async (req, res) => {
  const { name, expiresAt } = req.body;
  try {
    const rawKey = generateApiKey('live');
    const keyPrefix = rawKey.substring(0, 12);
    const keyHash = await bcrypt.hash(rawKey, 10);

    const apiKey = await prisma.apiKey.create({
      data: {
        name: name || 'Default Key',
        keyPrefix,
        keyHash,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // ONLY SHOWN ONCE
      message: 'Please copy this key and store it securely. It will not be shown again.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate API key' });
  }
};

/**
 * GET /api/keys - List keys
 */
const getApiKeys = async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user.id },
      select: {
        id: true, name: true, keyPrefix: true, lastUsedAt: true,
        expiresAt: true, requestCount: true, isActive: true, createdAt: true,
      },
    });
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
};

/**
 * DELETE /api/keys/:id - Revoke key
 */
const deleteApiKey = async (req, res) => {
  try {
    await prisma.apiKey.delete({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'API key revoked successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
};

module.exports = { createApiKey, getApiKeys, deleteApiKey };
