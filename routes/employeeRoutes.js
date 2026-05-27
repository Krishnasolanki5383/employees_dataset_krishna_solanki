// routes/employeeRoutes.js — Defines all API endpoints and maps them to controller functions

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const { authMiddleware } = require('../middlewares');

// ─── Filter Routes (must be before /:id to avoid conflicts) ───
router.get('/exists/:id',              authMiddleware, ctrl.checkEmployeeExists);
router.get('/name/:name',              authMiddleware, ctrl.getByName);
router.get('/state/:state',            authMiddleware, ctrl.getByState);
router.get('/country/:country',        authMiddleware, ctrl.getByCountry);
router.get('/city/:city',              authMiddleware, ctrl.getByCity);
router.get('/timezone/:timezone',      authMiddleware, ctrl.getByTimezone);
router.get('/primary-skill/:skill',    authMiddleware, ctrl.getByPrimarySkill);
router.get('/secondary-skill/:skill',  authMiddleware, ctrl.getBySecondarySkill);
router.get('/domain/:domain',          authMiddleware, ctrl.getByDomain);
router.get('/experience/:years',       authMiddleware, ctrl.getByExperience);
router.get('/certification/:cert',     authMiddleware, ctrl.getByCertification);
router.get('/verified',                authMiddleware, ctrl.getVerified);
router.get('/projects',                authMiddleware, ctrl.getAllProjects);
router.get('/tasks',                   authMiddleware, ctrl.getAllTasks);
router.get('/top-experience',          authMiddleware, ctrl.getTopExperience);

// ─── Bulk Routes ──────────────────────────────────────────────
router.post('/bulk-create',            authMiddleware, ctrl.bulkCreate);
router.patch('/bulk-update',           authMiddleware, ctrl.bulkUpdate);
router.delete('/bulk-delete',          authMiddleware, ctrl.bulkDelete);

// ─── CRUD Routes ──────────────────────────────────────────────
router.get('/',                        authMiddleware, ctrl.getAllEmployees);
router.get('/:id',                     authMiddleware, ctrl.getEmployeeById);
router.post('/',                       authMiddleware, ctrl.createEmployee);
router.put('/:id',                     authMiddleware, ctrl.replaceEmployee);
router.patch('/:id',                   authMiddleware, ctrl.updateEmployee);
router.delete('/:id',                  authMiddleware, ctrl.deleteEmployee);

module.exports = router;
