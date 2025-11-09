const router = require('express').Router();
const auth = require('../middleware/auth'); // Import the authentication middleware
const User = require('../models/user.model'); // Import the User model

/* =========================================
   @route   GET /api/profile/me
   @desc    Get the current logged-in user's profile
   @access  Private (requires authentication)
   ========================================= */
router.get('/me', auth, async (req, res) => {
  try {
    // req.user is set by the auth middleware as { id: '...' }
    // We need to access req.user.id to pass the actual ID to findById
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from the result

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    // Log the full error object for more detail during debugging
    console.error(err);
    res.status(500).json({ msg: "Server error occurred while fetching profile." });
  }
});

/* =========================================
   @route   PUT /api/profile/me
   @desc    Update the current logged-in user's profile
   @access  Private (requires authentication)
   ========================================= */
router.put('/me', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, gender, country, city } = req.body; // Add all fields you want to allow updating

    // Build update object dynamically
    const profileFields = {};
    if (firstName) profileFields.firstName = firstName;
    if (lastName) profileFields.lastName = lastName;
    if (email) profileFields.email = email;
    if (phone) profileFields.phone = phone;
    if (dateOfBirth) profileFields.dateOfBirth = dateOfBirth;
    if (gender) profileFields.gender = gender;
    if (country) profileFields.country = country;
    if (city) profileFields.city = city;

    // Optional: If email is being updated, check for uniqueness
    if (email) {
      const existingUserWithEmail = await User.findOne({ email: email });
      // CRITICAL FIX: Compare existingUserWithEmail._id to req.user.id (the string ID)
      // This ensures the current user can save their profile even if their email hasn't changed.
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== req.user.id) {
        return res.status(400).json({ msg: "This email is already in use by another account." });
      }
    }

    // Find and update the user profile
    // CRITICAL FIX: Pass req.user.id to findByIdAndUpdate
    const user = await User.findByIdAndUpdate(
      req.user.id, // User ID from auth middleware: access the 'id' property
      { $set: profileFields }, // Fields to update
      { new: true, runValidators: true, select: '-password' } // Return new doc, run schema validators, exclude password
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    res.json({ message: "Profile updated successfully.", user });

  } catch (err) {
    console.error("Error updating user profile:", err.message);
    // Log the full error object for more detail during debugging
    console.error(err);
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ msg: err.message });
    }
    // Handle CastError specifically (e.g., if an ID format is wrong despite fixes)
    if (err.name === 'CastError') {
        return res.status(400).json({ msg: `Invalid data format for: ${err.path}` });
    }
    res.status(500).json({ msg: "Server error occurred while updating profile." });
  }
});

/* =========================================
   @route   DELETE /api/profile/me
   @desc    Delete the current logged-in user's account
   @access  Private (requires authentication)
   ========================================= */
router.delete('/me', auth, async (req, res) => {
  try {
    // Find and delete the user
    // CRITICAL FIX: Pass req.user.id to findByIdAndDelete
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    res.json({ msg: "Your account has been successfully deleted." });

  } catch (err) {
    console.error("Error deleting user account:", err.message);
    console.error(err); // Log full error for debugging
    res.status(500).json({ msg: "Server error occurred while deleting account." });
  }
});

module.exports = router;