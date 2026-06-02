// services/analyticsService.js
// Purpose: Contains ALL MongoDB Aggregation Pipeline logic for analytics routes.
//          Controllers NEVER run pipelines directly — they call these service functions.
//          Uses Employee.aggregate([]) exclusively — no .find() calls.
//          Follows strict MVC: this layer owns ALL query/pipeline logic.

const Employee = require('../models/employeeModel');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: TOP ANALYTICS  (PR 1 — 5 routes)
//  Each returns the top-10 ranked items via $group → $sort → $limit
// ══════════════════════════════════════════════════════════════

/**
 * GET /analytics/employees/top-skills
 * Groups all employees by primarySkill, counts occurrences,
 * returns the top 10 most popular skills descending.
 */
const getTopSkills = async () => {
  const data = await Employee.aggregate([
    { $match: { primarySkill: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$primarySkill',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        skill: '$_id',
        count: 1,
      },
    },
  ]);

  return data;
};

/**
 * GET /analytics/employees/top-domains
 * Groups all employees by domain, counts occurrences,
 * returns the top 10 most active domains descending.
 */
const getTopDomains = async () => {
  const data = await Employee.aggregate([
    { $match: { domain: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$domain',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        domain: '$_id',
        count: 1,
      },
    },
  ]);

  return data;
};

/**
 * GET /analytics/employees/top-certifications
 * Unwinds the certifications array so each certification becomes its own document,
 * then groups by certification name, counts occurrences,
 * returns top 10 most popular certifications descending.
 */
