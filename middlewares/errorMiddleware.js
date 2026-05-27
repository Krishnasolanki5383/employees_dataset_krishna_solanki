// middlewares/errorMiddleware.js — Global error handler that catches all unhandled errors in the app

const errorMiddleware = (err, req, res, next) => {
  console.error(`❌ [ERROR] ${err.message}`);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `Duplicate value for field: ${field}` });
  }

  // Mongoose Invalid ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Default Server Error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = { errorMiddleware };
