const express = require('express');
const router = express.Router();
const { uploadFile, uploadMiddleware } = require('../controllers/fileController');
const { apiKeyAuth } = require('../middleware/authMiddleware');

// Apply API key authentication to all routes
router.use(apiKeyAuth);

// Route for file upload
router.post('/upload', uploadMiddleware, uploadFile);

module.exports = router;