// Add fileUrl field to the Document schema
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['folder', 'file'],
    default: 'folder'
  },
  fileUrl: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  isRoot: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', DocumentSchema);