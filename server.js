// Assuming you're using Express
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Environment variables with better debugging
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blog-api';
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

// Log environment variables (for debugging)
console.log('Environment variables:');
console.log('PORT:', PORT);
console.log('MONGO_URI:', MONGO_URI);
console.log('JWT_SECRET:', JWT_SECRET ? '******' : 'Not set');  // Don't log the actual secret

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Blog API is running');
});

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));

// Connect to MongoDB with error handling
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB Connected Successfully...');
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
  });

// Start server - IMPORTANT: Bind to 0.0.0.0, not localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});