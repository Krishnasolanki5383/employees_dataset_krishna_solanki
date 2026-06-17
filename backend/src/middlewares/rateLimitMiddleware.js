// middlewares/rateLimitMiddleware.js
// Purpose: Limits the number of requests per IP using express-rate-limit.
//          Returns HTTP 429 Too Many Requests if limit is exceeded.
//          Max: 100 requests per 15-minute window per IP.

const rateLimit = require('express-rate-limit');

/**
 * rateLimitMiddleware
 * Applied globally or per-route to prevent brute-force / DDoS abuse.
 * Window : 15 minutes
 * Max    : 100 requests per IP
 */
const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max:      100,             // max requests per IP per window
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders:   false,    // Disable X-RateLimit-* legacy headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

/**
 * strictRateLimitMiddleware
 * Tighter limit for sensitive auth routes (login, register, OTP).
 * Window : 15 minutes
 * Max    : 10 requests per IP
 */
const strictRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,              // stricter limit for auth endpoints
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },
});

module.exports = { rateLimitMiddleware, strictRateLimitMiddleware };
