const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'document-management',
    allowed_formats: ['txt', 'jpg', 'jpeg', 'gif', 'png', 'webp', 'svg']
  }
});

// Initialize multer upload with Cloudinary storage
const upload = multer({ storage: storage });

// Handle file upload and return metadata
const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return file metadata (Cloudinary provides this in req.file)
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: req.file.path, // Cloudinary URL
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

// Export the controller functions and the multer middleware
module.exports = {
  uploadFile,
  uploadMiddleware: upload.single('file')
};