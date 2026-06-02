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
 * Supports pagination, sorting (PR 1), full-text search AND 15 query-param filters.
 * All params are optional and fully combinable in a single request.
 *
 * Pagination  : ?page=1&limit=10
 * Sorting (PR1): ?sort=<field>&order=asc|desc  (default: sort=name&order=asc)
 *   Allowed sort fields:
 *     ?sort=name          → Alphabetical A→Z
 *     ?sort=experience    → By years of experience
 *     ?sort=country       → By country
 *     ?sort=state         → By state
 *     ?sort=city          → By city
 *     ?sort=domain        → By domain / project area
 *     ?sort=timezone      → By timezone
 *     ?sort=certifications → By certifications
 *     ?sort=projects      → By projects
 *     ?sort=tasks         → By tasks
 *     ?sort=updatedAt     → By last-updated date
 *   Direction : ?order=asc (default) | ?order=desc
 * Full-text   : ?search=nodejs
 * Filters     : ?country=USA&primarySkill=Java&experience=5&verified=true
 *               ?certification=AWS&skill=Node.js&project=P321&task=T832
 *               ?technology=Kubernetes&emailVerified=true&timezone=UTC
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const {
      // ── Pagination & sorting ──────────────────────────────────
      page, limit, sort, order,
      // ── Full-text search ──────────────────────────────────────
      search,
      // ── 15 Query-parameter filters ────────────────────────────
      country,
      state,
      city,
      primarySkill,
      secondarySkill,
      domain,
      experience,
      verified,
      certification,
      timezone,
      project,
      task,
      technology,
      skill,
      emailVerified,
    } = req.query;

    const result = await employeeService.getAllEmployees(req.query);

    const message = result.pagination.totalRecords === 0
      ? 'No employees found'
      : `${result.pagination.totalRecords} employee(s) fetched successfully`;

    return sendSuccess(res, 200, message, result.data, result.pagination);
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

/** GET /employees/state/:state  |  Query: ?page=1&limit=15 */
const getByState = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getByState(req.params.state, { page, limit });
    if (result.pagination.totalRecords === 0)
      return sendError(res, 404, `No employees found in state '${req.params.state}'`);
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) found in state '${req.params.state}'`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/** GET /employees/country/:country  |  Query: ?page=1&limit=10 */
const getByCountry = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getByCountry(req.params.country, { page, limit });
    if (result.pagination.totalRecords === 0)
      return sendError(res, 404, `No employees found in country '${req.params.country}'`);
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) found in '${req.params.country}'`,
      result.data,
      result.pagination
    );
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

/** GET /employees/primary-skill/:skill  |  Query: ?page=1&limit=10 */
const getByPrimarySkill = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getByPrimarySkill(req.params.skill, { page, limit });
    if (result.pagination.totalRecords === 0)
      return sendError(res, 404, `No employees found with primary skill '${req.params.skill}'`);
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) with primary skill '${req.params.skill}'`,
      result.data,
      result.pagination
    );
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

/** GET /employees/domain/:domain  |  Query: ?page=1&limit=10 */
const getByDomain = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getByDomain(req.params.domain, { page, limit });
    if (result.pagination.totalRecords === 0)
      return sendError(res, 404, `No employees found in domain '${req.params.domain}'`);
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) in domain '${req.params.domain}'`,
      result.data,
      result.pagination
    );
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

