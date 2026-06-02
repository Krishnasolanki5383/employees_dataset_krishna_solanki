// services/searchService.js
// Purpose: Contains ALL business logic for the Search feature.
//          Controllers NEVER query the DB directly — they call these service functions.
//          Follows MVC Architecture: Service layer owns all query logic.

const Employee = require('../models/employeeModel');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: BASIC SEARCH
//  GET /search/employees?q=keyword
//  Searches across 10 fields using case-insensitive $or query.
//  Supports pagination: ?page=1&limit=10
// ══════════════════════════════════════════════════════════════

/**
 * searchEmployees
 * Searches all employees where the keyword matches ANY of these fields:
 *   name, primarySkill, secondarySkill, domain, country, city,
 *   state, timezone, certifications, projects, tasks
 *
 * @param {string} q     - The search keyword
 * @param {number} page  - Current page (default: 1)
 * @param {number} limit - Records per page (default: 10)
 * @returns {object}     - { data, pagination, searchKeyword, totalResults }
 */
const searchEmployees = async (q, { page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  // ── Build $or query across all searchable fields ─────────────
  // Case-insensitive regex applied to every field in parallel.
  // projects and tasks are [String] arrays — regex matches any element.
  const keyword = new RegExp(q, 'i');

  const searchQuery = {
    $or: [
      { name:           keyword },
      { primarySkill:   keyword },
      { secondarySkill: keyword },
      { domain:         keyword },
      { country:        keyword },
      { city:           keyword },
      { state:          keyword },
      { timezone:       keyword },
      { certifications: keyword },   // [String] array — matches any element
      { projects:       keyword },   // [String] array — matches any element
      { tasks:          keyword },   // [String] array — matches any element
    ],
  };

  // ── Execute count + paginated query ──────────────────────────
  const total     = await Employee.countDocuments(searchQuery);
  const employees = await Employee.find(searchQuery)
    .sort({ name: 1 })               // default: alphabetical
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  const totalPages = Math.ceil(total / limitNum);

  return {
    searchKeyword: q,
    totalResults:  total,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    data: employees,
  };
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  searchEmployees,
};
