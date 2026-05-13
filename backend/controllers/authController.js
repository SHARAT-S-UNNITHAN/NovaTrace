const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, username, password, displayName } = req.body;
  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      return res.status(409).json({ error: `This ${field} is already taken` });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, username, passwordHash, displayName: displayName || username },
    });

    // Create default workspace
    await prisma.workspace.create({
      data: {
        name: `${user.displayName}'s Workspace`,
        slug: `${username}-workspace`,
        ownerId: user.id,
      },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'REGISTER', resource: 'user', ipAddress: req.ip },
    });

    logger.info(`New user registered: ${email}`);
    res.status(201).json({
      message: 'Account created successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (err) {
    logger.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ error: 'Account suspended' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', resource: 'session', ipAddress: req.ip },
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user?.isActive) return res.status(401).json({ error: 'User not found' });
    const tokens = generateTokens(user.id);
    res.json(tokens);
  } catch (_) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, username: true, displayName: true,
        avatarUrl: true, role: true, plan: true, isVerified: true,
        twoFAEnabled: true, createdAt: true, lastLoginAt: true,
        _count: { select: { urls: true, apiKeys: true } },
      },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  const { displayName, username } = req.body;
  try {
    if (username && username !== req.user.username) {
      const exists = await prisma.user.findUnique({ where: { username } });
      if (exists) return res.status(409).json({ error: 'Username already taken' });
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { displayName, username },
      select: { id: true, email: true, username: true, displayName: true, avatarUrl: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * PUT /api/auth/password
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = { register, login, refresh, getMe, updateProfile, changePassword };
