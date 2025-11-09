const jwt = require('jsonwebtoken');
// If you are using dotenv, make sure to load it at the very top of your server.js
// require('dotenv').config();

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // IMPORTANT: Ensure process.env.JWT_SECRET is correctly loaded.
        // If you are using a .env file, add 'JWT_SECRET=your_secret_key' to it.
        // And make sure you have `require('dotenv').config();` at the very top of your server.js.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // This assumes your JWT payload directly contains the user ID as 'id'.
        // For example, if you signed the token like: jwt.sign({ id: user._id }, ...)
        // We're setting req.user to an object { id: '...' } for consistency.
        req.user = { id: decoded.id };

        // Call next() to pass control to the next middleware/route handler
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};