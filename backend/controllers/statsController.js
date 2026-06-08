// controllers/statsController.js
// Purpose: Handles HTTP request/response ONLY for statistics routes.
//          NO aggregation logic. NO database queries.
//          Delegates ALL pipeline execution to statsService.
//          Follows strict MVC: controllers own req/res, services own logic.

const statsService = require('../services/statsService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: COUNT STATISTICS CONTROLLERS  (PR 1 — 5 routes)
// ══════════════════════════════════════════════════════════════

/**
 * GET /stats/employees/count
 * Returns the total number of employees in the collection.
 */
const getTotalEmployeeCount = async (req, res, next) => {
  try {
    const data = await statsService.getTotalEmployeeCount();
    return sendSuccess(res, 200, 'Total employee count fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/verified-count
 * Returns the count of verified employees (isVerified: true).
 */
const getVerifiedEmployeeCount = async (req, res, next) => {
  try {
    const data = await statsService.getVerifiedEmployeeCount();
    return sendSuccess(res, 200, 'Verified employee count fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/country-count
 * Returns employee count grouped by country, sorted descending.
 */
const getEmployeeCountByCountry = async (req, res, next) => {
  try {
    const data = await statsService.getEmployeeCountByCountry();
    const message = data.length === 0
      ? 'No country data found'
      : `Employee count by country fetched — ${data.length} country/countries found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/domain-count
 * Returns employee count grouped by domain, sorted descending.
 */
const getEmployeeCountByDomain = async (req, res, next) => {
  try {
    const data = await statsService.getEmployeeCountByDomain();
    const message = data.length === 0
      ? 'No domain data found'
      : `Employee count by domain fetched — ${data.length} domain(s) found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/skill-count
 * Returns employee count grouped by primarySkill, sorted descending.
 */
const getEmployeeCountBySkill = async (req, res, next) => {
  try {
    const data = await statsService.getEmployeeCountBySkill();
    const message = data.length === 0
      ? 'No skill data found'
      : `Employee count by skill fetched — ${data.length} skill(s) found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: DISTRIBUTION STATISTICS CONTROLLERS  (PR 2 — 5 routes)
// ══════════════════════════════════════════════════════════════

/**
 * GET /stats/employees/state-count
 * Returns employee count grouped by state, sorted descending.
 */
const getEmployeeCountByState = async (req, res, next) => {
  try {
    const data = await statsService.getEmployeeCountByState();
    const message = data.length === 0
      ? 'No state data found'
      : `Employee count by state fetched — ${data.length} state(s) found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/timezone-count
 * Returns employee count grouped by timezone, sorted descending.
 */
const getTimezoneCount = async (req, res, next) => {
  try {
    const data = await statsService.getTimezoneCount();
    const message = data.length === 0
      ? 'No timezone data found'
      : `Timezone distribution fetched — ${data.length} timezone(s) found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/certification-count
 * Returns count of each certification across all employees, sorted descending.
 */
const getCertificationCount = async (req, res, next) => {
  try {
    const data = await statsService.getCertificationCount();
    const message = data.length === 0
      ? 'No certification data found'
      : `Certification records fetched — ${data.length} unique certification(s) found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/project-distribution
 * Returns aggregate project distribution stats (total, avg, max, min).
 */
const getProjectDistribution = async (req, res, next) => {
  try {
    const data = await statsService.getProjectDistribution();
    return sendSuccess(res, 200, 'Project distribution fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/task-distribution
 * Returns aggregate task distribution stats (total, avg, max, min).
 */
const getTaskDistribution = async (req, res, next) => {
  try {
    const data = await statsService.getTaskDistribution();
    return sendSuccess(res, 200, 'Task distribution fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3: ADVANCED STATISTICS CONTROLLERS  (PR 3 — 5 routes)
// ══════════════════════════════════════════════════════════════

/**
 * GET /stats/employees/experience-average
 * Returns average, max, and min experience across all employees.
 */
const getExperienceAverage = async (req, res, next) => {
  try {
    const data = await statsService.getExperienceAverage();
    return sendSuccess(res, 200, 'Experience average stats fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/top-experience
 * Returns the top 5 most experienced employees.
 */
const getTopExperiencedEmployees = async (req, res, next) => {
  try {
    const data = await statsService.getTopExperiencedEmployees();
    const message = data.length === 0
      ? 'No employee data found'
      : `Top ${data.length} most experienced employee(s) fetched successfully`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/project-count
 * Returns the total number of individual project entries across all employees.
 */
const getTotalProjectCount = async (req, res, next) => {
  try {
    const data = await statsService.getTotalProjectCount();
    return sendSuccess(res, 200, 'Total project count fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/task-count
 * Returns the total number of individual task entries across all employees.
 */
const getTotalTaskCount = async (req, res, next) => {
  try {
    const data = await statsService.getTotalTaskCount();
    return sendSuccess(res, 200, 'Total task count fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /stats/employees/technology-count
 * Returns count of each technology across all employees, sorted descending.
 */
const getTechnologyCount = async (req, res, next) => {
  try {
    const data = await statsService.getTechnologyCount();
    const message = data.length === 0
      ? 'No technology data found'
      : `Technology usage fetched — ${data.length} unique technology/technologies found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  // Section 1 — Count Statistics (PR 1)
  getTotalEmployeeCount,
  getVerifiedEmployeeCount,
  getEmployeeCountByCountry,
  getEmployeeCountByDomain,
  getEmployeeCountBySkill,
  // Section 2 — Distribution Statistics (PR 2)
  getEmployeeCountByState,
  getTimezoneCount,
  getCertificationCount,
  getProjectDistribution,
  getTaskDistribution,
  // Section 3 — Advanced Statistics (PR 3)
  getExperienceAverage,
  getTopExperiencedEmployees,
  getTotalProjectCount,
  getTotalTaskCount,
  getTechnologyCount,
};
