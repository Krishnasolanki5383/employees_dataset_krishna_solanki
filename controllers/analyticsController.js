// controllers/analyticsController.js
// Purpose: Handles HTTP request/response ONLY for analytics routes.
//          NO aggregation logic. NO database queries.
//          Delegates ALL pipeline execution to analyticsService.
//          Follows strict MVC: controllers own req/res, services own logic.

const analyticsService = require('../services/analyticsService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: TOP ANALYTICS CONTROLLERS  (PR 1 — 5 routes)
// ══════════════════════════════════════════════════════════════

/**
 * GET /analytics/employees/top-skills
 * Returns top 10 most popular primary skills across all employees.
 */
const getTopSkills = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopSkills();
    const message = data.length === 0
      ? 'No skill data found'
      : `Top ${data.length} skills fetched successfully`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/employees/top-domains
 * Returns top 10 most active domains across all employees.
 */
const getTopDomains = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopDomains();
    const message = data.length === 0
      ? 'No domain data found'
      : `Top ${data.length} domains fetched successfully`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/employees/top-certifications
 * Returns top 10 most popular certifications held by employees.
 */
const getTopCertifications = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopCertifications();
    const message = data.length === 0
      ? 'No certification data found'
      : `Top ${data.length} certifications fetched successfully`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/employees/top-projects
 * Returns top 10 most common projects assigned to employees.
 */
const getTopProjects = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopProjects();
    const message = data.length === 0
      ? 'No project data found'
      : `Top ${data.length} projects fetched successfully`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/employees/top-technologies
 * Returns top 10 most common secondary skills / technologies used by employees.
 */
const getTopTechnologies = async (req, res, next) => {
  try {
    const data = await analyticsService.getTopTechnologies();
    const message = data.length === 0
      ? 'No technology data found'
      : `Top ${data.length} technologies fetched successfully`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  // Section 1 — Top Analytics (PR 1)
  getTopSkills,
  getTopDomains,
  getTopCertifications,
  getTopProjects,
  getTopTechnologies,
};
