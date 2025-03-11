const express = require('express');
const router = express.Router();
const {
  createDocument,
  createChildDocument,
  getAllDocuments,
  deleteAllDocuments,
  updateDocument,
  deleteDocument,
  filterDocuments,
  uploadFileDocument,
  getDocumentById
} = require('../controllers/documentController');
const { apiKeyAuth } = require('../middleware/authMiddleware');

// Apply API key authentication to all routes
router.use(apiKeyAuth);

// Document routes
router.post('/', createDocument);
router.post('/child', createChildDocument);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.delete('/', deleteAllDocuments);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.get('/filter', filterDocuments);
router.post('/upload', uploadFileDocument);

module.exports = router;