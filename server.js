// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing
require('dotenv').config(); // Load environment variables from .env file

// Initialize Express app
const app = express();
// Define the port for the server, using environment variable or default to 5000
const port = process.env.PORT || 5000;

// =======================
// Middleware Setup
// =======================

// Enable CORS for all routes - allows your frontend on a different port/domain to make requests
// IMPORTANT: In production, consider restricting this to your specific frontend domain.
app.use(cors({
    origin: 'https://anushkaaaa21.github.io', // Allow only your GitHub Pages frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods if needed
    credentials: true // If you're sending cookies or authorization headers
}));
// Enable Express to parse JSON formatted request bodies
// This is crucial for receiving data like firstName, email, password from your frontend
app.use(express.json());

// =======================
// MongoDB Connection
// =======================

// Retrieve MongoDB URI from environment variables
const mongoUri = process.env.MONGO_URI;

// Check if mongoUri is defined before attempting to connect
if (!mongoUri) {
    console.error("MongoDB connection URI is not defined. Please set MONGO_URI in your .env file.");
    process.exit(1); // Exit the process if URI is missing
}

// Connect to MongoDB using Mongoose
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // `useCreateIndex` and `useFindAndModify` are deprecated and no longer needed in Mongoose 6+
})
.then(() => console.log("MongoDB database connection established successfully"))
.catch(err => console.error("MongoDB connection error:", err)); // Log any connection errors

// =======================
// API Routes
// =======================

// Mount the router from './routes/users.js'
// All routes defined in 'users.js' will be prefixed with '/api/auth'
app.use('/api/auth', require('./routes/users'));

// Mount the router from './routes/profile.js'
// All routes defined in 'profile.js' will be prefixed with '/api/profile'
app.use('/api/profile', require('./routes/profile'));

// Mount the router from './routes/donations.js'
// All routes defined in 'donations.js' will be prefixed with '/api/donations'
app.use('/api/donations', require('./routes/donations'));

// >>>>>>>>>> ADDED FOR OPPORTUNITIES <<<<<<<<<<
// Mount the router from './routes/opportunities.js'
// All routes defined in 'opportunities.js' will be prefixed with '/api/opportunities'
app.use('/api/opportunities', require('./routes/opportunities'));
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// >>>>>>>>>> ADDED FOR USER-OPPORTUNITIES <<<<<<<<<<
// Mount the router from './routes/userOpportunities.js'
// All routes defined in 'userOpportunities.js' will be prefixed with '/api/user-opportunities'
app.use('/api/user-opportunities', require('./routes/userOpportunities'));
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// =======================
// Start the Server
// =======================

// Start listening for incoming requests on the specified port
app.listen(port, () => {
    // Use a template literal for clear console output
    console.log(`Server is running on port: ${port}`);
});