// middlewares/loggerMiddleware.js — Logs every incoming HTTP request with method, URL, and response time

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '❌' : status >= 400 ? '⚠️' : '✅';
    console.log(
      `${color} [${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status} (${duration}ms)`
    );
  });

  next();
};

module.exports = { loggerMiddleware };
