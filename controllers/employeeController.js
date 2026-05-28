// controllers/employeeController.js
// Purpose: Handles HTTP request/response ONLY.
//          NO business logic. NO database queries.
//          Delegates ALL logic to employeeService.
//          Follows Checklist #12 (MVC) and #5 (CRUD).

const employeeService = require('../services/employeeService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: BASIC CRUD
// ══════════════════════════════════════════════════════════════

/**
 * GET /employees
 * Fetch all employees (with pagination, sorting, search via query params)
 * Query: ?page=1&limit=10&sort=createdAt&order=desc&search=nodejs
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    return sendSuccess(res, 200, 'Employees fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /employees/:id
 * Fetch a single employee by MongoDB ObjectId
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) {
      return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    }
    return sendSuccess(res, 200, 'Employee fetched successfully', employee);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /employees
 * Create a new employee record
 * Body: { name, email, phone, city, state, country, ... }
 */
const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    return sendSuccess(res, 201, 'Employee created successfully', employee);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /employees/:id
 * Replace the ENTIRE employee document (full replacement)
 * Body: complete employee object
 */
const replaceEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.replaceEmployee(req.params.id, req.body);
    if (!employee) {
      return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    }
    return sendSuccess(res, 200, 'Employee replaced successfully', employee);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /employees/:id
 * Update specific fields of an employee (partial update)
 * Body: { field: value, ... }
 */
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    if (!employee) {
      return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    }
    return sendSuccess(res, 200, 'Employee updated successfully', employee);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /employees/:id
 * Permanently delete a single employee
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    if (!employee) {
      return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    }
    return sendSuccess(res, 200, 'Employee deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /employees/exists/:id
 * Check if an employee exists (returns boolean)
 */
const checkEmployeeExists = async (req, res, next) => {
  try {
    const exists = await employeeService.checkEmployeeExists(req.params.id);
    return sendSuccess(
      res,
      200,
      exists ? 'Employee exists' : 'Employee does not exist',
      { exists }
    );
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: BULK OPERATIONS
// ══════════════════════════════════════════════════════════════

/**
 * POST /employees/bulk-create
 * Insert multiple employees in one request
 * Body: { employees: [ {...}, {...}, ... ] }
 */
const bulkCreate = async (req, res, next) => {
  try {
    const { employees } = req.body;
    if (!Array.isArray(employees) || employees.length === 0) {
      return sendError(res, 400, '"employees" must be a non-empty array');
    }
    const result = await employeeService.bulkCreateEmployees(employees);
    return sendSuccess(res, 201, `${result.length} employees created successfully`, result);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /employees/bulk-update
 * Update multiple employees in one request
 * Body: { updates: [ { id: "...", data: { field: value } }, ... ] }
 */
const bulkUpdate = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return sendError(res, 400, '"updates" must be a non-empty array');
    }
    const result = await employeeService.bulkUpdateEmployees(updates);
    return sendSuccess(res, 200, 'Bulk update completed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /employees/bulk-delete
 * Delete multiple employees by their IDs in one request
 * Body: { ids: ["id1", "id2", ...] }
 */
const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 400, '"ids" must be a non-empty array');
    }
    const result = await employeeService.bulkDeleteEmployees(ids);
    return sendSuccess(res, 200, `${result.deletedCount} employees deleted successfully`, result);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  replaceEmployee,
  updateEmployee,
  deleteEmployee,
  checkEmployeeExists,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
};
