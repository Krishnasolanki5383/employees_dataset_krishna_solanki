// routes/protectedRoutes.js
// Purpose: Defines protected CRUD routes that require authentication.
//          Middleware chain: authMiddleware → validationMiddleware → controller.
//          Mounted under /protected (see server.js).

const express = require('express');
const router  = express.Router();
const { authMiddleware }   = require('../middlewares/authMiddleware');
const { validateEmployee } = require('../middlewares/validationMiddleware');
const {
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

// ── Employee Protected CRUD Routes ────────────────────────────
// Chain: authMiddleware → [validationMiddleware] → controller

/**
 * POST /protected/employees
 * Create a new employee — requires valid JWT + field validation.
 */
router.post('/employees',
  authMiddleware, validateEmployee, createEmployee
);

/**
 * PATCH /protected/employees/:id
 * Partially update an employee — requires valid JWT + field validation.
 */
router.patch('/employees/:id',
  authMiddleware, validateEmployee, updateEmployee
);

/**
 * DELETE /protected/employees/:id
 * Delete an employee — requires valid JWT.
 */
router.delete('/employees/:id',
  authMiddleware, deleteEmployee
);

// ── Project Protected CRUD Routes ────────────────────────────
// Projects are array fields on Employee — these routes are
// handled via employee update endpoints and return consistent responses.

/**
 * POST /protected/projects
 * Placeholder protected route for project creation (handled via employee).
 */
router.post('/projects', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected project create route — use PATCH /protected/employees/:id to add a project.',
    hint: 'Projects are stored as array fields on Employee documents.',
  });
});

/**
 * PATCH /protected/projects/:projectId
 * Placeholder protected route for project update.
 */
router.patch('/projects/:projectId', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Protected project update route — projectId: ${req.params.projectId}`,
    hint: 'Projects are stored as array fields on Employee documents.',
  });
});

/**
 * DELETE /protected/projects/:projectId
 * Placeholder protected route for project deletion.
 */
router.delete('/projects/:projectId', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Protected project delete route — projectId: ${req.params.projectId}`,
    hint: 'Projects are stored as array fields on Employee documents.',
  });
});

module.exports = router;
