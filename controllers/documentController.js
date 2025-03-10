const Document = require('../models/Document');

// Create a document and append to root level (no parent)
const createDocument = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    // Fix the comment to match the actual behavior
    const newDocument = new Document({
      name,
      description,
      type: type || 'folder',
      children: [],
      isRoot: true  // This is a root document
    });

    const savedDocument = await newDocument.save();

    res.status(201).json({
      success: true,
      data: savedDocument
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document',
      error: error.message
    });
  }
};

// Create a document as a child of a specific folder
const createChildDocument = async (req, res) => {
  try {
    const { name, description, type, parentId } = req.body;

    // Find the parent document
    const parentDocument = await Document.findById(parentId);

    if (!parentDocument) {
      return res.status(404).json({
        success: false,
        message: 'Parent folder not found'
      });
    }

    if (parentDocument.type === 'file') return res.status(400).json({
      success: false,
      message: 'Cannot create a child document for a file'
    })

    // Create the new document as a separate document
    const newDocument = new Document({
      name,
      description,
      type: type || 'folder',
      children: [],
      isRoot: false
    });

    // Save the new document to get its _id
    const savedDocument = await newDocument.save();

    // Add the new document's ID to the parent's children array
    parentDocument.children.push(savedDocument._id);

    // Save the updated parent document
    await parentDocument.save();

    res.status(201).json({
      success: true,
      data: savedDocument,
      parent: {
        _id: parentDocument._id,
        name: parentDocument.name
      }
    });
  } catch (error) {
    console.error('Error creating child document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create child document',
      error: error.message
    });
  }
};

// Get all documents
const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers and ensure they're valid
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Get total count of root documents
    const total = await Document.countDocuments({ isRoot: true });

    // Find only root documents (those without parents) with pagination
    const rootDocuments = await Document.find({ isRoot: true })
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }) // Add sorting to ensure+ consistent results
      .lean();


    // Function to recursively populate children
    const populateChildren = async (documents) => {
      for (let doc of documents) {
        if (doc.children && doc.children.length > 0) {
          // Find all children documents
          doc.children = await Document.find({
            _id: { $in: doc.children }
          }).lean();

          // Recursively populate their children
          if (doc.children.length > 0) {
            await populateChildren(doc.children);
          }
        }
      }
    };

    // Populate all levels of children
    await populateChildren(rootDocuments);

    res.status(200).json({
      success: true,
      count: rootDocuments.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: rootDocuments
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Delete all documents
const deleteAllDocuments = async (req, res) => {
  try {
    await Document.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'All documents have been deleted'
    });
  } catch (error) {
    console.error('Error deleting all documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete all documents',
      error: error.message
    });
  }
};

// Update a document
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    // Find the document by ID
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update the document fields
    if (name) document.name = name;
    if (description !== undefined) document.description = description;
    if (type && ['folder', 'file'].includes(type)) document.type = type;

    // Save the updated document
    const updatedDocument = await document.save();

    res.status(200).json({
      success: true,
      data: updatedDocument
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
};

// Delete a document by ID
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the document by ID
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Remove the document from any parent's children array
    await Document.updateMany(
      { children: id },
      { $pull: { children: id } }
    );

    // Recursively delete all children
    const deleteChildren = async (childrenIds) => {
      if (!childrenIds || childrenIds.length === 0) return;

      // Find all children documents
      const children = await Document.find({ _id: { $in: childrenIds } });

      // Get all grandchildren IDs
      const grandchildrenIds = [];
      children.forEach(child => {
        if (child.children && child.children.length > 0) {
          grandchildrenIds.push(...child.children);
        }
      });

      // Delete all children
      await Document.deleteMany({ _id: { $in: childrenIds } });

      // Recursively delete grandchildren
      if (grandchildrenIds.length > 0) {
        await deleteChildren(grandchildrenIds);
      }
    };

    // Start recursive deletion with immediate children
    await deleteChildren(document.children);

    // Delete the document itself
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document and all its children successfully deleted'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Filter documents
const filterDocuments = async (req, res) => {
  try {
    const { name, description, date, page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers and ensure they're valid
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Build the filter query
    const query = { isRoot: true }; // Start with root documents

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }

    if (description) {
      query.description = { $regex: description, $options: 'i' };
    }

    // Handle single date input
    if (date) {
      // Convert the date string to a Date object
      const searchDate = new Date(date);

      // Set start of day and end of day for the given date
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Find documents created on that specific date
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Get total count for pagination
    const total = await Document.countDocuments(query);

    // Find documents matching the filter with pagination
    const filteredDocuments = await Document.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }) // Add sorting to ensure consistent results
      .lean();

    // Function to recursively populate children
    const populateChildren = async (documents) => {
      for (let doc of documents) {
        if (doc.children && doc.children.length > 0) {
          // Find all children documents
          doc.children = await Document.find({
            _id: { $in: doc.children }
          }).lean();

          // Recursively populate their children
          if (doc.children.length > 0) {
            await populateChildren(doc.children);
          }
        }
      }
    };

    // Populate all levels of children
    await populateChildren(filteredDocuments);

    res.status(200).json({
      success: true,
      count: filteredDocuments.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: filteredDocuments
    });
  } catch (error) {
    console.error('Error filtering documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter documents',
      error: error.message
    });
  }
};

// Upload a file document (can be root or child of a folder)
const uploadFileDocument = async (req, res) => {
  try {
    const { name, description, fileUrl, fileSize, fileType, parentId } = req.body;

    // Validate required fields
    if (!name || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name and fileUrl are required'
      });
    }

    // Create the file document
    const fileDocument = new Document({
      name,
      description,
      type: 'file',
      fileUrl,
      fileSize,
      fileType,
      children: [],
      isRoot: !parentId // If parentId is provided, it's not a root document
    });

    // Save the file document
    const savedFileDocument = await fileDocument.save();

    // If parentId is provided, add the file as a child to the parent folder
    if (parentId) {
      // Find the parent document
      const parentDocument = await Document.findById(parentId);

      if (!parentDocument) {
        // If parent not found, delete the created file and return error
        await Document.findByIdAndDelete(savedFileDocument._id);
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found'
        });
      }

      if (parentDocument.type === 'file') {
        // If parent is a file, delete the created file and return error
        await Document.findByIdAndDelete(savedFileDocument._id);
        return res.status(400).json({
          success: false,
          message: 'Cannot add a file to another file'
        });
      }

      // Add the file document's ID to the parent's children array
      parentDocument.children.push(savedFileDocument._id);

      // Save the updated parent document
      await parentDocument.save();

      return res.status(201).json({
        success: true,
        data: {
          ...savedFileDocument.toObject(),
          fileMetadata: {
            fileUrl: savedFileDocument.fileUrl,
            fileSize: savedFileDocument.fileSize,
            fileType: savedFileDocument.fileType
          }
        },
        parent: {
          _id: parentDocument._id,
          name: parentDocument.name
        }
      });
    }

    // If no parentId, return the file document as a root item
    res.status(201).json({
      success: true,
      data: {
        ...savedFileDocument.toObject(),
        fileMetadata: {
          fileUrl: savedFileDocument.fileUrl,
          fileSize: savedFileDocument.fileSize,
          fileType: savedFileDocument.fileType
        }
      }
    });
  } catch (error) {
    console.error('Error uploading file document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file document',
      error: error.message
    });
  }
};

// Update the module.exports to include the new function
module.exports = {
  createDocument,
  createChildDocument,
  getAllDocuments,
  deleteAllDocuments,
  updateDocument,
  deleteDocument,
  filterDocuments,
  uploadFileDocument
};