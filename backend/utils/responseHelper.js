// utils/responseHelper.js — Provides standardized success and error response format across the API

/**
 * sendSuccess
 * @param {object}  res        - Express response object
 * @param {number}  statusCode - HTTP status code
 * @param {string}  message    - Human-readable message
 * @param {*}       data       - Response payload (default null)
 * @param {object}  pagination - Optional pagination metadata object
 *   Shape: { currentPage, totalPages, totalRecords, limit,
 *            hasNextPage, hasPrevPage }
 */
const sendSuccess = (res, statusCode, message, data = null, pagination = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(pagination && { pagination }),
    data,
  });
};

const sendError = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

module.exports = { sendSuccess, sendError };

