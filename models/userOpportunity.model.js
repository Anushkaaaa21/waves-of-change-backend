// backend/models/userOpportunity.model.js
const mongoose = require('mongoose');

const UserOpportunitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the 'User' model (from user.model.js)
    required: true
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity', // References the 'Opportunity' model (from opportunity.model.js)
    required: true
  },
  signedUpAt: {
    type: Date,
    default: Date.now
  }
});

UserOpportunitySchema.index({ user: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('UserOpportunity', UserOpportunitySchema);