// config/index.js — Barrel file for clean imports from the config folder

const { connectDB } = require('./db');
const { envConfig } = require('./env');

module.exports = { connectDB, envConfig };
