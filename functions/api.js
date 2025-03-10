const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const documentRoutes = require('../routes/documentRoutes');
const fileRoutes = require('../routes/fileRoutes');

// Create Express app
const app = express();

// Middleware
// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

app.use(express.json());

// MongoDB connection options to speed up connection
const mongoOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  maxPoolSize: 10
};

// Initialize MongoDB connection variable
let cachedDb = null;

// Connect to MongoDB - optimized for serverless
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = await mongoose.connect(process.env.MONGO_URL, mongoOptions);
    cachedDb = client;
    console.log('MongoDB connected');
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/files', fileRoutes);

// Basic route for testing
app.get('/api', async (req, res) => {
  try {
    // Try to connect to the database but don't wait for it
    connectToDatabase().catch(console.error);

    res.json({
      message: 'Document Management System API',
      status: 'online'
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Optimize the handler for cold starts
const handler = serverless(app);
module.exports.handler = async (event, context) => {
  // Make the function return immediately while MongoDB connects in the background
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Try to connect to the database
    await connectToDatabase();
    return await handler(event, context);
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};