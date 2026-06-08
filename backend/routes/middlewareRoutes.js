// routes/middlewareRoutes.js
// Purpose: Defines demonstration routes for each middleware feature.
//          Allows testing individual middleware behavior via HTTP calls.
//          Mounted under /middleware (see server.js).

const express = require('express');
const router  = express.Router();
const { authMiddleware }        = require('../middlewares/authMiddleware');
const { roleMiddleware }        = require('../middlewares/roleMiddleware');
const { rateLimitMiddleware }   = require('../middlewares/rateLimitMiddleware');
const { requestTimeMiddleware } = require('../middlewares/requestTimeMiddleware');
const { auditLogMiddleware }    = require('../middlewares/auditLogMiddleware');
const {
  demoLogger,
  demoAuth,
  demoRateLimit,
  demoErrorHandler,
  demoRequestTime,
  demoRoleCheck,
  demoValidation,
  demoAuditLog,
} = require('../controllers/middlewareController');

// ══════════════════════════════════════════════════════════════
//  MIDDLEWARE PRACTICE ROUTES
//  Each route demonstrates one specific middleware in isolation.
// ══════════════════════════════════════════════════════════════

/**
 * GET /middleware/logger
 * Shows that the request logger middleware is active globally.
 */
router.get('/logger',        demoLogger);

/**
 * GET /middleware/auth
 * Requires valid JWT token — demonstrates authMiddleware.
 */
router.get('/auth',          authMiddleware, demoAuth);

/**
 * GET /middleware/rate-limit
 * Demonstrates rate limiting — max 100 req/15min per IP.
 */
router.get('/rate-limit',    rateLimitMiddleware, demoRateLimit);

/**
 * GET /middleware/error-handler
 * Intentionally triggers the global error handler to demo it.
 */
router.get('/error-handler', demoErrorHandler);

/**
 * GET /middleware/request-time
 * Applies requestTimeMiddleware to show X-Response-Time header.
 */
router.get('/request-time',  requestTimeMiddleware, demoRequestTime);

/**
 * GET /middleware/role-check
 * Requires auth + admin role — demonstrates roleMiddleware.
 */
router.get('/role-check',    authMiddleware, roleMiddleware, demoRoleCheck);

/**
 * GET /middleware/validation
 * Shows the validation rules enforced on POST/PATCH routes.
 */
router.get('/validation',    demoValidation);

/**
 * GET /middleware/audit-log
 * Applies audit log middleware and returns the captured log entry.
 */
router.get('/audit-log',     auditLogMiddleware, demoAuditLog);

module.exports = router;