const getTopCertifications = async () => {
  const data = await Employee.aggregate([
    { $match: { certifications: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$certifications' },
    { $match: { certifications: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$certifications',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        certification: '$_id',
        count: 1,
      },
    },
  ]);

  return data;
};

/**
 * GET /analytics/employees/top-projects
 * Unwinds the projects array (stored as [String]), groups by project name,
 * counts occurrences, returns the top 10 most common projects descending.
 * Note: projects field is [String] — grouping by the string value directly.
 */
const getTopProjects = async () => {
  const data = await Employee.aggregate([
    { $match: { projects: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$projects' },
    { $match: { projects: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$projects',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        project: '$_id',
        count: 1,
      },
    },
  ]);

  return data;
};

/**
 * GET /analytics/employees/top-technologies
 * Groups employees by secondarySkill as a proxy for technology stack
 * (the schema does not have a dedicated `technologies` array field).
 * Unwinds and groups by secondarySkill to surface top-10 technology usage.
 *
 * ⚠️  Note: If a `technologies` field is added to the schema in the future,
 *     replace '$secondarySkill' with '$technologies' and add $unwind back.
 */
const getTopTechnologies = async () => {
  const data = await Employee.aggregate([
    { $match: { secondarySkill: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$secondarySkill',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        technology: '$_id',
        count: 1,
      },
    },
  ]);

  return data;
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: DISTRIBUTION ANALYSIS  (PR 2 — 5 routes)
//  Full dataset breakdowns — no $limit, returns every group
// ══════════════════════════════════════════════════════════════

/**
 * GET /analytics/employees/skill-distribution
 * Groups all employees by primarySkill, counts each group,
 * returns full distribution sorted by count descending.
 */
const getSkillDistribution = async () => {
  const data = await Employee.aggregate([
    { $match: { primarySkill: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$primarySkill',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        skill: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /analytics/employees/domain-distribution
 * Groups all employees by domain, counts each group,
 * returns full distribution sorted by count descending.
 */
const getDomainDistribution = async () => {
  const data = await Employee.aggregate([
    { $match: { domain: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$domain',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        domain: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /analytics/employees/experience-analysis
 * Buckets employees into experience bands using $switch:
 *   Junior (0-2) | Mid (3-5) | Senior (6-8) | Expert (9+)
 * Returns count per band sorted descending.
 */
const getExperienceAnalysis = async () => {
  const data = await Employee.aggregate([
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lte: ['$experience', 2] }, then: 'Junior (0-2)' },
              { case: { $lte: ['$experience', 5] }, then: 'Mid (3-5)'    },
              { case: { $lte: ['$experience', 8] }, then: 'Senior (6-8)' },
            ],
            default: 'Expert (9+)',
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        experienceBand: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /analytics/employees/verification-analysis
 * Groups employees by isVerified boolean,
 * maps true → 'Verified' and false → 'Unverified'.
 * Returns count per status.
 */
const getVerificationAnalysis = async () => {
  const data = await Employee.aggregate([
    {
      $group: {
        _id: '$isVerified',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: { $cond: ['$_id', 'Verified', 'Unverified'] },
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /analytics/employees/timezone-analysis
 * Groups all employees by timezone, counts each group,
 * returns full distribution sorted by count descending.
 */
const getTimezoneAnalysis = async () => {
  const data = await Employee.aggregate([
    { $match: { timezone: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$timezone',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        timezone: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3: ACTIVITY & LOCATION ANALYSIS  (PR 3 — 5 routes)
//  Aggregate project/task activity stats + geographic breakdowns
// ══════════════════════════════════════════════════════════════

/**
 * GET /analytics/employees/project-analysis
 * Computes per-employee project totals then aggregates globally:
 * avgProjects, maxProjects, totalProjects across the entire org.
 * Pipeline: $project (compute size) → $group _id:null (avg/max/sum)
 */
const getProjectAnalysis = async () => {
  const data = await Employee.aggregate([
    {
      $project: {
        name: 1,
        totalProjects: { $size: { $ifNull: ['$projects', []] } },
      },
    },
    {
      $group: {
        _id: null,
        avgProjects:   { $avg: '$totalProjects' },
        maxProjects:   { $max: '$totalProjects' },
        totalProjects: { $sum: '$totalProjects' },
      },
    },
    {
      $project: {
        _id: 0,
        avgProjects:   { $round: ['$avgProjects', 2] },
        maxProjects:   1,
        totalProjects: 1,
      },
    },
  ]);

  return data.length > 0 ? data[0] : { avgProjects: 0, maxProjects: 0, totalProjects: 0 };
};

/**
 * GET /analytics/employees/task-analysis
 * Computes per-employee task totals then aggregates globally:
 * avgTasks, maxTasks, totalTasks across the entire org.
 * Pipeline: $project (compute size) → $group _id:null (avg/max/sum)
 */
const getTaskAnalysis = async () => {
  const data = await Employee.aggregate([
    {
      $project: {
        name: 1,
        totalTasks: { $size: { $ifNull: ['$tasks', []] } },
      },
    },
    {
      $group: {
        _id: null,
        avgTasks:   { $avg: '$totalTasks' },
        maxTasks:   { $max: '$totalTasks' },
        totalTasks: { $sum: '$totalTasks' },
      },
    },
    {
      $project: {
        _id: 0,
        avgTasks:   { $round: ['$avgTasks', 2] },
        maxTasks:   1,
        totalTasks: 1,
      },
    },
  ]);

  return data.length > 0 ? data[0] : { avgTasks: 0, maxTasks: 0, totalTasks: 0 };
};

/**
 * GET /analytics/employees/location-analysis
 * Groups employees by country + city combination
 * to show geographic distribution at city level.
 * Pipeline: $group { country, city } → $sort count desc
 */
const getLocationAnalysis = async () => {
  const data = await Employee.aggregate([
    {
      $match: {
        country: { $ne: null, $ne: '' },
        city:    { $ne: null, $ne: '' },
      },
    },
    {
      $group: {
        _id: { country: '$country', city: '$city' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        country: '$_id.country',
        city:    '$_id.city',
        count:   1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /analytics/employees/country-analysis
 * Groups all employees by country, counts each group,
 * returns full country-wise distribution sorted descending.
 * Pipeline: $group country → $project → $sort count desc
 */
const getCountryAnalysis = async () => {
  const data = await Employee.aggregate([
    { $match: { country: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$country',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        country: '$_id',
        count:   1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /analytics/employees/state-analysis
 * Groups all employees by state, counts each group,
 * returns full state-wise distribution sorted descending.
 * Pipeline: $group state → $project → $sort count desc
 */
const getStateAnalysis = async () => {
  const data = await Employee.aggregate([
    { $match: { state: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$state',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        state: '$_id',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
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
  // Section 3 — Activity & Location Analysis (PR 3)
  getProjectAnalysis,
  getTaskAnalysis,
  getLocationAnalysis,
  getCountryAnalysis,
  getStateAnalysis,
};
