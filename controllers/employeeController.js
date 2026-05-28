// controllers/employeeController.js
// Purpose: Handles HTTP request/response ONLY.
//          NO business logic. NO database queries.
//          Delegates ALL logic to employeeService.
//          Follows Checklist #12 (MVC) and #5/#6 (CRUD + Filtering).

const employeeService = require('../services/employeeService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: BASIC CRUD
// ══════════════════════════════════════════════════════════════

/**
 * GET /employees
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

/** GET /employees/:id */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    return sendSuccess(res, 200, 'Employee fetched successfully', employee);
  } catch (error) {
    next(error);
  }
};

/** POST /employees */
const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    return sendSuccess(res, 201, 'Employee created successfully', employee);
  } catch (error) {
    next(error);
  }
};

/** PUT /employees/:id */
const replaceEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.replaceEmployee(req.params.id, req.body);
    if (!employee) return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    return sendSuccess(res, 200, 'Employee replaced successfully', employee);
  } catch (error) {
    next(error);
  }
};

/** PATCH /employees/:id */
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    if (!employee) return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    return sendSuccess(res, 200, 'Employee updated successfully', employee);
  } catch (error) {
    next(error);
  }
};

/** DELETE /employees/:id */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    if (!employee) return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    return sendSuccess(res, 200, 'Employee deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/exists/:id */
const checkEmployeeExists = async (req, res, next) => {
  try {
    const exists = await employeeService.checkEmployeeExists(req.params.id);
    return sendSuccess(res, 200, exists ? 'Employee exists' : 'Employee does not exist', { exists });
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: BULK OPERATIONS
// ══════════════════════════════════════════════════════════════

/** POST /employees/bulk-create  |  Body: { employees: [...] } */
const bulkCreate = async (req, res, next) => {
  try {
    const { employees } = req.body;
    if (!Array.isArray(employees) || employees.length === 0)
      return sendError(res, 400, '"employees" must be a non-empty array');
    const result = await employeeService.bulkCreateEmployees(employees);
    return sendSuccess(res, 201, `${result.length} employees created successfully`, result);
  } catch (error) {
    next(error);
  }
};

/** PATCH /employees/bulk-update  |  Body: { updates: [{ id, data }] } */
const bulkUpdate = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0)
      return sendError(res, 400, '"updates" must be a non-empty array');
    const result = await employeeService.bulkUpdateEmployees(updates);
    return sendSuccess(res, 200, 'Bulk update completed successfully', result);
  } catch (error) {
    next(error);
  }
};

/** DELETE /employees/bulk-delete  |  Body: { ids: [...] } */
const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendError(res, 400, '"ids" must be a non-empty array');
    const result = await employeeService.bulkDeleteEmployees(ids);
    return sendSuccess(res, 200, `${result.deletedCount} employees deleted successfully`, result);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3: FILTER / INFORMATION CONTROLLERS
// ══════════════════════════════════════════════════════════════

