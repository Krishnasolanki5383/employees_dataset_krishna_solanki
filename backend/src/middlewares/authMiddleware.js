// middlewares/authMiddleware.js — Verifies JWT token from Authorization header on protected routes

const { verifyToken } = require('../utils/tokenHelper');
const { sendError } = require('../utils/responseHelper');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

module.exports = { authMiddleware };
