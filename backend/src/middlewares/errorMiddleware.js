// middlewares/errorMiddleware.js
// Purpose: Global error handler for all unhandled errors in the app.
//          Must be registered LAST in server.js (after all routes).
//          Covers: Mongoose errors, JWT errors, custom errors, and 500s.
//          PR 4: Enhanced with full error taxonomy and stack trace support.

const errorMiddleware = (err, req, res, next) => {
  console.error(`❌ [ERROR] ${err.message}`);

  // ── Mongoose Validation Error ──────────────────────────────
  // Triggered by schema validators (required, min, max, match)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors:  messages,
    });
  }

  // ── Mongoose Duplicate Key Error (409 Conflict) ────────────
  // Triggered when a unique index is violated (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `Employee already exists. Duplicate value for field: ${field}`,
      errors:  [`${field}: ${err.keyValue?.[field]} already exists`],
    });
  }

  // ── Mongoose Invalid ObjectId (400 Bad Request) ────────────
  // Triggered when :id param is not a valid MongoDB ObjectId format
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format. Please provide a valid MongoDB ObjectId.',
      errors:  [`${err.path}: "${err.value}" is not a valid ObjectId`],
    });
  }

  // ── JWT Invalid Token (401 Unauthorized) ──────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
      errors:  [err.message],
    });
  }

  // ── JWT Expired Token (401 Unauthorized) ──────────────────
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired. Please log in again.',
      errors:  [err.message],
    });
  }

  // ── Validation Failed (422 Unprocessable Entity) ──────────
  // Custom errors thrown with status 422 for field-level failures
  if (err.statusCode === 422) {
    return res.status(422).json({
      success: false,
      message: err.message || 'Validation failed',
      errors:  err.errors || [],
    });
  }

  // ── Bad Request (400) ──────────────────────────────────────
  // Missing fields, invalid values, empty search queries, invalid pagination
  if (err.statusCode === 400) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Bad Request',
      errors:  err.errors || [],
    });
  }

  // ── Unauthorized (401) ─────────────────────────────────────
  // No token, invalid credentials
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Unauthorized access',
      errors:  [],
    });
  }

  // ── Forbidden (403) ────────────────────────────────────────
  // Valid token but insufficient role/permissions
  if (err.statusCode === 403) {
    return res.status(403).json({
      success: false,
      message: err.message || 'Forbidden. You do not have permission to access this resource.',
      errors:  [],
    });
  }

  // ── Not Found (404) ────────────────────────────────────────
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Resource not found',
      errors:  [],
    });
  }

  // ── Conflict (409) ─────────────────────────────────────────
  if (err.statusCode === 409) {
    return res.status(409).json({
      success: false,
      message: err.message || 'Conflict — resource already exists',
      errors:  err.errors || [],
    });
  }

  // ── Too Many Requests (429) ───────────────────────────────
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: err.message || 'Too many requests. Please try again later.',
      errors:  [],
    });
  }

  // ── Default: Internal Server Error (500) ──────────────────
  // Catch-all for any unhandled errors
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors:  err.errors || [],
    // Stack trace only in development mode — never expose in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorMiddleware };
