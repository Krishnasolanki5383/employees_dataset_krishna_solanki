// middlewares/requestTimeMiddleware.js
// Purpose: Records request start time and attaches X-Response-Time header.
//          Calculates elapsed time in milliseconds using process.hrtime.bigint().
//          Injected globally or per-route for performance monitoring.

/**
 * requestTimeMiddleware
 * Records the high-resolution start time before the request is processed.
 * On response finish, calculates elapsed time and sets X-Response-Time header.
 *
 * Header: X-Response-Time: <N>ms
 */
const requestTimeMiddleware = (req, res, next) => {
  const startTime = process.hrtime.bigint(); // nanosecond precision

  // Override res.writeHead to inject header before they are written to the client
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    const endTime  = process.hrtime.bigint();
    const elapsedMs = Number(endTime - startTime) / 1_000_000; // ns → ms
    res.setHeader('X-Response-Time', `${elapsedMs.toFixed(2)}ms`);
    return originalWriteHead.apply(this, args);
  };

  // Also attach start time to req for use in controllers/logging
  req.startTime = Date.now();

  next();
};

module.exports = { requestTimeMiddleware };
