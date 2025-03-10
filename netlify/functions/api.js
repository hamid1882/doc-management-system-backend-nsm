const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const documentRoutes = require('../../routes/documentRoutes');
const fileRoutes = require('../../routes/fileRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug environment variables
console.log('MongoDB URI exists:', !!process.env.MONGO_URL);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/files', fileRoutes);

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Document Management System API' });
});

// Export the serverless function
module.exports.handler = serverless(app);