const express = require('express');
const router = express.Router();
const { 
  analyzeSubscriptions, 
  getSubscriptionAnalysis, 
  getSubscriptionHistory 
} = require('../Controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// POST /api/subscriptions/analyze - Analyze subscriptions using AI
router.post('/analyze', analyzeSubscriptions);

// GET /api/subscriptions/analysis - Get latest subscription analysis
router.get('/analysis', getSubscriptionAnalysis);

// GET /api/subscriptions/history - Get subscription analysis history
router.get('/history', getSubscriptionHistory);

module.exports = router;

