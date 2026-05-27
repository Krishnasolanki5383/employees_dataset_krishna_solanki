// services/index.js — Barrel file for clean imports from the services folder

const employeeService = require('./employeeService');

module.exports = { ...employeeService };