/** GET /employees/name/:name */
const getByName = async (req, res, next) => {
  try {
    const result = await employeeService.getByName(req.params.name);
    if (result.count === 0) return sendError(res, 404, `No employees found with name matching '${req.params.name}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/state/:state */
const getByState = async (req, res, next) => {
  try {
    const result = await employeeService.getByState(req.params.state);
    if (result.count === 0) return sendError(res, 404, `No employees found in state '${req.params.state}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) found in state '${req.params.state}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/country/:country */
const getByCountry = async (req, res, next) => {
  try {
    const result = await employeeService.getByCountry(req.params.country);
    if (result.count === 0) return sendError(res, 404, `No employees found in country '${req.params.country}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) found in '${req.params.country}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/city/:city */
const getByCity = async (req, res, next) => {
  try {
    const result = await employeeService.getByCity(req.params.city);
    if (result.count === 0) return sendError(res, 404, `No employees found in city '${req.params.city}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) found in '${req.params.city}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/timezone/:timezone */
const getByTimezone = async (req, res, next) => {
  try {
    const result = await employeeService.getByTimezone(req.params.timezone);
    if (result.count === 0) return sendError(res, 404, `No employees found in timezone '${req.params.timezone}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/primary-skill/:skill */
const getByPrimarySkill = async (req, res, next) => {
  try {
    const result = await employeeService.getByPrimarySkill(req.params.skill);
    if (result.count === 0) return sendError(res, 404, `No employees found with primary skill '${req.params.skill}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) with primary skill '${req.params.skill}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/secondary-skill/:skill */
const getBySecondarySkill = async (req, res, next) => {
  try {
    const result = await employeeService.getBySecondarySkill(req.params.skill);
    if (result.count === 0) return sendError(res, 404, `No employees found with secondary skill '${req.params.skill}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) with secondary skill '${req.params.skill}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/domain/:domain */
const getByDomain = async (req, res, next) => {
  try {
    const result = await employeeService.getByDomain(req.params.domain);
    if (result.count === 0) return sendError(res, 404, `No employees found in domain '${req.params.domain}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) in domain '${req.params.domain}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/experience/:years */
const getByExperience = async (req, res, next) => {
  try {
    const years = Number(req.params.years);
    if (isNaN(years) || years < 0)
      return sendError(res, 400, 'Experience must be a valid non-negative number');
    const result = await employeeService.getByExperience(years);
    if (result.count === 0) return sendError(res, 404, `No employees found with ${years}+ years of experience`);
    return sendSuccess(res, 200, `${result.count} employee(s) with ${years}+ years of experience`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/certification/:cert */
const getByCertification = async (req, res, next) => {
  try {
    const result = await employeeService.getByCertification(req.params.cert);
    if (result.count === 0) return sendError(res, 404, `No employees found with certification '${req.params.cert}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) with certification '${req.params.cert}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/verified */
const getVerifiedEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getVerifiedEmployees();
    return sendSuccess(res, 200, `${result.count} verified employee(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/projects */
const getAllProjects = async (req, res, next) => {
  try {
    const result = await employeeService.getAllProjects();
    return sendSuccess(res, 200, `${result.count} project record(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/tasks */
const getAllTasks = async (req, res, next) => {
  try {
    const result = await employeeService.getAllTasks();
    return sendSuccess(res, 200, `${result.count} task record(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/top-experience  |  Query: ?limit=10 */
const getTopExperience = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const result = await employeeService.getTopExperience(limit);
    return sendSuccess(res, 200, `Top ${result.count} most experienced employees`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/top-skills */
const getTopSkills = async (req, res, next) => {
  try {
    const result = await employeeService.getTopSkills();
    return sendSuccess(res, 200, `${result.count} unique skills found across employees`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/cloud-engineers */
const getCloudEngineers = async (req, res, next) => {
  try {
    const result = await employeeService.getCloudEngineers();
    return sendSuccess(res, 200, `${result.count} cloud engineer(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/devops-engineers */
const getDevOpsEngineers = async (req, res, next) => {
  try {
    const result = await employeeService.getDevOpsEngineers();
    return sendSuccess(res, 200, `${result.count} DevOps engineer(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/ai-engineers */
const getAIEngineers = async (req, res, next) => {
  try {
    const result = await employeeService.getAIEngineers();
    return sendSuccess(res, 200, `${result.count} AI/ML engineer(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/fullstack */
const getFullStackDevelopers = async (req, res, next) => {
  try {
    const result = await employeeService.getFullStackDevelopers();
    return sendSuccess(res, 200, `${result.count} full stack developer(s) found`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/recent-certifications */
const getRecentCertifications = async (req, res, next) => {
  try {
    const result = await employeeService.getRecentCertifications();
    return sendSuccess(res, 200, `${result.count} employee(s) with certifications`, result);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  // CRUD
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  replaceEmployee,
  updateEmployee,
  deleteEmployee,
  checkEmployeeExists,
  // Bulk
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  // Filters
  getByName,
  getByState,
  getByCountry,
  getByCity,
  getByTimezone,
  getByPrimarySkill,
  getBySecondarySkill,
  getByDomain,
  getByExperience,
  getByCertification,
  getVerifiedEmployees,
  getAllProjects,
  getAllTasks,
  getTopExperience,
  getTopSkills,
  getCloudEngineers,
  getDevOpsEngineers,
  getAIEngineers,
  getFullStackDevelopers,
  getRecentCertifications,
};
