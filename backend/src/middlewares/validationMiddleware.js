// middlewares/validationMiddleware.js
// Purpose: Validates incoming request body fields before passing to controller.
//          PR 5: Extended with full employee validation + auth validation.
//          Returns 400 Bad Request with a structured errors[] array on failure.

const { sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  EMPLOYEE VALIDATION (POST /employees, POST /protected/employees)
// ══════════════════════════════════════════════════════════════

/**
 * validateEmployee
 * Validates all required and formatted fields for creating/updating an employee.
 * Fields validated: name, email, phone, experience, primarySkill
 */
const validateEmployee = (req, res, next) => {
  const errors = [];
  const { name, email, phone, experience, primarySkill } = req.body;

  // name: required, string
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }

  // email: required, valid format
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Valid email address is required');
  }

  // phone: valid number format (7-20 digits, optional +/spaces/dashes)
  if (phone && !/^[+]?[\d\s\-().]{7,20}$/.test(phone)) {
    errors.push('Valid phone number is required (7-20 digits, may include +, spaces, dashes)');
  }

  // experience: number, min 0, max 50
  if (experience !== undefined && experience !== null && experience !== '') {
    const exp = Number(experience);
    if (isNaN(exp) || exp < 0 || exp > 50) {
      errors.push('Experience must be a number between 0 and 50');
    }
  }

  // primarySkill: required, string
  if (!primarySkill || typeof primarySkill !== 'string' || primarySkill.trim() === '') {
    errors.push('Primary skill is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// ══════════════════════════════════════════════════════════════
//  AUTH VALIDATION (POST /auth/register, POST /auth/login)
// ══════════════════════════════════════════════════════════════

/**
 * validateRegister
 * Validates email and password strength for user registration.
 * Password rules: min 8 chars, must have uppercase, number, special char.
 */
const validateRegister = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  // email: required, valid format
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Valid email address is required');
  }

  // password: required, min 8 chars, uppercase, number, special character
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8)
      errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password))
      errors.push('Password must contain at least one uppercase letter');
    if (!/[0-9]/.test(password))
      errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      errors.push('Password must contain at least one special character');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * validateLogin
 * Validates email and password presence for login.
 */
const validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// ══════════════════════════════════════════════════════════════
//  BULK OPERATION VALIDATION
// ══════════════════════════════════════════════════════════════

/**
 * validateBulkCreate
 * Ensures 'employees' is a non-empty array.
 */
const validateBulkCreate = (req, res, next) => {
  const { employees } = req.body;

  if (!Array.isArray(employees) || employees.length === 0) {
    return sendError(res, 400, 'employees must be a non-empty array');
  }

  next();
};

/**
 * validateBulkDelete
 * Ensures 'ids' is a non-empty array.
 */
const validateBulkDelete = (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return sendError(res, 400, 'ids must be a non-empty array');
  }

  next();
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  validateEmployee,
  validateRegister,
  validateLogin,
  validateBulkCreate,
  validateBulkDelete,
};
