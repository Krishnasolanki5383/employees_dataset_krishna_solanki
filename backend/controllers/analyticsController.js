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
//  SECTION 2: DISTRIBUTION ANALYSIS CONTROLLERS  (PR 2 — 5 routes)
// ══════════════════════════════════════════════════════════════

/**
 * GET /analytics/employees/skill-distribution
 * Returns complete skill distribution across all employees.
 */
const getSkillDistribution = async (req, res, next) => {
  try {
    const data = await analyticsService.getSkillDistribution();
    const message = data.length === 0
      ? 'No skill distribution data found'
      : `Skill distribution fetched — ${data.length} unique skill(s) found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/employees/domain-distribution
 * Returns complete domain distribution across all employees.
 */
const getDomainDistribution = async (req, res, next) => {
  try {
    const data = await analyticsService.getDomainDistribution();
    const message = data.length === 0
      ? 'No domain distribution data found'
      : `Domain distribution fetched — ${data.length} unique domain(s) found`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/employees/experience-analysis
 * Returns employee count broken down by experience band
 * (Junior / Mid / Senior / Expert).
 */
const getExperienceAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getExperienceAnalysis();
    const message = data.length === 0
      ? 'No experience data found'
      : `Experience analysis fetched — ${data.length} band(s) returned`;
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/employees/verification-analysis
 * Returns Verified vs Unverified employee counts.
 */
const getVerificationAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getVerificationAnalysis();
    const message = data.length === 0
      ? 'No verification data found'
      : 'Verification analysis fetched successfully';
    return sendSuccess(res, 200, message, data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/employees/timezone-analysis
 * Returns complete timezone distribution across all employees.
 */
const getTimezoneAnalysis = async (req, res, next) => {
  try {
    const data = await analyticsService.getTimezoneAnalysis();
    const message = data.length === 0
      ? 'No timezone data found'
      : `Timezone analysis fetched — ${data.length} unique timezone(s) found`;
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
  // Section 2 — Distribution Analysis (PR 2)
  getSkillDistribution,
  getDomainDistribution,
  getExperienceAnalysis,
  getVerificationAnalysis,
  getTimezoneAnalysis,
};
