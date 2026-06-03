// middlewares/index.js — Barrel file for clean imports from the middlewares folder

const { authMiddleware }                                        = require('./authMiddleware');
const { errorMiddleware }                                       = require('./errorMiddleware');
const { loggerMiddleware }                                      = require('./loggerMiddleware');
const { validateEmployee, validateBulkCreate, validateBulkDelete } = require('./validationMiddleware');

module.exports = {
  authMiddleware,
  errorMiddleware,
  loggerMiddleware,
  validateEmployee,
  validateBulkCreate,
  validateBulkDelete,
};
