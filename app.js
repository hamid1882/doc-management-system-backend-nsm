const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();


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


// Add this near the top with your other requires
const documentRoutes = require('./routes/documentRoutes');
const fileRoutes = require("./routes/fileRoutes")


// Use file routes
app.use('/api/files', fileRoutes);

// For parsing application/json
app.use(express.json());

// Documents routes
app.use('/api/documents', documentRoutes);
