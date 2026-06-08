// routes/jwtRoutes.js
// Purpose: Defines all 10 JWT demonstration and private data endpoints.
//          Mounted under /jwt in server.js.
//          All protected routes require a valid Bearer token via authMiddleware.

const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getJwtProfile,
  getJwtDashboard,
  generateToken,
  verifyToken,
  refreshToken,
  revokeToken,
  getPrivateEmployees,
  getPrivateProjects,
  getPrivateTasks,
  getPrivateAnalytics,
} = require('../controllers/jwtController');

// ── Protected Profile & Dashboard ─────────────────────────────
router.get('/profile',   authMiddleware, getJwtProfile);   // GET  /jwt/profile
router.get('/dashboard', authMiddleware, getJwtDashboard); // GET  /jwt/dashboard

// ── Token Operations (public — for testing/demo) ──────────────
router.post  ('/generate-token', generateToken); // POST   /jwt/generate-token
router.post  ('/verify-token',   verifyToken);   // POST   /jwt/verify-token
router.post  ('/refresh-token',  refreshToken);  // POST   /jwt/refresh-token
router.delete('/revoke-token',   revokeToken);   // DELETE /jwt/revoke-token

// ── Private Data Routes (all require valid JWT) ───────────────
router.get('/private-employees', authMiddleware, getPrivateEmployees); // GET /jwt/private-employees
router.get('/private-projects',  authMiddleware, getPrivateProjects);  // GET /jwt/private-projects
router.get('/private-tasks',     authMiddleware, getPrivateTasks);     // GET /jwt/private-tasks
router.get('/private-analytics', authMiddleware, getPrivateAnalytics); // GET /jwt/private-analytics

module.exports = router;
