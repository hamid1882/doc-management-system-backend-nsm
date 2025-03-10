const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add this near the top with your other requires
const documentRoutes = require('./routes/documentRoutes');
const fileRoutes = require("./routes/fileRoutes")

const db = require("./config/db");

const PORT = process.env.PORT || 8800;

db.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });



app.get('/', (req, res) => {
  res.send('Hello World!');
});



// Use file routes
app.use('/api/files', fileRoutes);

// For parsing application/json
app.use(express.json());

// Documents routes
app.use('/api/documents', documentRoutes);
