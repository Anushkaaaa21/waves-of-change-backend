// backend/routes/donations.js

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); // For input validation
const auth = require('../middleware/auth'); // Path to your authentication middleware

// Import your Mongoose models
const Donation = require('../models/Donations');
const User = require('../models/user.model'); // Import User model if you need to interact with it directly here

// @route   GET api/donations
// @desc    Get all donations
// @access  Public (or Private if you add 'auth' middleware)
router.get('/', async (req, res) => {
    try {
        const donations = await Donation.find()
                                        // Use populate to replace the 'user' ObjectId with the actual user document
                                        // We select 'username' and 'fullName' fields from the User model
                                        .populate('user', 'username fullName')
                                        .sort({ donatedAt: -1 }); // Sort by most recent donations

        res.json(donations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/donations/:id
// @desc    Get donation by ID
// @access  Public (or Private)
router.get('/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
                                        // Populate for a single donation as well
                                        .populate('user', 'firstName lastName fullName email') ;

        if (!donation) {
            return res.status(404).json({ msg: 'Donation not found' });
        }

        res.json(donation);
    } catch (err) {
        console.error(err.message);
        // Check if the error is due to an invalid ObjectId format
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Donation not found' });
        }
        res.status(500).send('Server Error');
    }
});


// @route   POST api/donations
// @desc    Create a donation
// @access  Private (requires authentication)
router.post(
    '/',
    [
        auth, // Apply authentication middleware
        [
            check('amount', 'Amount is required and must be a number').isNumeric(),
            check('currency', 'Currency is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { amount, currency, paymentIntentId, status } = req.body;

            // Assuming req.user.id is set by your 'auth' middleware
            const newDonation = new Donation({
                user: req.user.id,
                amount,
                currency,
                paymentIntentId,
                status
            });

            const donation = await newDonation.save();
            res.json(donation);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT api/donations/:id
// @desc    Update a donation by ID
// @access  Private (requires authentication and ownership/admin rights)
router.put(
    '/:id',
    [
        auth, // Apply authentication middleware
        [
            check('amount', 'Amount must be a number').optional().isNumeric(),
            check('currency', 'Currency is required').optional().not().isEmpty(),
            check('status', 'Invalid status').optional().isIn(['pending', 'completed', 'failed'])
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { amount, currency, paymentIntentId, status } = req.body;

        // Build donation object
        const donationFields = {};
        if (amount) donationFields.amount = amount;
        if (currency) donationFields.currency = currency;
        if (paymentIntentId) donationFields.paymentIntentId = paymentIntentId;
        if (status) donationFields.status = status;

        try {
            let donation = await Donation.findById(req.params.id);

            if (!donation) {
                return res.status(404).json({ msg: 'Donation not found' });
            }

            // Optional: Ensure only the owner or an admin can update
            // if (donation.user.toString() !== req.user.id) {
            //     return res.status(401).json({ msg: 'User not authorized' });
            // }

            donation = await Donation.findByIdAndUpdate(
                req.params.id,
                { $set: donationFields },
                { new: true } // Return the updated document
            );

            res.json(donation);
        } catch (err) {
            console.error(err.message);
            if (err.kind === 'ObjectId') {
                return res.status(404).json({ msg: 'Donation not found' });
            }
            res.status(500).send('Server Error');
        }
    }
);


// @route   DELETE api/donations/:id
// @desc    Delete a donation by ID
// @access  Private (requires authentication and ownership/admin rights)
router.delete('/:id', auth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ msg: 'Donation not found' });
        }

        // Optional: Ensure only the owner or an admin can delete
        // if (donation.user.toString() !== req.user.id) {
        //     return res.status(401).json({ msg: 'User not authorized' });
        // }

        await Donation.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Donation removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Donation not found' });
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;