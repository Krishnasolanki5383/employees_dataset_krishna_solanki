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
 */
const replaceEmployee = async (id, data) => {
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
 */
const bulkCreateEmployees = async (employees) => {
  const result = await Employee.insertMany(employees, { ordered: false });
  return result;
};

/**
 * PATCH /employees/bulk-update
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
 * Expects: { ids: ["id1", "id2", ...] }
 */
const bulkDeleteEmployees = async (ids) => {
  const result = await Employee.deleteMany({ _id: { $in: ids } });
  return { deletedCount: result.deletedCount };
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3: FILTER / INFORMATION ROUTES (Checklist #6)
//  All use $regex for case-insensitive matching unless noted.
//  All return count + data array for consistency.
// ══════════════════════════════════════════════════════════════

/**
 * GET /employees/name/:name
 * Fetch employees whose name matches (partial, case-insensitive).
 */
const getByName = async (name) => {
  const filter = { name: { $regex: name, $options: 'i' } };
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/state/:state
 * Fetch employees by state (case-insensitive).
 */
const getByState = async (state) => {
  const filter = { state: { $regex: state, $options: 'i' } };
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/country/:country
 * Fetch employees by country (case-insensitive).
 */
const getByCountry = async (country) => {
  const filter = { country: { $regex: country, $options: 'i' } };
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/city/:city
 * Fetch employees by city (case-insensitive).
 */
const getByCity = async (city) => {
  const filter = { city: { $regex: city, $options: 'i' } };
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/timezone/:timezone
 * Fetch employees by timezone (case-insensitive).
 */
const getByTimezone = async (timezone) => {
  const filter = { timezone: { $regex: timezone, $options: 'i' } };
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/primary-skill/:skill
 * Fetch employees by primary skill (case-insensitive regex).
 */
const getByPrimarySkill = async (skill) => {
  const filter = { primarySkill: { $regex: skill, $options: 'i' } };
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/secondary-skill/:skill
 * Fetch employees by secondary skill (case-insensitive regex).
 */
const getBySecondarySkill = async (skill) => {
  const filter = { secondarySkill: { $regex: skill, $options: 'i' } };
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/domain/:domain
 * Fetch employees by working domain (case-insensitive regex).
 */
const getByDomain = async (domain) => {
  const filter = { domain: { $regex: domain, $options: 'i' } };
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/experience/:years
 * Fetch employees with experience >= given years.
 * Uses $gte operator (Checklist #6 — advanced operators).
 */
const getByExperience = async (years) => {
  const yearsNum = Number(years);
  const filter = { experience: { $gte: yearsNum } };
  const employees = await Employee.find(filter)
    .select('-__v')
    .sort({ experience: -1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/certification/:cert
 * Fetch employees who hold a specific certification.
 * certifications is an array field → use $regex with $elemMatch.
 */
const getByCertification = async (cert) => {
  const filter = { certifications: { $elemMatch: { $regex: cert, $options: 'i' } } };
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/verified
 * Fetch all employees where isVerified === true.
 */
const getVerifiedEmployees = async () => {
  const employees = await Employee.find({ isVerified: true })
    .select('-__v')
    .sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/projects
 * Fetch all employee projects using Aggregation Pipeline.
 * Checklist #16: $unwind, $project, $sort stages.
 */
const getAllProjects = async () => {
  const result = await Employee.aggregate([
    { $match: { projects: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$projects' },
    {
      $project: {
        _id: 0,
        employeeId: '$_id',
        employeeName: '$name',
        email: '$email',
        project: '$projects',
      },
    },
    { $sort: { employeeName: 1 } },
  ]);
  return { count: result.length, data: result };
};

/**
 * GET /employees/tasks
 * Fetch all employee tasks using Aggregation Pipeline.
 * Checklist #16: $unwind, $project, $sort stages.
 */
const getAllTasks = async () => {
  const result = await Employee.aggregate([
    { $match: { tasks: { $exists: true, $not: { $size: 0 } } } },
    { $unwind: '$tasks' },
    {
      $project: {
        _id: 0,
        employeeId: '$_id',
        employeeName: '$name',
        email: '$email',
        task: '$tasks',
      },
    },
    { $sort: { employeeName: 1 } },
  ]);
  return { count: result.length, data: result };
};

/**
 * GET /employees/top-experience
 * Fetch top 10 most experienced employees sorted descending.
 * Supports optional ?limit= query param.
 */
const getTopExperience = async (limit = 10) => {
  const employees = await Employee.find()
    .select('name email primarySkill domain experience country -__v')
    .sort({ experience: -1 })
    .limit(Number(limit));
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/top-skills
 * Aggregation: groups by primarySkill, counts employees per skill,
 * sorted descending by count. Shows top skills across the org.
 * Checklist #16: $group, $sort, $project stages.
 */
const getTopSkills = async () => {
  const result = await Employee.aggregate([
    { $match: { primarySkill: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$primarySkill',
        employeeCount: { $sum: 1 },
        avgExperience: { $avg: '$experience' },
        employees: { $push: { name: '$name', email: '$email', experience: '$experience' } },
      },
    },
    {
      $project: {
        _id: 0,
        skill: '$_id',
        employeeCount: 1,
        avgExperience: { $round: ['$avgExperience', 1] },
        employees: 1,
      },
    },
    { $sort: { employeeCount: -1 } },
  ]);
  return { count: result.length, data: result };
};

/**
 * GET /employees/cloud-engineers
 * Fetch employees working in cloud-related domains or skills.
 * Uses $or + $regex across primarySkill, secondarySkill, domain.
 */
const getCloudEngineers = async () => {
  const cloudRegex = /cloud|aws|azure|gcp|google cloud|devcloud|kubernetes|k8s/i;
  const filter = {
    $or: [
      { primarySkill: { $regex: cloudRegex } },
      { secondarySkill: { $regex: cloudRegex } },
      { domain: { $regex: cloudRegex } },
    ],
  };
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/devops-engineers
 * Fetch employees in DevOps domain or with DevOps skills.
 */
const getDevOpsEngineers = async () => {
  const devopsRegex = /devops|ci\/cd|jenkins|docker|ansible|terraform|puppet|chef|pipeline/i;
  const filter = {
    $or: [
      { primarySkill: { $regex: devopsRegex } },
      { secondarySkill: { $regex: devopsRegex } },
      { domain: { $regex: devopsRegex } },
    ],
  };
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/ai-engineers
 * Fetch employees in AI, ML, or Data Science domain/skills.
 */
const getAIEngineers = async () => {
  const aiRegex = /artificial intelligence|machine learning|deep learning|data science|nlp|llm|ai|ml|tensorflow|pytorch|neural/i;
  const filter = {
    $or: [
      { primarySkill: { $regex: aiRegex } },
      { secondarySkill: { $regex: aiRegex } },
      { domain: { $regex: aiRegex } },
    ],
  };
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/fullstack
 * Fetch full stack developers based on domain/skills.
 */
const getFullStackDevelopers = async () => {
  const fullstackRegex = /full.?stack|mern|mean|fullstack|front.?end.*back.?end/i;
  const filter = {
    $or: [
      { primarySkill: { $regex: fullstackRegex } },
      { secondarySkill: { $regex: fullstackRegex } },
      { domain: { $regex: fullstackRegex } },
    ],
  };
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/recent-certifications
 * Fetch employees who have certifications, sorted by most recently updated.
 * Uses Aggregation Pipeline: $match → $project → $sort.
 * Checklist #16: multi-stage aggregation.
 */
const getRecentCertifications = async () => {
  const result = await Employee.aggregate([
    {
      $match: {
        certifications: { $exists: true, $not: { $size: 0 } },
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        primarySkill: 1,
        domain: 1,
        certifications: 1,
        certificationCount: { $size: '$certifications' },
        updatedAt: 1,
      },
    },
    { $sort: { updatedAt: -1 } },
  ]);
  return { count: result.length, data: result };
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  // CRUD
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  replaceEmployee,
  updateEmployee,
  deleteEmployee,
  checkEmployeeExists,
  // Bulk
  bulkCreateEmployees,
  bulkUpdateEmployees,
  bulkDeleteEmployees,
  // Filters
  getByName,
  getByState,
  getByCountry,
  getByCity,
  getByTimezone,
  getByPrimarySkill,
  getBySecondarySkill,
  getByDomain,
  getByExperience,
  getByCertification,
  getVerifiedEmployees,
  getAllProjects,
  getAllTasks,
  getTopExperience,
  getTopSkills,
  getCloudEngineers,
  getDevOpsEngineers,
  getAIEngineers,
  getFullStackDevelopers,
  getRecentCertifications,
};
