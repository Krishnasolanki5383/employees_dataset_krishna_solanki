// controllers/employeeController.js — Handles HTTP request/response logic, delegates business logic to services

const employeeService = require('../services/employeeService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ─── CRUD ─────────────────────────────────────────────────────

const getAllEmployees = async (req, res, next) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    sendSuccess(res, 200, 'Employees fetched successfully', result);
  } catch (error) { next(error); }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) return sendError(res, 404, 'Employee not found');
    sendSuccess(res, 200, 'Employee fetched successfully', employee);
  } catch (error) { next(error); }
};

const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    sendSuccess(res, 201, 'Employee created successfully', employee);
  } catch (error) { next(error); }
};

const replaceEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.replaceEmployee(req.params.id, req.body);
    if (!employee) return sendError(res, 404, 'Employee not found');
    sendSuccess(res, 200, 'Employee replaced successfully', employee);
  } catch (error) { next(error); }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    if (!employee) return sendError(res, 404, 'Employee not found');
    sendSuccess(res, 200, 'Employee updated successfully', employee);
  } catch (error) { next(error); }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.deleteEmployee(req.params.id);
    if (!employee) return sendError(res, 404, 'Employee not found');
    sendSuccess(res, 200, 'Employee deleted successfully', null);
  } catch (error) { next(error); }
};

const checkEmployeeExists = async (req, res, next) => {
  try {
    const exists = await employeeService.checkEmployeeExists(req.params.id);
    sendSuccess(res, 200, exists ? 'Employee exists' : 'Employee not found', { exists });
  } catch (error) { next(error); }
};

// ─── Bulk Operations ──────────────────────────────────────────

const bulkCreate = async (req, res, next) => {
  try {
    const result = await employeeService.bulkCreateEmployees(req.body.employees);
    sendSuccess(res, 201, `${result.length} employees created successfully`, result);
  } catch (error) { next(error); }
};

const bulkUpdate = async (req, res, next) => {
  try {
    const result = await employeeService.bulkUpdateEmployees(req.body.updates);
    sendSuccess(res, 200, 'Bulk update successful', result);
  } catch (error) { next(error); }
};

const bulkDelete = async (req, res, next) => {
  try {
    const result = await employeeService.bulkDeleteEmployees(req.body.ids);
    sendSuccess(res, 200, `${result.deletedCount} employees deleted`, result);
  } catch (error) { next(error); }
};

// ─── Filter Routes ────────────────────────────────────────────

const getByName          = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('name', req.params.name)); } catch (e) { next(e); } };
const getByState         = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('state', req.params.state)); } catch (e) { next(e); } };
const getByCountry       = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('country', req.params.country)); } catch (e) { next(e); } };
const getByCity          = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('city', req.params.city)); } catch (e) { next(e); } };
const getByTimezone      = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('timezone', req.params.timezone)); } catch (e) { next(e); } };
const getByPrimarySkill  = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('primarySkill', req.params.skill)); } catch (e) { next(e); } };
const getBySecondarySkill= async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('secondarySkill', req.params.skill)); } catch (e) { next(e); } };
const getByDomain        = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('domain', req.params.domain)); } catch (e) { next(e); } };
const getByExperience    = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByExperience(req.params.years)); } catch (e) { next(e); } };
const getByCertification = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getByField('certifications', req.params.cert)); } catch (e) { next(e); } };
const getVerified        = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getVerifiedEmployees()); } catch (e) { next(e); } };
const getAllProjects      = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getAllProjects()); } catch (e) { next(e); } };
const getAllTasks         = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getAllTasks()); } catch (e) { next(e); } };
const getTopExperience   = async (req, res, next) => { try { sendSuccess(res, 200, 'Done', await employeeService.getTopExperienced(req.query.limit)); } catch (e) { next(e); } };

module.exports = {
  getAllEmployees, getEmployeeById, createEmployee, replaceEmployee,
  updateEmployee, deleteEmployee, checkEmployeeExists,
  bulkCreate, bulkUpdate, bulkDelete,
  getByName, getByState, getByCountry, getByCity, getByTimezone,
  getByPrimarySkill, getBySecondarySkill, getByDomain, getByExperience,
  getByCertification, getVerified, getAllProjects, getAllTasks, getTopExperience,
};
