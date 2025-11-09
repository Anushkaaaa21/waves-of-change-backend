// backend/routes/opportunities.js
const express = require('express');
const router = express.Router();
// Ensure this imports the correct model for the opportunities list
const Opportunity = require('../models/opportunity.model'); // <--- THIS MUST BE 'opportunity.model'

// @route   GET /api/opportunities
// @desc    Get all volunteer opportunities
// @access  Public (can be viewed by anyone)
router.get('/', async (req, res) => {
  try {
    console.log("--- Opportunity Fetch Request Received (All Opportunities) ---");
    console.log(`Model name being used: "${Opportunity.modelName}"`); // Expected: "Opportunity"
    console.log(`Attempting to query collection: "${Opportunity.collection.name}"`); // Expected: "opportunities"

    const opportunities = await Opportunity.find().sort({ dateCreated: -1 });

    console.log(`Successfully found ${opportunities.length} opportunities.`);
    res.json(opportunities);
  } catch (err) {
    console.error("--- Error in /api/opportunities Route ---");
    console.error("Error fetching opportunities:", err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;