# Document Management System Backend

A robust backend API for a document management system built with Node.js, Express, and MongoDB. This system allows for hierarchical document organization with folder structures and file uploads using Cloudinary.

## Features

- Hierarchical document structure (folders and files)
- File upload capabilities with Cloudinary integration
- RESTful API design
- API key authentication
- Serverless-ready with Netlify Functions support

## Tech Stack

- **Node.js & Express**: Backend framework
- **MongoDB & Mongoose**: Database and ODM
- **Cloudinary**: Cloud storage for file uploads
- **Multer**: Middleware for handling file uploads
- **Serverless**: Deployment as serverless functions

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd doc-management-system-nsm-backend
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
MONGO_URL=mongodb://localhost:27017/mydatabase
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
API_KEY=your_api_key_for_authentication
```

4. Start the development server

```bash
npm run dev
```

## API Endpoints

### Documents

- **GET /api/documents** - Get all root documents (paginated)
- **GET /api/documents/:id** - Get a specific document by ID
- **POST /api/documents** - Create a new root document
- **POST /api/documents/child** - Create a child document within a folder
- **PUT /api/documents/:id** - Update a document
- **DELETE /api/documents/:id** - Delete a document
- **DELETE /api/documents** - Delete all documents (use with caution)

### Files

- **POST /api/files/upload** - Upload a file to Cloudinary

## Data Models

### Document Schema

```javascript
{
  name: String,          // Document name
  description: String,   // Document description
  type: String,          // 'folder' or 'file'
  fileUrl: String,       // URL to the file (for type 'file')
  fileSize: Number,      // Size of the file in bytes
  fileType: String,      // MIME type of the file
  children: [ObjectId],  // References to child documents
  isRoot: Boolean,       // Whether this is a root-level document
  createdAt: Date,       // Creation timestamp
  updatedAt: Date        // Last update timestamp
}
```

## Authentication

The API uses API key authentication. Include your API key in the request headers:

```
x-api-key: your_api_key
```

## Deployment

### Netlify Functions

This project is configured to deploy as Netlify Functions. The `netlify.toml` file contains the necessary configuration.

1. Install the Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Deploy to Netlify:

```bash
netlify deploy
```

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## License

ISC
