const mongoose = require('mongoose');

// Define sub-schemas for better structure
const accountSchema = new mongoose.Schema({
  accountId: { type: String, required: false },
  name: { type: String, required: false },
  type: { type: String, required: false },
  subtype: { type: String, required: false },
  balance: {
    available: { type: Number, required: false },
    current: { type: Number, required: false }
  },
  mask: { type: String, required: false }
}, { _id: false });

const bankConnectionSchema = new mongoose.Schema({
  accessToken: { type: String, required: false },
  itemId: { type: String, required: false },
  institutionId: { type: String, required: false },
  institutionName: { type: String, required: false },
  lastSync: { type: Date, default: Date.now },
  accounts: [accountSchema]
}, { _id: false });

const integrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  plaid: {
    isIntegrated: {
      type: Boolean,
      default: false
    },
    bankConnections: [bankConnectionSchema]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
integrationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Integration', integrationSchema);