/** GET /employees/verified  |  Query: ?page=1&limit=10 */
const getVerifiedEmployees = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getVerifiedEmployees({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} verified employee(s) found`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/** GET /employees/projects  |  Query: ?page=1&limit=20 */
const getAllProjects = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getAllProjects({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} project record(s) found`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/** GET /employees/tasks  |  Query: ?page=1&limit=20 */
const getAllTasks = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getAllTasks({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} task record(s) found`,
      result.data,
      result.pagination
    );
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

/** GET /employees/recent-certifications  |  Query: ?page=1&limit=10 */
const getRecentCertifications = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getRecentCertifications({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) with certifications`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 4: ROUTE PARAMETER CONTROLLERS
//  Handles /:projectId, /:taskId, /performance/:id, /stats/:id
// ══════════════════════════════════════════════════════════════

/** GET /employees/project/:projectId */
const getByProject = async (req, res, next) => {
  try {
    const result = await employeeService.getByProject(req.params.projectId);
    if (result.count === 0)
      return sendError(res, 404, `No employees found assigned to project '${req.params.projectId}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) found for project '${req.params.projectId}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/task/:taskId */
const getByTask = async (req, res, next) => {
  try {
    const result = await employeeService.getByTask(req.params.taskId);
    if (result.count === 0)
      return sendError(res, 404, `No employees found assigned to task '${req.params.taskId}'`);
    return sendSuccess(res, 200, `${result.count} employee(s) found for task '${req.params.taskId}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/performance/:id */
const getEmployeePerformance = async (req, res, next) => {
  try {
    const result = await employeeService.getEmployeePerformance(req.params.id);
    if (!result)
      return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    return sendSuccess(res, 200, `Performance data fetched for employee '${result.name}'`, result);
  } catch (error) {
    next(error);
  }
};

/** GET /employees/stats/:id */
const getEmployeeStats = async (req, res, next) => {
  try {
    const result = await employeeService.getEmployeeStats(req.params.id);
    if (!result)
      return sendError(res, 404, `Employee with ID '${req.params.id}' not found`);
    return sendSuccess(res, 200, `Statistics fetched for employee '${result.name}'`, result);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 5: DEDICATED SORT CONTROLLERS (PR 2)
//  One controller per dedicated sort route.
//  Controllers handle req/res ONLY — all logic is in employeeService.
// ══════════════════════════════════════════════════════════════

/** GET /employees/sort/experience-desc  |  Query: ?page=1&limit=10 */
const sortByExperienceDesc = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getSortedByExperienceDesc({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) sorted by experience (highest first)`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/** GET /employees/sort/name-asc  |  Query: ?page=1&limit=10 */
const sortByNameAsc = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getSortedByNameAsc({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) sorted by name (A → Z)`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/** GET /employees/sort/project-asc  |  Query: ?page=1&limit=10 */
const sortByProjectAsc = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getSortedByProjectAsc({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) sorted by project name (A → Z)`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/** GET /employees/sort/domain-asc  |  Query: ?page=1&limit=10 */
const sortByDomainAsc = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getSortedByDomainAsc({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) sorted by domain (A → Z)`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/** GET /employees/sort/certification-desc  |  Query: ?page=1&limit=10 */
const sortByCertificationDesc = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getSortedByCertificationDesc({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) sorted by certification count (most first)`,
      result.data,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

/** GET /employees/sort/lastUpdated-desc  |  Query: ?page=1&limit=10 */
const sortByLastUpdatedDesc = async (req, res, next) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await employeeService.getSortedByLastUpdatedDesc({ page, limit });
    return sendSuccess(
      res, 200,
      `${result.pagination.totalRecords} employee(s) sorted by last updated (most recent first)`,
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
  // Filters — Location
  getByName,
  getByState,
  getByCountry,
  getByCity,
  getByTimezone,
  // Filters — Skills & Domain
  getByPrimarySkill,
  getBySecondarySkill,
  getByDomain,
  getByExperience,
  getByCertification,
  // Filters — Status / Arrays
  getVerifiedEmployees,
  getAllProjects,
  getAllTasks,
  // Filters — Analytics
  getTopExperience,
  getTopSkills,
  // Filters — Role-based
  getCloudEngineers,
  getDevOpsEngineers,
  getAIEngineers,
  getFullStackDevelopers,
  getRecentCertifications,
  // Route Parameter Controllers (Section 4)
  getByProject,
  getByTask,
  getEmployeePerformance,
  getEmployeeStats,
  // PR 2 — Dedicated Sort Controllers (Section 5)
  sortByExperienceDesc,
  sortByNameAsc,
  sortByProjectAsc,
  sortByDomainAsc,
  sortByCertificationDesc,
  sortByLastUpdatedDesc,
};
