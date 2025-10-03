const express = require('express');
const { authenticateToken } = require('../../middleware/auth');
const {
  getMonthlyAnalysis,
  getPersonalizedAdvice,
  getHistoricalAnalyses,
  getBatchInsights
} = require('../../Controllers/v1/aiAnalysisController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/v1/analysis/monthly?month=10&year=2025
router.get('/monthly', getMonthlyAnalysis);

// POST /api/v1/analysis/advice
router.post('/advice', getPersonalizedAdvice);

// GET /api/v1/analysis/history?limit=12
router.get('/history', getHistoricalAnalyses);

// GET /api/v1/analysis/insights?startDate=2025-09-01&endDate=2025-10-03
router.get('/insights', getBatchInsights);

module.exports = router;
