// config/env.js — Loads and validates all environment variables from .env file

require('dotenv').config();

const envConfig = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

// Validate required environment variables
const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
requiredVars.forEach((key) => {
  if (!envConfig[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = { envConfig };
