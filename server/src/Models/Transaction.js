const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  institutionId: {
    type: String,
    required: true,
    index: true
  },
  transaction_id: {
    type: String,
    required: true,
    unique: true
  },
  account_id: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  merchant_name: {
    type: String
  },
  category: {
    type: [String],
    default: []
  },
  subcategory: {
    type: [String],
    default: []
  },
  account_owner: {
    type: String
  },
  iso_currency_code: {
    type: String,
    default: 'USD'
  },
  unofficial_currency_code: {
    type: String
  },
  // Track when this transaction was synced from Plaid
  syncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, institutionId: 1, date: -1 });
transactionSchema.index({ userId: 1, account_id: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);

