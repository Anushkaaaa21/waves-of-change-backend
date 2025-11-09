const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const User = require('../models/user.model');
require('dotenv').config(); // Ensure dotenv is loaded here as well for JWT_SECRET

/* =========================================
   @route   POST /api/auth/register
   @desc    Register a new user
   @access  Public
   ========================================= */
router.post('/register', async (req, res) => {
  try {
    // Destructure all expected fields from req.body, matching your frontend's formData
    const {
        firstName,
        lastName,
        email,
        password,
        phone,       // Optional, will be '' if not provided by frontend
        dateOfBirth, // Optional, will be '' if not provided by frontend
        gender,      // Optional, will be '' if not provided by frontend
        country,     // Optional, will be '' if not provided by frontend
        city         // Optional, will be '' if not provided by frontend
    } = req.body;

    console.log('Register attempt received. Full Body:', req.body); // DEBUG: Log full request body

    // Server-side validation for core required fields
    if (!firstName || !lastName || !email || !password) {
      console.log('Register error: Missing core required fields.'); // DEBUG
      return res.status(400).json({ msg: "Please enter all required fields: first name, last name, email, and password." });
    }

    // Check for existing user with the same email
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log('Register error: Email already exists:', email); // DEBUG
      return res.status(400).json({ msg: "An account with this email already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a new user instance, including all fields from req.body
    // Provide default values for optional fields if they are empty strings or undefined
    // This prevents Mongoose 'required' validation errors for fields that are optional from the frontend.
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      // For phone, country, city, gender: if frontend sends '', Mongoose schema with `trim: true` and no `required` will accept.
      // If schema has `required`, but frontend sends '', `required` validation will fail.
      // Your schema has `phone` as required, so we must ensure a value is present.
      phone: phone || '', // Ensure it's at least an empty string to satisfy type, if schema allows optional
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, // Convert to Date object if provided, else undefined
      gender: gender || '',
      country: country || '',
      city: city || ''
    });

    // Save the new user to the database
    const savedUser = await newUser.save();
    console.log('User registered successfully:', savedUser.email); // DEBUG

    // Send a success response back to the client
    res.status(201).json({
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        message: "Registration successful. Please log in."
    });

  } catch (err) {
    // Improved error handling for Mongoose validation errors vs. general server errors
    if (err.name === 'ValidationError') {
        // Mongoose validation errors (e.g., required field missing, enum mismatch, minlength not met)
        console.error("Mongoose Validation Error during registration:", err.message);
        // You can parse err.errors to send back specific field errors for a more granular frontend display
        // Example: const errors = {}; for (let field in err.errors) errors[field] = err.errors[field].message;
        return res.status(400).json({ error: err.message, details: err.errors });
    }
    // For other unexpected server errors
    console.error("General Error during registration:", err.message); // DEBUG
    res.status(500).json({ error: "Server error occurred during registration." });
  }
});

/* =========================================
   @route   POST /api/auth/login
   @desc    Authenticate a user and log them in (with JWT)
   @access  Public
   ========================================= */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt received. Body:', req.body); // DEBUG: Log full request body
    console.log('Attempting login for email:', email); // DEBUG

    if (!email || !password) {
      console.log('Login error: Missing email or password in request body.'); // DEBUG
      return res.status(400).json({ msg: "Please enter both email and password." });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      console.log('Login error: User not found for email:', email); // DEBUG
      return res.status(400).json({ msg: "Invalid credentials." });
    }
    console.log('Login: User found in DB:', user.email); // DEBUG

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login error: Password mismatch for user:', user.email); // DEBUG
      return res.status(400).json({ msg: "Invalid credentials." });
    }
    console.log('Login: Password matched for user:', user.email); // DEBUG

    // --- Generate JWT ---
    if (!process.env.JWT_SECRET) { // Critical check for JWT_SECRET
        console.error("CRITICAL ERROR: JWT_SECRET environment variable is not defined!"); // DEBUG
        return res.status(500).json({ error: "Server configuration error: JWT secret missing." });
    }
    console.log('Login: JWT_SECRET is defined (length: ' + (process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0) + ' characters)'); // DEBUG: Confirm secret loaded

    const token = jwt.sign(
      { id: user._id }, // Payload: Data to be stored in the token (user ID)
      process.env.JWT_SECRET, // Your secret key from .env
      { expiresIn: '1h' } // Token expiration time (e.g., 1 hour)
    );
    console.log('Login: JWT token generated successfully for user:', user.email); // DEBUG

    // Send the token and some user details back to the client
    res.json({
      token, // The generated JWT
      user: { // User details
        id: user._id,
        firstName: user.firstName,
        email: user.email,
      },
      message: "Login successful!" // Added a success message
    });

  } catch (err) {
    console.error("Error during login attempt:", err.message); // DEBUG
    res.status(500).json({ error: "Server error occurred during login." });
  }
});

// Export the router to be used in server.js
module.exports = router;
