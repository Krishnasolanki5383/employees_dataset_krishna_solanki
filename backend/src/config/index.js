// config/index.js — Barrel file for clean imports from the config folder

const { connect } = require('./db');
const { envConfig } = require('./env');

module.exports = { connect, envConfig };
