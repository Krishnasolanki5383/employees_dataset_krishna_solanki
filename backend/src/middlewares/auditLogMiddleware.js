// middlewares/auditLogMiddleware.js
// Purpose: Logs every incoming request with method, URL, user identity,
//          and timestamp. Designed for audit trail / compliance logging.
//          Outputs to console (extend to file/DB for production use).

/**
 * auditLogMiddleware
 * Captures: method, URL, IP, user (from JWT if authenticated), timestamp.
 * Called on every request for full audit coverage.
 *
 * Log format:
 *   [AUDIT] 2025-01-01T00:00:00.000Z | GET /employees | user: admin@example.com | IP: ::1
 */
const auditLogMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method    = req.method;
  const url       = req.originalUrl;
  const ip        = req.ip || req.connection?.remoteAddress || 'unknown';

  // User identity from JWT decoded payload (set by authMiddleware if present)
  const user = req.user
    ? (req.user.email || req.user.id || req.user.sub || 'authenticated-user')
    : 'anonymous';

  const logEntry = `[AUDIT] ${timestamp} | ${method} ${url} | user: ${user} | IP: ${ip}`;
  console.log(logEntry);

  // Attach log metadata to req for downstream use (e.g., response logging)
  req.auditLog = { timestamp, method, url, user, ip };

  next();
};

module.exports = { auditLogMiddleware };
