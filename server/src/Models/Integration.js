const mongoose = require('mongoose');

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
    accessToken: {
      type: String,
      default: null
    },
    itemId: {
      type: String,
      default: null
    },
    institutionId: {
      type: String,
      default: null
    },
    institutionName: {
      type: String,
      default: null
    },
    lastSync: {
      type: Date,
      default: null
    },
    accounts: [{
      accountId: String,
      name: String,
      type: String,
      subtype: String,
      balance: {
        available: Number,
        current: Number
      },
      mask: String
    }]
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
