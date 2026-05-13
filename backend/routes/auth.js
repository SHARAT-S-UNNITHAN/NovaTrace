const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', [
  body('email').isEmail().withMessage('Invalid email'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 chars'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 chars'),
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').exists().withMessage('Password required'),
], authController.login);

router.post('/refresh', authController.refresh);

router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.changePassword);

module.exports = router;
