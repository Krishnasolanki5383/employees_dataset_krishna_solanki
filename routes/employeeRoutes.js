// routes/employeeRoutes.js
// Purpose: Defines ALL API endpoints for the Employee resource.
//          Maps HTTP methods + paths → controller functions.
//          Applies middleware chain: authMiddleware → controller.
//          Follows Checklist #7 (API Routing) and #10 (Middleware System).

const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  replaceEmployee,
  updateEmployee,
  deleteEmployee,
  checkEmployeeExists,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
} = require('../controllers/employeeController');

const { authMiddleware } = require('../middlewares/authMiddleware');

// ══════════════════════════════════════════════════════════════
//  IMPORTANT: Specific named routes MUST come before /:id routes
//  to prevent Express from matching "bulk-create", "exists", etc.
//  as an :id parameter.
// ══════════════════════════════════════════════════════════════

// ─── Filter / Named Routes (BEFORE /:id) ──────────────────────
/**
 * GET /employees/exists/:id
 * Check if an employee exists (returns { exists: true/false })
 */
router.get('/exists/:id', authMiddleware, checkEmployeeExists);

// ─── Bulk Operation Routes (BEFORE /:id) ──────────────────────
/**
 * POST   /employees/bulk-create   → Insert multiple employees
 * PATCH  /employees/bulk-update   → Update multiple employees
 * DELETE /employees/bulk-delete   → Delete multiple employees
 */
router.post('/bulk-create',   authMiddleware, bulkCreate);
router.patch('/bulk-update',  authMiddleware, bulkUpdate);
router.delete('/bulk-delete', authMiddleware, bulkDelete);

// ─── Standard CRUD Routes ─────────────────────────────────────
/**
 * GET    /employees         → Fetch all (pagination, sort, search)
 * POST   /employees         → Create new employee
 */
router.get('/',    authMiddleware, getAllEmployees);
router.post('/',   authMiddleware, createEmployee);

/**
 * GET    /employees/:id     → Fetch single employee by ID
 * PUT    /employees/:id     → Replace entire employee document
 * PATCH  /employees/:id     → Update specific fields
 * DELETE /employees/:id     → Remove employee
 */
router.get('/:id',    authMiddleware, getEmployeeById);
router.put('/:id',    authMiddleware, replaceEmployee);
router.patch('/:id',  authMiddleware, updateEmployee);
router.delete('/:id', authMiddleware, deleteEmployee);

module.exports = router;
