// controllers/jwtController.js
// Purpose: Handles HTTP request/response for JWT demonstration routes.
//          NO token logic. NO DB queries.
//          Delegates ALL logic to jwtService.
//          Follows strict MVC: controllers own req/res, services own logic.

const jwtService = require('../services/jwtService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: PROFILE & DASHBOARD (protected)
// ══════════════════════════════════════════════════════════════

/**
 * GET /jwt/profile
 * Returns the JWT decoded user data. Requires valid Bearer token.
 */
const getJwtProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'JWT profile fetched successfully', {
      user:         req.user,
      tokenPresent: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /jwt/dashboard
 * Returns a protected dashboard summary. Requires valid Bearer token.
 */
const getJwtDashboard = async (req, res, next) => {
  try {
    const analytics = await jwtService.getPrivateAnalytics();
    return sendSuccess(res, 200, 'JWT dashboard data fetched successfully', {
      user:      req.user,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: TOKEN OPERATIONS
// ══════════════════════════════════════════════════════════════

/**
 * POST /jwt/generate-token
 * Accepts user data in body, returns access + refresh token.
 */
const generateToken = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!payload || Object.keys(payload).length === 0)
      return sendError(res, 400, 'Payload is required to generate a token');
    const result = await jwtService.generateTokens(payload);
    return sendSuccess(res, 200, 'Tokens generated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /jwt/verify-token
 * Accepts a token in body, verifies it and returns decoded data or error.
 */
const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 400, 'Token is required');
    const result = await jwtService.verifyAccessToken(token);
    if (!result.valid) return sendError(res, 401, `Token verification failed: ${result.error}`);
    return sendSuccess(res, 200, 'Token is valid', result.decoded);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /jwt/refresh-token
 * Accepts a refresh token in body, returns a new access token.
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, 400, 'Refresh token is required');
    const result = await jwtService.refreshAccessToken(token);
    return sendSuccess(res, 200, 'Access token refreshed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /jwt/revoke-token
 * Adds the token to the in-memory blacklist.
 */
const revokeToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 400, 'Token is required to revoke');
    const result = await jwtService.revokeToken(token);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3: PRIVATE DATA ROUTES (protected)
// ══════════════════════════════════════════════════════════════

/**
 * GET /jwt/private-employees
 * Returns paginated employees — JWT protected.
 */
const getPrivateEmployees = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await jwtService.getPrivateEmployees({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} private employee(s) fetched`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /jwt/private-projects
 * Returns all projects — JWT protected.
 */
const getPrivateProjects = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await jwtService.getPrivateProjects({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} private project record(s) fetched`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /jwt/private-tasks
 * Returns all tasks — JWT protected.
 */
const getPrivateTasks = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await jwtService.getPrivateTasks({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} private task record(s) fetched`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /jwt/private-analytics
 * Returns aggregated analytics — JWT protected.
 */
const getPrivateAnalytics = async (req, res, next) => {
  try {
    const result = await jwtService.getPrivateAnalytics();
    return sendSuccess(res, 200, 'Private analytics fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  getJwtProfile,
  getJwtDashboard,
  generateToken,
  verifyToken,
  refreshToken,
  revokeToken,
  getPrivateEmployees,
  getPrivateProjects,
  getPrivateTasks,
  getPrivateAnalytics,
};
