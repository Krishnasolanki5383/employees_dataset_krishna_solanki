// services/statsService.js
// Purpose: Contains ALL MongoDB Aggregation Pipeline logic for statistics routes.
//          Controllers NEVER run pipelines directly — they call these service functions.
//          Uses Employee.aggregate([]) exclusively — no .find() calls.
//          Follows strict MVC: this layer owns ALL query/pipeline logic.

const Employee = require('../models/employeeModel');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: COUNT STATISTICS  (PR 1 — 5 routes)
//  Each returns a simple count or grouped count per category.
// ══════════════════════════════════════════════════════════════

/**
 * GET /stats/employees/count
 * Returns the total number of employees in the collection.
 */
const getTotalEmployeeCount = async () => {
  const data = await Employee.aggregate([
    { $count: 'totalEmployees' },
  ]);

  return data[0] || { totalEmployees: 0 };
};

/**
 * GET /stats/employees/verified-count
 * Returns the count of employees with isVerified === true.
 */
const getVerifiedEmployeeCount = async () => {
  const data = await Employee.aggregate([
    { $match: { isVerified: true } },
    { $count: 'verifiedEmployees' },
  ]);

  return data[0] || { verifiedEmployees: 0 };
};

/**
 * GET /stats/employees/country-count
 * Groups all employees by country, returns count per country sorted descending.
 */
const getEmployeeCountByCountry = async () => {
  const data = await Employee.aggregate([
    {
      $group: {
        _id: '$country',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /stats/employees/domain-count
 * Groups all employees by domain, returns count per domain sorted descending.
 */
const getEmployeeCountByDomain = async () => {
  const data = await Employee.aggregate([
    {
      $group: {
        _id: '$domain',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /stats/employees/skill-count
 * Groups all employees by primarySkill, returns count per skill sorted descending.
 */
const getEmployeeCountBySkill = async () => {
  const data = await Employee.aggregate([
    {
      $group: {
        _id: '$primarySkill',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: DISTRIBUTION STATISTICS  (PR 2 — 5 routes)
//  Covers location, timezone, certifications, and array distributions.
// ══════════════════════════════════════════════════════════════

/**
 * GET /stats/employees/state-count
 * Groups all employees by state, returns count per state sorted descending.
 */
const getEmployeeCountByState = async () => {
  const data = await Employee.aggregate([
    {
      $group: {
        _id: '$state',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /stats/employees/timezone-count
 * Groups all employees by timezone, returns timezone distribution sorted descending.
 */
const getTimezoneCount = async () => {
  const data = await Employee.aggregate([
    {
      $group: {
        _id: '$timezone',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /stats/employees/certification-count
 * Unwinds the certifications array so each certification becomes its own document,
 * groups by certification name, returns count per certification sorted descending.
 */
const getCertificationCount = async () => {
  const data = await Employee.aggregate([
    { $unwind: '$certifications' },
    {
      $group: {
        _id: '$certifications',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return data;
};

/**
 * GET /stats/employees/project-distribution
 * Projects the size of each employee's projects array,
 * then aggregates totals, average, max, and min project counts across all employees.
 */
const getProjectDistribution = async () => {
  const data = await Employee.aggregate([
    {
      $project: {
        totalProjects: { $size: '$projects' },
      },
    },
    {
      $group: {
        _id: null,
        totalProjects: { $sum: '$totalProjects' },
        avgProjects:   { $avg: '$totalProjects' },
        maxProjects:   { $max: '$totalProjects' },
        minProjects:   { $min: '$totalProjects' },
      },
    },
  ]);

  return data[0] || {
    totalProjects: 0,
    avgProjects:   0,
    maxProjects:   0,
    minProjects:   0,
  };
};

/**
 * GET /stats/employees/task-distribution
 * Projects the size of each employee's tasks array,
 * then aggregates totals, average, max, and min task counts across all employees.
 */
const getTaskDistribution = async () => {
  const data = await Employee.aggregate([
    {
      $project: {
        totalTasks: { $size: '$tasks' },
      },
    },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: '$totalTasks' },
        avgTasks:   { $avg: '$totalTasks' },
        maxTasks:   { $max: '$totalTasks' },
        minTasks:   { $min: '$totalTasks' },
      },
    },
  ]);

  return data[0] || {
    totalTasks: 0,
    avgTasks:   0,
    maxTasks:   0,
    minTasks:   0,
  };
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3: ADVANCED STATISTICS  (PR 3 — 5 routes)
//  Experience analytics, top performers, and array-level totals.
// ══════════════════════════════════════════════════════════════

/**
 * GET /stats/employees/experience-average
 * Returns average, max, and min experience values across all employees.
 */
const getExperienceAverage = async () => {
  const data = await Employee.aggregate([
    {
      $group: {
        _id: null,
        avgExperience: { $avg: '$experience' },
        maxExperience: { $max: '$experience' },
        minExperience: { $min: '$experience' },
      },
    },
  ]);

  return data[0] || { avgExperience: 0, maxExperience: 0, minExperience: 0 };
};

/**
 * GET /stats/employees/top-experience
 * Returns the top 5 employees with the highest experience,
 * projecting only name, experience, domain, and primarySkill.
 */
const getTopExperiencedEmployees = async () => {
  const data = await Employee.aggregate([
    { $sort: { experience: -1 } },
    { $limit: 5 },
    {
      $project: {
        name:         1,
        experience:   1,
        domain:       1,
        primarySkill: 1,
      },
    },
  ]);

  return data;
};

/**
 * GET /stats/employees/project-count
 * Unwinds the projects array so each project entry becomes its own document,
 * then counts the total number of individual project entries across all employees.
 */
const getTotalProjectCount = async () => {
  const data = await Employee.aggregate([
    { $unwind: '$projects' },
    { $count: 'totalProjects' },
  ]);

  return data[0] || { totalProjects: 0 };
};

/**
 * GET /stats/employees/task-count
 * Unwinds the tasks array so each task entry becomes its own document,
 * then counts the total number of individual task entries across all employees.
 */
const getTotalTaskCount = async () => {
  const data = await Employee.aggregate([
    { $unwind: '$tasks' },
    { $count: 'totalTasks' },
  ]);

  return data[0] || { totalTasks: 0 };
};

/**
 * GET /stats/employees/technology-count
 * Unwinds the technologies array, groups by each technology,
 * returns count per technology sorted descending.
 *
 * ⚠️  Note: The current Employee schema stores a single 'secondarySkill' string
 *     rather than a 'technologies' array. This pipeline targets the 'technologies'
 *     field as specified in the requirements. If your dataset uses a different field
 *     name, update '$technologies' accordingly.
 */
const getTechnologyCount = async () => {
  const data = await Employee.aggregate([
    { $unwind: '$technologies' },
    {
      $group: {
        _id: '$technologies',
        count: { $sum: 1 },
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
