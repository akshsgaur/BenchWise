const express = require('express');
const plaidController = require('../Controllers/plaidController');

const router = express.Router();

// Plaid integration routes
router.post('/link', plaidController.createLinkToken);
router.post('/exchange', plaidController.exchangePublicToken);
router.get('/accounts', plaidController.getAccounts);
router.get('/status', plaidController.getIntegrationStatus);

module.exports = router;
