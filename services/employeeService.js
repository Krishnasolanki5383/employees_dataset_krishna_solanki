// services/employeeService.js
// Purpose: Contains ALL business logic and ALL MongoDB/Mongoose database operations.
//          Controllers NEVER query the DB directly — they call these service functions.
//          Follows Checklist #5 (CRUD), #6 (Advanced Querying), #16 (Aggregation).

const Employee = require('../models/employeeModel');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: BASIC CRUD OPERATIONS
// ══════════════════════════════════════════════════════════════

/**
 * GET /employees
 * Fetches all employees with pagination, sorting, and optional search.
 * Checklist #6: pagination, sorting, search
 */
const getAllEmployees = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    search = '',
  } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);
  const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

  // Search across name, email, primarySkill, domain
  const searchFilter = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { primarySkill: { $regex: search, $options: 'i' } },
          { domain: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const total = await Employee.countDocuments(searchFilter);
  const employees = await Employee.find(searchFilter)
    .sort(sortObj)
    .skip(skip)
    .limit(Number(limit))
    .select('-__v');

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: employees,
  };
};

/**
 * GET /employees/:id
 * Fetches a single employee by MongoDB ObjectId.
 */
const getEmployeeById = async (id) => {
  const employee = await Employee.findById(id).select('-__v');
  return employee;
};

/**
 * POST /employees
 * Creates a new employee record.
 */
const createEmployee = async (data) => {
  const employee = await Employee.create(data);
  return employee;
};

/**
 * PUT /employees/:id
 * Replaces the ENTIRE employee document. Uses findOneAndReplace.
 * Fields not in body will be reset to schema defaults.
 */
const replaceEmployee = async (id, data) => {
  // Strip _id from body to avoid immutable field error
  const { _id, ...replaceData } = data;
  const employee = await Employee.findOneAndReplace(
    { _id: id },
    replaceData,
    { new: true, runValidators: true }
  );
  return employee;
};

/**
 * PATCH /employees/:id
 * Partially updates SPECIFIC fields on an employee document.
 */
const updateEmployee = async (id, data) => {
  const employee = await Employee.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).select('-__v');
  return employee;
};

/**
 * DELETE /employees/:id
 * Permanently removes an employee record.
 */
const deleteEmployee = async (id) => {
  const employee = await Employee.findByIdAndDelete(id);
  return employee;
};

/**
 * GET /employees/exists/:id
 * Checks if an employee document exists by ID.
 * Uses lean + select for maximum performance (no full doc fetch).
 */
const checkEmployeeExists = async (id) => {
  const employee = await Employee.findById(id).select('_id').lean();
  return !!employee;
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: BULK OPERATIONS (Checklist #5)
// ══════════════════════════════════════════════════════════════

/**
 * POST /employees/bulk-create
 * Inserts multiple employee documents at once.
 * ordered: false → continues inserting even if one fails.
 */
const bulkCreateEmployees = async (employees) => {
  const result = await Employee.insertMany(employees, { ordered: false });
  return result;
};

/**
 * PATCH /employees/bulk-update
 * Updates multiple employees using bulkWrite with updateOne ops.
 * Expects: [{ id: "...", data: { field: value } }, ...]
 */
const bulkUpdateEmployees = async (updates) => {
  const bulkOps = updates.map(({ id, data }) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: data },
    },
  }));
  const result = await Employee.bulkWrite(bulkOps, { ordered: false });
  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

/**
 * DELETE /employees/bulk-delete
 * Deletes multiple employees by array of IDs.
 * Expects: { ids: ["id1", "id2", ...] }
 */
const bulkDeleteEmployees = async (ids) => {
  const result = await Employee.deleteMany({ _id: { $in: ids } });
  return { deletedCount: result.deletedCount };
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

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
};
