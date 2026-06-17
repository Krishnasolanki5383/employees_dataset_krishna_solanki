// middlewares/index.js — Barrel file for clean imports from the middlewares folder

const { authMiddleware }                                           = require('./authMiddleware');
const { errorMiddleware }                                          = require('./errorMiddleware');
const { loggerMiddleware }                                         = require('./loggerMiddleware');
const { roleMiddleware }                                           = require('./roleMiddleware');
const { rateLimitMiddleware, strictRateLimitMiddleware }           = require('./rateLimitMiddleware');
const { requestTimeMiddleware }                                    = require('./requestTimeMiddleware');
const { auditLogMiddleware }                                       = require('./auditLogMiddleware');
const { validateEmployee, validateRegister, validateLogin,
        validateBulkCreate, validateBulkDelete }                   = require('./validationMiddleware');

module.exports = {
  // Core middleware
  authMiddleware,
  errorMiddleware,
  loggerMiddleware,
  // New middleware (PR 1)
  roleMiddleware,
  rateLimitMiddleware,
  strictRateLimitMiddleware,
  requestTimeMiddleware,
  auditLogMiddleware,
  // Validation middleware (PR 5)
  validateEmployee,
  validateRegister,
  validateLogin,
  validateBulkCreate,
  validateBulkDelete,
};
