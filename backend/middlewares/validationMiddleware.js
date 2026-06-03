// middlewares/validationMiddleware.js — Validates incoming request body fields before passing to controller

const { sendError } = require('../utils/responseHelper');

const validateEmployee = (req, res, next) => {
  const { name, email } = req.body;

  if (!name || name.trim() === '') {
    return sendError(res, 400, 'Employee name is required');
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return sendError(res, 400, 'A valid email address is required');
  }

  next();
};

const validateBulkCreate = (req, res, next) => {
  const { employees } = req.body;

  if (!Array.isArray(employees) || employees.length === 0) {
    return sendError(res, 400, 'employees must be a non-empty array');
  }

  next();
};

const validateBulkDelete = (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return sendError(res, 400, 'ids must be a non-empty array');
  }

  next();
};

module.exports = { validateEmployee, validateBulkCreate, validateBulkDelete };
