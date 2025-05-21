require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Blog API is running');
});

// Set port - using 5001 instead of 5000
const PORT = process.env.PORT || 5001;  // Changed from 5000 to 5001

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});