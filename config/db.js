// config/db.js — Establishes and exports the MongoDB connection using Mongoose

const mongoose = require('mongoose');
const { envConfig } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(envConfig.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
