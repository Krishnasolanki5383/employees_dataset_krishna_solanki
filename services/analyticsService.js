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
