const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', workspaceController.getWorkspaces);
router.post('/', workspaceController.createWorkspace);

module.exports = router;
