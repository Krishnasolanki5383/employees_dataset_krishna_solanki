// controllers/index.js — Barrel file for clean imports from the controllers folder

const employeeController = require('./employeeController');

module.exports = { ...employeeController };
