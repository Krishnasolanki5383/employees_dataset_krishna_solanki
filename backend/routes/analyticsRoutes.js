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
  // PR 2 — Distribution Analysis
  getSkillDistribution,
  getDomainDistribution,
  getExperienceAnalysis,
  getVerificationAnalysis,
  getTimezoneAnalysis,
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

// ══════════════════════════════════════════════════════════════
//  BLOCK 2: DISTRIBUTION ANALYSIS  (PR 2 — 5 routes)
//  Full breakdowns — no limit, covers entire dataset per category
// ══════════════════════════════════════════════════════════════

router.get('/employees/skill-distribution',    authMiddleware, getSkillDistribution);    // All skills grouped by count
router.get('/employees/domain-distribution',   authMiddleware, getDomainDistribution);   // All domains grouped by count
router.get('/employees/experience-analysis',   authMiddleware, getExperienceAnalysis);   // Junior/Mid/Senior/Expert bands
router.get('/employees/verification-analysis', authMiddleware, getVerificationAnalysis); // Verified vs Unverified
router.get('/employees/timezone-analysis',     authMiddleware, getTimezoneAnalysis);     // All timezones grouped by count

module.exports = router;
