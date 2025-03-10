const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
    return conn;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = { connect: connectDB }
