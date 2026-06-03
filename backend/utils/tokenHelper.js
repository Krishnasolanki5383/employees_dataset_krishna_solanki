// utils/tokenHelper.js — Utility functions to generate and verify JWT tokens

const jwt = require('jsonwebtoken');
const { envConfig } = require('../config/env');

const generateToken = (payload) => {
  return jwt.sign(payload, envConfig.JWT_SECRET, {
    expiresIn: envConfig.JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, envConfig.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
