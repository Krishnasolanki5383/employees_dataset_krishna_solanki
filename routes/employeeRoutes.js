// routes/employeeRoutes.js
// Purpose: Defines ALL 30 API endpoints for the Employee resource.
//          Maps HTTP methods + paths → controller functions.
//          Applies middleware chain: authMiddleware → controller.
//          Follows Checklist #7 (API Routing) and #10 (Middleware System).
//
// ⚠️  ROUTE ORDER RULE (Critical):
//      Static/named routes MUST be defined BEFORE dynamic /:id routes.
//      Otherwise Express matches "verified", "projects", etc. as an :id param.

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  // CRUD
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  replaceEmployee,
  updateEmployee,
  deleteEmployee,
  // Exists
  checkEmployeeExists,
  // Bulk
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  // Filters — Location
  getByName,
  getByState,
  getByCountry,
  getByCity,
  getByTimezone,
  // Filters — Skills & Domain
  getByPrimarySkill,
  getBySecondarySkill,
  getByDomain,
  getByExperience,
  getByCertification,
  // Filters — Status / Arrays
  getVerifiedEmployees,
  getAllProjects,
  getAllTasks,
  // Filters — Analytics
  getTopExperience,
  getTopSkills,
  // Filters — Role-based
  getCloudEngineers,
  getDevOpsEngineers,
  getAIEngineers,
  getFullStackDevelopers,
  getRecentCertifications,
} = require('../controllers/employeeController');

// ══════════════════════════════════════════════════════════════
//  BLOCK 1: STATIC FILTER ROUTES (no params)
//  MUST come first — before any /:param routes
// ══════════════════════════════════════════════════════════════

router.get('/verified',               authMiddleware, getVerifiedEmployees);
router.get('/projects',               authMiddleware, getAllProjects);
router.get('/tasks',                  authMiddleware, getAllTasks);
router.get('/top-experience',         authMiddleware, getTopExperience);
router.get('/top-skills',             authMiddleware, getTopSkills);
router.get('/cloud-engineers',        authMiddleware, getCloudEngineers);
router.get('/devops-engineers',       authMiddleware, getDevOpsEngineers);
router.get('/ai-engineers',           authMiddleware, getAIEngineers);
router.get('/fullstack',              authMiddleware, getFullStackDevelopers);
router.get('/recent-certifications',  authMiddleware, getRecentCertifications);

// ══════════════════════════════════════════════════════════════
//  BLOCK 2: STATIC PARAM ROUTES (with :param — named segments)
//  Still BEFORE /:id to avoid conflicts
// ══════════════════════════════════════════════════════════════

// Existence check
router.get('/exists/:id',             authMiddleware, checkEmployeeExists);

// Location filters
router.get('/name/:name',             authMiddleware, getByName);
router.get('/state/:state',           authMiddleware, getByState);
router.get('/country/:country',       authMiddleware, getByCountry);
router.get('/city/:city',             authMiddleware, getByCity);
router.get('/timezone/:timezone',     authMiddleware, getByTimezone);

// Skill & domain filters
router.get('/primary-skill/:skill',   authMiddleware, getByPrimarySkill);
router.get('/secondary-skill/:skill', authMiddleware, getBySecondarySkill);
router.get('/domain/:domain',         authMiddleware, getByDomain);
router.get('/experience/:years',      authMiddleware, getByExperience);
router.get('/certification/:cert',    authMiddleware, getByCertification);

// ══════════════════════════════════════════════════════════════
//  BLOCK 3: BULK OPERATION ROUTES (BEFORE /:id)
// ══════════════════════════════════════════════════════════════

router.post('/bulk-create',           authMiddleware, bulkCreate);
router.patch('/bulk-update',          authMiddleware, bulkUpdate);
router.delete('/bulk-delete',         authMiddleware, bulkDelete);

// ══════════════════════════════════════════════════════════════
//  BLOCK 4: STANDARD CRUD ROUTES
//  General collection routes first, then /:id dynamic routes last
// ══════════════════════════════════════════════════════════════

router.get('/',     authMiddleware, getAllEmployees);   // GET    /employees
router.post('/',    authMiddleware, createEmployee);    // POST   /employees

router.get('/:id',    authMiddleware, getEmployeeById); // GET    /employees/:id
router.put('/:id',    authMiddleware, replaceEmployee); // PUT    /employees/:id
router.patch('/:id',  authMiddleware, updateEmployee);  // PATCH  /employees/:id
router.delete('/:id', authMiddleware, deleteEmployee);  // DELETE /employees/:id

module.exports = router;
