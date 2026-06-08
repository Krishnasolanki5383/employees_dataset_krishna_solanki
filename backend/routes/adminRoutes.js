// routes/adminRoutes.js
// Purpose: Defines all admin-only API endpoints.
//          Middleware chain: authMiddleware → roleMiddleware → controller.
//          All routes mounted under /admin (see server.js).
//          Only users with role='admin' in their JWT payload can access these.

const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const {
  getAdminEmployees,
  getAdminProjects,
  getAdminTasks,
  getAdminCertifications,
} = require('../controllers/adminController');

// ── Middleware chain ───────────────────────────────────────────
// All admin routes: authMiddleware → roleMiddleware → controller
// ──────────────────────────────────────────────────────────────

/**
 * GET /admin/employees
 * Returns all employees — full admin view with query filter support.
 */
router.get('/employees',      authMiddleware, roleMiddleware, getAdminEmployees);

/**
 * GET /admin/projects
 * Returns all projects aggregated across all employees.
 */
router.get('/projects',       authMiddleware, roleMiddleware, getAdminProjects);

/**
 * GET /admin/tasks
 * Returns all tasks aggregated across all employees.
 */
router.get('/tasks',          authMiddleware, roleMiddleware, getAdminTasks);

/**
 * GET /admin/certifications
 * Returns all employees with certifications.
 */
router.get('/certifications', authMiddleware, roleMiddleware, getAdminCertifications);

module.exports = router;
