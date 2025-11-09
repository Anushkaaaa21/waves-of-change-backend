const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  user: {
    
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (if the donation is by a logged-in user)
    default: null // Allow anonymous donations
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required.'],
    min: [1, 'Donation amount must be at least $1.']
  },
  currency: {
    type: String,
    default: 'USD' // You can expand this if you handle multiple currencies
  },
  paymentIntentId: { // To store a reference from your payment gateway (e.g., Stripe, PayPal)
    type: String,
    default: null
  },
  status: { // e.g., 'pending', 'completed', 'failed'
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed' // For simplicity, we'll assume completed for now
  },
  donatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', DonationSchema);