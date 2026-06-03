// routes/searchRoutes.js
// Purpose: Defines search API endpoints.
//          Mounted at /search in server.js → full path: GET /search/employees
//          Applies authMiddleware on all search routes.
//          Follows MVC Architecture — Route layer maps URL → Controller.

const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { searchEmployees } = require('../controllers/searchController');

// ══════════════════════════════════════════════════════════════
//  SEARCH ROUTES
//  All keywords are handled by a single route via ?q= param.
//  Mounted at: /search (see server.js)
// ══════════════════════════════════════════════════════════════

/**
 * GET /search/employees?q=<keyword>&page=1&limit=10
 *
 * Example queries:
 *   ?q=java         → Java skill employees
 *   ?q=cloud        → Cloud domain employees
 *   ?q=devops       → DevOps employees
 *   ?q=react        → React skill employees
 *   ?q=nodejs       → Node.js employees
 *   ?q=kubernetes   → Kubernetes employees
 *   ?q=aws          → AWS certified employees
 *   ?q=scrum        → Scrum certified employees
 *   ?q=finance      → Finance domain employees
 *   ?q=healthcare   → Healthcare domain employees
 *   ?q=usa          → Employees in USA
 *   ?q=timezone     → Search by timezone
 *   ?q=project      → Search by project
 *   ?q=task         → Search by task
 *   ?q=verified     → Search verified-related employees
 */
router.get('/employees', authMiddleware, searchEmployees);

module.exports = router;
