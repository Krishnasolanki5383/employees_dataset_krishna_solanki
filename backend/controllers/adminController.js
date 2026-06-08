// controllers/adminController.js
// Purpose: Handles HTTP request/response for admin-only routes.
//          NO business logic. NO DB queries.
//          All routes protected by authMiddleware + roleMiddleware.
//          Delegates to employeeService for actual data.

const employeeService = require('../services/employeeService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  ADMIN EMPLOYEE ROUTES
// ══════════════════════════════════════════════════════════════

/**
 * GET /admin/employees
 * Returns all employees — admin view (no pagination limit enforced).
 */
const getAdminEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    const message = result.pagination.totalRecords === 0
      ? 'No employees found'
      : `[ADMIN] ${result.pagination.totalRecords} employee(s) fetched`;
    return sendSuccess(res, 200, message, result.data, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/projects
 * Returns all employee projects — admin aggregated view.
 */
const getAdminProjects = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 50;
    const result = await employeeService.getAllProjects({ page, limit });
    return sendSuccess(
      res, 200,
      `[ADMIN] ${result.pagination.totalRecords} project record(s) fetched`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/tasks
 * Returns all employee tasks — admin aggregated view.
 */
const getAdminTasks = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 50;
    const result = await employeeService.getAllTasks({ page, limit });
    return sendSuccess(
      res, 200,
      `[ADMIN] ${result.pagination.totalRecords} task record(s) fetched`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/certifications
 * Returns all employees who hold certifications — admin view.
 */
const getAdminCertifications = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 50;
    const result = await employeeService.getRecentCertifications({ page, limit });
    return sendSuccess(
      res, 200,
      `[ADMIN] ${result.pagination.totalRecords} employee(s) with certifications`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  getAdminEmployees,
  getAdminProjects,
  getAdminTasks,
  getAdminCertifications,
};
