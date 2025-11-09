// backend/routes/userOpportunities.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserOpportunity = require('../models/userOpportunity.model');
const Opportunity = require('../models/opportunity.model'); // Needed to validate opportunity exists

// @route   POST /api/user-opportunities
// @desc    Sign up a user for a volunteer opportunity
// @access  Private
router.post('/', auth, async (req, res) => {
  const { opportunityId } = req.body;
  const userId = req.user.id; // User ID comes from the auth middleware

  if (!opportunityId) {
    return res.status(400).json({ msg: 'Opportunity ID is required' });
  }

  try {
    // 1. Check if the opportunity exists
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ msg: 'Volunteer opportunity not found' });
    }

    // 2. Check if the user is already signed up for this opportunity
    let userOpportunity = await UserOpportunity.findOne({ user: userId, opportunity: opportunityId });
    if (userOpportunity) {
      return res.status(400).json({ msg: 'You have already signed up for this opportunity' });
    }

    // 3. Create a new user-opportunity record
    userOpportunity = new UserOpportunity({
      user: userId,
      opportunity: opportunityId
    });

    await userOpportunity.save();

    res.status(201).json({ msg: 'Successfully signed up for the opportunity', userOpportunity });

  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) { // MongoDB duplicate key error (for unique index)
        return res.status(400).json({ msg: 'You have already signed up for this opportunity (duplicate key error)' });
    }
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ msg: 'Invalid Opportunity ID format' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/user-opportunities/me
// @desc    Get all opportunities a specific user has signed up for
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const userOpportunities = await UserOpportunity.find({ user: req.user.id })
      .populate('opportunity', ['title', 'description', 'location', 'duration', 'volunteersNeeded']); // Populate with relevant opportunity fields

    res.json(userOpportunities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;