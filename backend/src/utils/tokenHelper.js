// utils/tokenHelper.js
// Purpose: Utility functions to generate, verify, and refresh JWT tokens.
//          All secrets come from .env — never hardcoded.
//          Supports access tokens (short-lived) and refresh tokens (long-lived).

const jwt = require('jsonwebtoken');
const { envConfig } = require('../config/env');

/**
 * generateToken
 * Signs an access token with JWT_SECRET.
 * Default expiry: JWT_EXPIRES_IN from .env (e.g., '1d')
 */
const generateToken = (payload) => {
  return jwt.sign(payload, envConfig.JWT_SECRET, {
    expiresIn: envConfig.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * generateRefreshToken
 * Signs a refresh token with JWT_REFRESH_SECRET.
 * Default expiry: 7 days (longer-lived than access token).
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, envConfig.JWT_REFRESH_SECRET || envConfig.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * verifyToken
 * Verifies an access token using JWT_SECRET.
 * Throws JsonWebTokenError or TokenExpiredError if invalid.
 */
const verifyToken = (token) => {
  return jwt.verify(token, envConfig.JWT_SECRET);
};

/**
 * verifyRefreshToken
 * Verifies a refresh token using JWT_REFRESH_SECRET.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, envConfig.JWT_REFRESH_SECRET || envConfig.JWT_SECRET);
};

module.exports = { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken };
