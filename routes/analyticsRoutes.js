// routes/analyticsRoutes.js
// Purpose: Defines ALL 15 analytics API endpoints.
//          Maps GET methods → analyticsController functions.
//          Applies authMiddleware on every route.
//          All routes are under /analytics/employees/* prefix (mounted via server.js).
//
// ⚠️  ROUTE ORDER: All routes here are static (no dynamic :param segments),
//     so ordering is not critical. Grouped by PR for clarity.

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  // PR 1 — Top Analytics
  getTopSkills,
  getTopDomains,
  getTopCertifications,
  getTopProjects,
  getTopTechnologies,
} = require('../controllers/analyticsController');

// ══════════════════════════════════════════════════════════════
//  BLOCK 1: TOP ANALYTICS  (PR 1 — 5 routes)
//  Returns top-10 ranked items per category using $group + $sort + $limit
// ══════════════════════════════════════════════════════════════

router.get('/employees/top-skills',         authMiddleware, getTopSkills);         // Most popular primary skills
router.get('/employees/top-domains',        authMiddleware, getTopDomains);        // Most active domains
router.get('/employees/top-certifications', authMiddleware, getTopCertifications); // Most popular certifications
router.get('/employees/top-projects',       authMiddleware, getTopProjects);       // Project distribution
router.get('/employees/top-technologies',   authMiddleware, getTopTechnologies);   // Technology / secondary skill usage

module.exports = router;
