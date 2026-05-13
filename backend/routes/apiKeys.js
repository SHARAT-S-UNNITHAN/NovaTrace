const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', apiKeyController.createApiKey);
router.get('/', apiKeyController.getApiKeys);
router.delete('/:id', apiKeyController.deleteApiKey);

module.exports = router;
