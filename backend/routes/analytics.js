const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.get('/public/:slug', analyticsController.getPublicAnalytics);

router.use(authenticate);

router.get('/summary', analyticsController.getSummary);
router.get('/detailed/:urlId', analyticsController.getDetailedAnalytics);

module.exports = router;
