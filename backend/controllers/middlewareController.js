// controllers/middlewareController.js
// Purpose: Demonstration controllers for middleware practice routes.
//          Each handler showcases a specific middleware capability.
//          All business logic stays in services — controllers handle req/res only.

const { sendSuccess } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  MIDDLEWARE PRACTICE ROUTE CONTROLLERS
//  GET /middleware/<feature>
// ══════════════════════════════════════════════════════════════

/**
 * GET /middleware/logger
 * Demonstrates the logger middleware is active.
 */
const demoLogger = (req, res) => {
  return sendSuccess(res, 200, 'Logger middleware is active', {
    feature:     'Request Logger',
    description: 'Every request is logged with method, URL, status, and response time.',
    logFormat:   '[METHOD] /path — STATUS — <N>ms',
  });
};

/**
 * GET /middleware/auth
 * Demonstrates JWT auth middleware — requires valid Bearer token.
 */
const demoAuth = (req, res) => {
  return sendSuccess(res, 200, 'Auth middleware verified your token successfully', {
    feature:     'JWT Authentication',
    description: 'Bearer token was verified. req.user populated from decoded payload.',
    user:        req.user || null,
  });
};

/**
 * GET /middleware/rate-limit
 * Demonstrates rate limiting is enforced on this route.
 */
const demoRateLimit = (req, res) => {
  return sendSuccess(res, 200, 'Rate limit middleware is active', {
    feature:     'Rate Limiting',
    description: 'Max 100 requests per 15 minutes per IP. Returns 429 when exceeded.',
    limit:       100,
    window:      '15 minutes',
  });
};

/**
 * GET /middleware/error-handler
 * Demonstrates the global error handler by intentionally throwing an error.
 */
const demoErrorHandler = (req, res, next) => {
  const err     = new Error('This is a demonstration error caught by the global error handler');
  err.statusCode = 500;
  next(err); // Pass to errorMiddleware
};

/**
 * GET /middleware/request-time
 * Demonstrates the X-Response-Time header being set.
 */
const demoRequestTime = (req, res) => {
  const elapsed = Date.now() - (req.startTime || Date.now());
  return sendSuccess(res, 200, 'Request time middleware is active', {
    feature:         'Request Timing',
    description:     'X-Response-Time header added to every response.',
    elapsedMs:       elapsed,
    headerName:      'X-Response-Time',
    requestStartedAt: req.startTime ? new Date(req.startTime).toISOString() : null,
  });
};

/**
 * GET /middleware/role-check
 * Demonstrates role-based access control (admin only).
 */
const demoRoleCheck = (req, res) => {
  return sendSuccess(res, 200, 'Role check middleware verified admin access', {
    feature:     'Role-Based Access Control',
    description: 'Only users with role=admin can reach this endpoint.',
    userRole:    req.user?.role || 'unknown',
    access:      'granted',
  });
};

/**
 * GET /middleware/validation
 * Demonstrates the validation middleware is in place.
 */
const demoValidation = (req, res) => {
  return sendSuccess(res, 200, 'Validation middleware is active', {
    feature:     'Request Validation',
    description: 'POST/PATCH body fields are validated before reaching the controller.',
    rules: [
      'name: required, string',
      'email: required, valid format',
      'phone: valid number format',
      'experience: number 0-50',
      'primarySkill: required, string',
    ],
  });
};

/**
 * GET /middleware/audit-log
 * Demonstrates the audit log middleware.
 */
const demoAuditLog = (req, res) => {
  return sendSuccess(res, 200, 'Audit log middleware is active', {
    feature:     'Audit Logging',
    description: 'Every request is logged with method, URL, user identity, and timestamp.',
    lastLog:     req.auditLog || null,
  });
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  demoLogger,
  demoAuth,
  demoRateLimit,
  demoErrorHandler,
  demoRequestTime,
  demoRoleCheck,
  demoValidation,
  demoAuditLog,
};
