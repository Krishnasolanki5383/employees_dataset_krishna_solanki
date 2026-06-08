// routes/statsRoutes.js
// Purpose: Defines ALL 15 statistics API endpoints.
//          Maps GET methods → statsController functions.
//          Applies authMiddleware on every route.
//          All routes are under /stats/employees/* prefix (mounted via server.js).
//
// ⚠️  ROUTE ORDER: All routes here are static (no dynamic :param segments),
//     so ordering is not critical. Grouped by PR for clarity.

const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  // PR 1 — Count Statistics
  getTotalEmployeeCount,
  getVerifiedEmployeeCount,
  getEmployeeCountByCountry,
  getEmployeeCountByDomain,
  getEmployeeCountBySkill,
  // PR 2 — Distribution Statistics
  getEmployeeCountByState,
  getTimezoneCount,
  getCertificationCount,
  getProjectDistribution,
  getTaskDistribution,
  // PR 3 — Advanced Statistics
  getExperienceAverage,
  getTopExperiencedEmployees,
  getTotalProjectCount,
  getTotalTaskCount,
  getTechnologyCount,
} = require('../controllers/statsController');

// ══════════════════════════════════════════════════════════════
//  BLOCK 1: COUNT STATISTICS  (PR 1 — 5 routes)
//  Simple counts and group-by-field counts using $count and $group
// ══════════════════════════════════════════════════════════════

router.get('/employees/count',          authMiddleware, getTotalEmployeeCount);    // Total employees
router.get('/employees/verified-count', authMiddleware, getVerifiedEmployeeCount); // Verified employees
router.get('/employees/country-count',  authMiddleware, getEmployeeCountByCountry); // Count by country
router.get('/employees/domain-count',   authMiddleware, getEmployeeCountByDomain);  // Count by domain
router.get('/employees/skill-count',    authMiddleware, getEmployeeCountBySkill);   // Count by skills

// ══════════════════════════════════════════════════════════════
//  BLOCK 2: DISTRIBUTION STATISTICS  (PR 2 — 5 routes)
//  Location, timezone, certifications, and array-level distributions
// ══════════════════════════════════════════════════════════════

router.get('/employees/state-count',           authMiddleware, getEmployeeCountByState); // Count by state
router.get('/employees/timezone-count',        authMiddleware, getTimezoneCount);        // Timezone distribution
router.get('/employees/certification-count',   authMiddleware, getCertificationCount);   // Certification records
router.get('/employees/project-distribution',  authMiddleware, getProjectDistribution);  // Project distribution
router.get('/employees/task-distribution',     authMiddleware, getTaskDistribution);     // Task distribution

// ══════════════════════════════════════════════════════════════
//  BLOCK 3: ADVANCED STATISTICS  (PR 3 — 5 routes)
//  Experience analytics, top performers, and total array counts
// ══════════════════════════════════════════════════════════════

router.get('/employees/experience-average', authMiddleware, getExperienceAverage);         // Average experience
router.get('/employees/top-experience',     authMiddleware, getTopExperiencedEmployees);   // Highest experienced
router.get('/employees/project-count',      authMiddleware, getTotalProjectCount);         // Total projects
router.get('/employees/task-count',         authMiddleware, getTotalTaskCount);            // Total tasks
router.get('/employees/technology-count',   authMiddleware, getTechnologyCount);           // Technology usage

module.exports = router;
