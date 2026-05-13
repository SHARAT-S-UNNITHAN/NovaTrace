const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', [
  body('originalUrl').isURL().withMessage('Invalid URL'),
  body('slug').optional().isAlphanumeric().withMessage('Slug must be alphanumeric'),
], urlController.createUrl);

router.get('/', urlController.getUrls);
router.get('/:id', urlController.getUrl);
router.put('/:id', urlController.updateUrl);
router.delete('/:id', urlController.deleteUrl);
router.post('/bulk', urlController.bulkCreate);

module.exports = router;
