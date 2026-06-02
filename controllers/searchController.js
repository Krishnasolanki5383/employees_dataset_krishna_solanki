// controllers/searchController.js
// Purpose: Handles HTTP request/response for the Search feature ONLY.
//          NO business logic. NO database queries.
//          Delegates ALL logic to searchService.
//          Follows MVC Architecture — Controller layer.

const searchService = require('../services/searchService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: BASIC SEARCH CONTROLLER
// ══════════════════════════════════════════════════════════════

/**
 * GET /search/employees?q=keyword
 * Searches employees across all major fields.
 *
 * Query Params:
 *   q     (required) - Search keyword
 *   page  (optional) - Page number (default: 1)
 *   limit (optional) - Records per page (default: 10)
 *
 * Examples:
 *   ?q=java        → employees with Java skill
 *   ?q=cloud       → Cloud domain employees
 *   ?q=aws         → AWS certified employees
 *   ?q=usa         → Employees in USA
 *   ?q=verified    → Verified employees (if 'verified' appears in any field)
 */
const searchEmployees = async (req, res, next) => {
  try {
    const q     = req.query.q;
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;

    // ── Delegate all logic to searchService ──────────────────
    const result = await searchService.searchEmployees(q, { page, limit });

    const message = result.totalResults === 0
      ? `No employees found for keyword '${q}'`
      : `${result.totalResults} employee(s) found for keyword '${q}'`;

    return sendSuccess(res, 200, message, result.data, result.pagination);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  searchEmployees,
};
