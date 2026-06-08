// services/jwtService.js
// Purpose: Contains ALL business logic for JWT routes.
//          Controllers NEVER handle token logic directly.
//          Uses tokenHelper for sign/verify operations.
//          In-memory blacklist for revoked tokens (use Redis in production).

const Employee   = require('../models/employeeModel');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenHelper');

// ── In-memory token blacklist (revoked tokens) ─────────────────
// Replace with Redis SET in production for persistence and scalability.
const revokedTokens = new Set();

// ══════════════════════════════════════════════════════════════
//  SECTION 1: TOKEN OPERATIONS
// ══════════════════════════════════════════════════════════════

/**
 * generateTokens
 * Accepts user payload in body, signs access + refresh token.
 * Returns both tokens.
 */
const generateTokens = async (payload) => {
  const accessToken  = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return {
    accessToken,
    refreshToken,
    expiresIn: '1d',
    tokenType: 'Bearer',
  };
};

/**
 * verifyAccessToken
 * Accepts a token string, verifies it using JWT_SECRET.
 * Returns decoded payload or throws on invalid.
 */
const verifyAccessToken = async (token) => {
  const jwt = require('jsonwebtoken');
  const { envConfig } = require('../config/env');

  if (revokedTokens.has(token)) {
    const err = new Error('Token has been revoked');
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * refreshAccessToken
 * Verifies refresh token, generates new access token.
 */
const refreshAccessToken = async (refreshToken) => {
  if (revokedTokens.has(refreshToken)) {
    const err = new Error('Refresh token has been revoked');
    err.statusCode = 401;
    throw err;
  }

  const decoded    = verifyRefreshToken(refreshToken); // throws on invalid
  const newToken   = generateToken({ id: decoded.id, email: decoded.email, role: decoded.role });
  return {
    accessToken: newToken,
    expiresIn:   '1d',
    tokenType:   'Bearer',
  };
};

/**
 * revokeToken
 * Adds a token to the in-memory blacklist.
 */
const revokeToken = async (token) => {
  revokedTokens.add(token);
  return { message: 'Token revoked successfully. It will no longer be accepted.' };
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: PRIVATE DATA ACCESS (protected by authMiddleware)
// ══════════════════════════════════════════════════════════════

/**
 * getPrivateEmployees
 * Returns paginated employees — only accessible with valid JWT.
 */
const getPrivateEmployees = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const total     = await Employee.countDocuments();
  const employees = await Employee.find().sort({ name: 1 }).skip(skip).limit(limitNum).select('-__v');
  const totalPages = Math.ceil(total / limitNum);

  return {
    pagination: { currentPage: pageNum, totalPages, totalRecords: total, limit: limitNum,
                  hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 },
    data: employees,
  };
};

/**
 * getPrivateProjects
 * Returns all projects aggregated — JWT protected.
 */
const getPrivateProjects = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const countResult = await Employee.aggregate([
    { $match: { projects: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$projects' },
    { $count: 'total' },
  ]);
  const total      = countResult[0]?.total || 0;
  const totalPages = Math.ceil(total / limitNum);

  const result = await Employee.aggregate([
    { $match: { projects: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$projects' },
    { $project: { _id: 0, employeeName: '$name', project: '$projects' } },
    { $sort: { employeeName: 1 } },
    { $skip: skip },
    { $limit: limitNum },
  ]);

  return {
    pagination: { currentPage: pageNum, totalPages, totalRecords: total, limit: limitNum,
                  hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 },
    data: result,
  };
};

/**
 * getPrivateTasks
 * Returns all tasks aggregated — JWT protected.
 */
const getPrivateTasks = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const countResult = await Employee.aggregate([
    { $match: { tasks: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$tasks' },
    { $count: 'total' },
  ]);
  const total      = countResult[0]?.total || 0;
  const totalPages = Math.ceil(total / limitNum);

  const result = await Employee.aggregate([
    { $match: { tasks: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$tasks' },
    { $project: { _id: 0, employeeName: '$name', task: '$tasks' } },
    { $sort: { employeeName: 1 } },
    { $skip: skip },
    { $limit: limitNum },
  ]);

  return {
    pagination: { currentPage: pageNum, totalPages, totalRecords: total, limit: limitNum,
                  hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1 },
    data: result,
  };
};

/**
 * getPrivateAnalytics
 * Returns aggregated analytics summary — JWT protected.
 */
const getPrivateAnalytics = async () => {
  const [countResult, skillResult, domainResult] = await Promise.all([
    Employee.aggregate([{ $count: 'totalEmployees' }]),
    Employee.aggregate([
      { $group: { _id: '$primarySkill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Employee.aggregate([
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    totalEmployees: countResult[0]?.totalEmployees || 0,
    topSkills:      skillResult,
    topDomains:     domainResult,
  };
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  generateTokens,
  verifyAccessToken,
  refreshAccessToken,
  revokeToken,
  getPrivateEmployees,
  getPrivateProjects,
  getPrivateTasks,
  getPrivateAnalytics,
};
