const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const integrationController = require('../Controllers/integrationController');

const router = express.Router();

// Integration status routes
router.get('/status', authenticateToken, integrationController.getIntegrationStatus);
router.get('/accounts', authenticateToken, integrationController.getAccounts);
router.get('/bank-connection/:institutionId', authenticateToken, integrationController.getBankConnection);

// Token exchange route (handles the complete flow)
router.post('/exchange', authenticateToken, integrationController.exchangeTokenAndManageIntegration);

// Transactions route (through integration)
router.post('/transactions', authenticateToken, integrationController.getTransactions);

module.exports = router;
