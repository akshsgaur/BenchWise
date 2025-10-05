const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const plaidController = require('../Controllers/plaidController');

const router = express.Router();

// Pure Plaid API routes
router.post('/link', authenticateToken, plaidController.createLinkToken);
router.post('/exchange', authenticateToken, plaidController.exchangePublicToken);
router.post('/transactions', authenticateToken, plaidController.getTransactions);
router.post('/accounts', authenticateToken, plaidController.getPlaidAccounts);

module.exports = router;
