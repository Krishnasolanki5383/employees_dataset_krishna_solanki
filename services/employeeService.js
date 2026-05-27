// services/employeeService.js — Contains all business logic for employee operations (called by controllers)

const Employee = require('../models/employeeModel');

// ─── CRUD ─────────────────────────────────────────────────────

const getAllEmployees = async ({ page = 1, limit = 10, sort = 'createdAt', order = 'desc' }) => {
  const skip = (page - 1) * limit;
  const sortObj = { [sort]: order === 'desc' ? -1 : 1 };
  const total = await Employee.countDocuments();
  const employees = await Employee.find().sort(sortObj).skip(skip).limit(Number(limit));
  return { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit), data: employees };
};

const getEmployeeById = async (id) => {
  return await Employee.findById(id);
};

const createEmployee = async (data) => {
  return await Employee.create(data);
};

const replaceEmployee = async (id, data) => {
  return await Employee.findOneAndReplace({ _id: id }, data, { new: true, runValidators: true });
};

const updateEmployee = async (id, data) => {
  return await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteEmployee = async (id) => {
  return await Employee.findByIdAndDelete(id);
};

const checkEmployeeExists = async (id) => {
  const employee = await Employee.findById(id).select('_id');
  return !!employee;
};

// ─── Bulk Operations ──────────────────────────────────────────

const bulkCreateEmployees = async (employees) => {
  return await Employee.insertMany(employees, { ordered: false });
};

const bulkUpdateEmployees = async (updates) => {
  const bulkOps = updates.map(({ id, data }) => ({
    updateOne: { filter: { _id: id }, update: { $set: data } },
  }));
  return await Employee.bulkWrite(bulkOps);
};

const bulkDeleteEmployees = async (ids) => {
  return await Employee.deleteMany({ _id: { $in: ids } });
};

// ─── Filter / Search ──────────────────────────────────────────

const getByField = async (field, value) => {
  return await Employee.find({ [field]: new RegExp(value, 'i') });
};

const getByExperience = async (years) => {
  return await Employee.find({ experience: Number(years) });
};

const getVerifiedEmployees = async () => {
  return await Employee.find({ verified: true });
};

const getTopExperienced = async (limit = 10) => {
  return await Employee.find().sort({ experience: -1 }).limit(Number(limit));
};

const getAllProjects = async () => {
  return await Employee.aggregate([
    { $unwind: '$projects' },
    { $project: { _id: 0, employeeId: '$_id', name: 1, project: '$projects' } },
  ]);
};

const getAllTasks = async () => {
  return await Employee.aggregate([
    { $unwind: '$tasks' },
    { $project: { _id: 0, employeeId: '$_id', name: 1, task: '$tasks' } },
  ]);
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  replaceEmployee,
  updateEmployee,
  deleteEmployee,
  checkEmployeeExists,
  bulkCreateEmployees,
  bulkUpdateEmployees,
  bulkDeleteEmployees,
  getByField,
  getByExperience,
  getVerifiedEmployees,
  getTopExperienced,
  getAllProjects,
  getAllTasks,
};
