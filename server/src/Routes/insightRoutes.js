const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const insightController = require('../Controllers/insightController');

router.get('/latest', authenticateToken, insightController.getLatestInsight);
router.get('/dashboard', authenticateToken, insightController.getDashboardOverview);

module.exports = router;
