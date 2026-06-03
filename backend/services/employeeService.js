// services/employeeService.js
// Purpose: Contains ALL business logic and ALL MongoDB/Mongoose database operations.
//          Controllers NEVER query the DB directly — they call these service functions.
//          Follows Checklist #5 (CRUD), #6 (Advanced Querying), #16 (Aggregation).

const Employee = require('../models/employeeModel');

// ── PR 1: Whitelist of fields allowed for ?sort= query parameter ──────────────
// Prevents arbitrary field injection. Any value outside this list falls
// back to the default ('name' ascending).
const VALID_SORT_FIELDS = [
  'name',          // Sort alphabetically by employee name
  'experience',    // Sort by years of experience
  'country',       // Sort by country
  'state',         // Sort by state
  'city',          // Sort by city
  'domain',        // Sort by domain (used as 'project domain' proxy)
  'timezone',      // Sort by timezone
  'certifications',// Sort by certifications array (lexicographic)
  'projects',      // Sort by projects array (lexicographic)
  'tasks',         // Sort by tasks array (lexicographic)
  'updatedAt',     // Sort by last-updated timestamp
];

// ══════════════════════════════════════════════════════════════
//  SECTION 1: BASIC CRUD OPERATIONS
// ══════════════════════════════════════════════════════════════

/**
 * GET /employees
 * Fetches all employees with:
 *   - Pagination  : ?page=1&limit=10
 *   - Sorting     : ?sort=createdAt&order=desc
 *   - Full-text   : ?search=nodejs
 *   - 15 query param filters (country, state, city, primarySkill,
 *     secondarySkill, domain, experience, verified, certification,
 *     timezone, project, task, technology, skill, emailVerified)
 * Checklist #6: pagination, sorting, search, dynamic filtering
 */
const getAllEmployees = async (queryParams) => {
  const {
    // ── Pagination & sorting ──────────────────────────────────
    page  = 1,
    limit = 10,
    sort  = 'name',   // PR 1: default sort field changed to 'name' (asc)
    order = 'asc',    // PR 1: default order changed to 'asc' to match name-sort UX
    // ── Full-text search ──────────────────────────────────────
    search = '',
    // ── 15 Query-parameter filters ────────────────────────────
    country,
    state,
    city,
    primarySkill,
    secondarySkill,
    domain,
    experience,
    verified,
    certification,
    timezone,
    project,
    task,
    technology,
    skill,
    emailVerified,
  } = queryParams;

  // ── Step 1: Build dynamic filter from query params ──────────
  const filter = {};

  if (country)        filter.country        = new RegExp(country, 'i');
  if (state)          filter.state          = new RegExp(state, 'i');
  if (city)           filter.city           = new RegExp(city, 'i');
  if (primarySkill)   filter.primarySkill   = new RegExp(primarySkill, 'i');
  if (secondarySkill) filter.secondarySkill = new RegExp(secondarySkill, 'i');
  if (domain)         filter.domain         = new RegExp(domain, 'i');
  if (timezone)       filter.timezone       = new RegExp(timezone, 'i');
  if (technology)     filter.technologies   = new RegExp(technology, 'i');

  // Numeric: experience >= N years
  if (experience)     filter.experience     = { $gte: Number(experience) };

  // Boolean flags
  if (verified)       filter.isVerified     = verified === 'true';
  if (emailVerified)  filter.emailVerified  = emailVerified === 'true';

  // Array fields — match inside array elements
  if (certification)  filter.certifications = { $elemMatch: { $regex: certification, $options: 'i' } };
  if (project)        filter.projects       = { $elemMatch: { $regex: project,       $options: 'i' } };
  if (task)           filter.tasks          = { $elemMatch: { $regex: task,          $options: 'i' } };

  // skill — checks BOTH primarySkill and secondarySkill ($or)
  if (skill) {
    filter.$or = [
      { primarySkill:   new RegExp(skill, 'i') },
      { secondarySkill: new RegExp(skill, 'i') },
    ];
  }

  // ── Step 2: Merge full-text search into the same filter ─────
  //    Full-text search wraps its own $or; merge with $and when
  //    both a skill $or and a search $or are present.
  if (search) {
    const searchOr = [
      { name:         { $regex: search, $options: 'i' } },
      { email:        { $regex: search, $options: 'i' } },
      { primarySkill: { $regex: search, $options: 'i' } },
      { domain:       { $regex: search, $options: 'i' } },
    ];

    if (filter.$or) {
      // Both ?skill= and ?search= are present — combine with $and
      filter.$and = [
        { $or: filter.$or },
        { $or: searchOr },
      ];
      delete filter.$or;
    } else {
      filter.$or = searchOr;
    }
  }

  // ── Step 3: Pagination, sorting, query ──────────────────────
  //
  // PR 1 — Dynamic sort with whitelist validation:
  //   • Only fields in VALID_SORT_FIELDS are accepted.
  //   • Unknown/missing sort param falls back to { name: 1 }.
  //   • ?order=desc  → -1  |  anything else (incl. 'asc') → 1
  const skip = (Number(page) - 1) * Number(limit);

  const resolvedSort  = VALID_SORT_FIELDS.includes(sort) ? sort : 'name';
  const resolvedOrder = order === 'desc' ? -1 : 1;
  const sortObject    = { [resolvedSort]: resolvedOrder };

  const total     = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter)
    .sort(sortObject)
    .skip(skip)
    .limit(Number(limit))
    .select('-__v');

  const pageNum    = Number(page);
  const limitNum   = Number(limit);
  const totalPages = Math.ceil(total / limitNum);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    // PR 1 — Show which sort was actually applied (useful for debugging)
    appliedSort: {
      field:     resolvedSort,
      direction: resolvedOrder === 1 ? 'asc' : 'desc',
    },
    appliedFilters: {
      ...(country        && { country }),
      ...(state          && { state }),
      ...(city           && { city }),
      ...(primarySkill   && { primarySkill }),
      ...(secondarySkill && { secondarySkill }),
      ...(domain         && { domain }),
      ...(experience     && { experience: `>= ${experience}` }),
      ...(verified       && { verified }),
      ...(certification  && { certification }),
      ...(timezone       && { timezone }),
      ...(project        && { project }),
      ...(task           && { task }),
      ...(technology     && { technology }),
      ...(skill          && { skill }),
      ...(emailVerified  && { emailVerified }),
      ...(search         && { search }),
    },
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
 * Fetch employees by state (case-insensitive). Supports pagination.
 */
const getByState = async (state, { page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;
  const filter   = { state: { $regex: state, $options: 'i' } };

  const total     = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 }).skip(skip).limit(limitNum);
  const totalPages = Math.ceil(total / limitNum);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    count: employees.length,
    data:  employees,
  };
};

/**
 * GET /employees/country/:country
 * Fetch employees by country (case-insensitive). Supports pagination.
 */
const getByCountry = async (country, { page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;
  const filter   = { country: { $regex: country, $options: 'i' } };

  const total     = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 }).skip(skip).limit(limitNum);
  const totalPages = Math.ceil(total / limitNum);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    count: employees.length,
    data:  employees,
  };
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
 * Fetch employees by primary skill (case-insensitive regex). Supports pagination.
 */
const getByPrimarySkill = async (skill, { page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;
  const filter   = { primarySkill: { $regex: skill, $options: 'i' } };

  const total     = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 }).skip(skip).limit(limitNum);
  const totalPages = Math.ceil(total / limitNum);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    count: employees.length,
    data:  employees,
  };
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
 * Fetch employees by working domain (case-insensitive regex). Supports pagination.
 */
const getByDomain = async (domain, { page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;
  const filter   = { domain: { $regex: domain, $options: 'i' } };

  const total     = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter).select('-__v').sort({ experience: -1 }).skip(skip).limit(limitNum);
  const totalPages = Math.ceil(total / limitNum);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    count: employees.length,
    data:  employees,
  };
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
 * Fetch all employees where isVerified === true. Supports pagination.
 */
const getVerifiedEmployees = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;
  const filter   = { isVerified: true };

  const total     = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 }).skip(skip).limit(limitNum);
  const totalPages = Math.ceil(total / limitNum);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    count: employees.length,
    data:  employees,
  };
};

/**
 * GET /employees/projects
 * Fetch all employee projects using Aggregation Pipeline. Supports pagination.
 * Checklist #16: $unwind, $project, $sort, $skip, $limit stages.
 */
const getAllProjects = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const baseMatch = { $match: { projects: { $exists: true, $not: { $size: 0 } } } };
  const unwindStage   = { $unwind: '$projects' };
  const projectStage  = {
    $project: {
      _id: 0,
      employeeId: '$_id',
      employeeName: '$name',
      email: '$email',
      project: '$projects',
    },
  };
  const sortStage = { $sort: { employeeName: 1 } };

  // Total count (no skip/limit)
  const countResult = await Employee.aggregate([baseMatch, unwindStage, { $count: 'total' }]);
  const total       = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages  = Math.ceil(total / limitNum);

  const result = await Employee.aggregate([
    baseMatch,
    unwindStage,
    projectStage,
    sortStage,
    { $skip: skip },
    { $limit: limitNum },
  ]);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    count: result.length,
    data:  result,
  };
};

/**
 * GET /employees/tasks
 * Fetch all employee tasks using Aggregation Pipeline. Supports pagination.
 * Checklist #16: $unwind, $project, $sort, $skip, $limit stages.
 */
const getAllTasks = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const baseMatch = { $match: { tasks: { $exists: true, $not: { $size: 0 } } } };
  const unwindStage   = { $unwind: '$tasks' };
  const projectStage  = {
    $project: {
      _id: 0,
      employeeId: '$_id',
      employeeName: '$name',
      email: '$email',
      task: '$tasks',
    },
  };
  const sortStage = { $sort: { employeeName: 1 } };

  // Total count (no skip/limit)
  const countResult = await Employee.aggregate([baseMatch, unwindStage, { $count: 'total' }]);
  const total       = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages  = Math.ceil(total / limitNum);

  const result = await Employee.aggregate([
    baseMatch,
    unwindStage,
    projectStage,
    sortStage,
    { $skip: skip },
    { $limit: limitNum },
  ]);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    count: result.length,
    data:  result,
  };
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
 * Uses Aggregation Pipeline: $match → $project → $sort → $skip → $limit.
 * Checklist #16: multi-stage aggregation. Supports pagination.
 */
const getRecentCertifications = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const matchStage = {
    $match: { certifications: { $exists: true, $not: { $size: 0 } } },
  };
  const projectStage = {
    $project: {
      name: 1,
      email: 1,
      primarySkill: 1,
      domain: 1,
      certifications: 1,
      certificationCount: { $size: '$certifications' },
      updatedAt: 1,
    },
  };
  const sortStage = { $sort: { updatedAt: -1 } };

  // Total count (no skip/limit)
  const countResult = await Employee.aggregate([matchStage, { $count: 'total' }]);
  const total       = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages  = Math.ceil(total / limitNum);

  const result = await Employee.aggregate([
    matchStage,
    projectStage,
    sortStage,
    { $skip: skip },
    { $limit: limitNum },
  ]);

  return {
    pagination: {
      currentPage:  pageNum,
      totalPages,
      totalRecords: total,
      limit:        limitNum,
      hasNextPage:  pageNum < totalPages,
      hasPrevPage:  pageNum > 1,
    },
    count: result.length,
    data:  result,
  };
};

// ══════════════════════════════════════════════════════════════
//  SECTION 4: ROUTE PARAMETER FILTERS (Checklist #7)
//  Array-field lookups and per-employee analytics.
// ══════════════════════════════════════════════════════════════

/**
 * GET /employees/project/:projectId
 * Fetch employees whose projects array contains the given projectId
 * (partial, case-insensitive regex match inside the array).
 */
const getByProject = async (projectId) => {
  const filter = { projects: { $elemMatch: { $regex: projectId, $options: 'i' } } };
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/task/:taskId
 * Fetch employees whose tasks array contains the given taskId
 * (partial, case-insensitive regex match inside the array).
 */
const getByTask = async (taskId) => {
  const filter = { tasks: { $elemMatch: { $regex: taskId, $options: 'i' } } };
  const employees = await Employee.find(filter).select('-__v').sort({ name: 1 });
  return { count: employees.length, data: employees };
};

/**
 * GET /employees/performance/:id
 * Fetch performance summary for a single employee by MongoDB ObjectId.
 * Returns: totalProjects, completedTasksCount, certificationsCount, experience.
 */
const getEmployeePerformance = async (id) => {
  const employee = await Employee.findById(id)
    .select('name email primarySkill domain experience projects tasks certifications isVerified -__v')
    .lean();

  if (!employee) return null;

  const totalProjects      = Array.isArray(employee.projects)      ? employee.projects.length      : 0;
  const completedTasksCount = Array.isArray(employee.tasks)         ? employee.tasks.length         : 0;
  const certificationsCount = Array.isArray(employee.certifications) ? employee.certifications.length : 0;

  return {
    employeeId: employee._id,
    name: employee.name,
    email: employee.email,
    domain: employee.domain,
    primarySkill: employee.primarySkill,
    isVerified: employee.isVerified,
    performance: {
      totalProjects,
      completedTasksCount,
      certificationsCount,
      experienceYears: employee.experience,
    },
    projects: employee.projects,
    tasks: employee.tasks,
    certifications: employee.certifications,
  };
};

/**
 * GET /employees/stats/:id
 * Fetch detailed statistics for a single employee by MongoDB ObjectId.
 * Returns: skillSummary, domainInfo, projectCount, taskCount.
 */
const getEmployeeStats = async (id) => {
  const employee = await Employee.findById(id)
    .select('name email primarySkill secondarySkill domain experience projects tasks certifications country city state timezone isVerified createdAt updatedAt -__v')
    .lean();

  if (!employee) return null;

  const projectCount       = Array.isArray(employee.projects)       ? employee.projects.length       : 0;
  const taskCount          = Array.isArray(employee.tasks)          ? employee.tasks.length          : 0;
  const certificationCount = Array.isArray(employee.certifications) ? employee.certifications.length : 0;

  return {
    employeeId: employee._id,
    name: employee.name,
    email: employee.email,
    isVerified: employee.isVerified,
    skillSummary: {
      primarySkill: employee.primarySkill || null,
      secondarySkill: employee.secondarySkill || null,
      experienceYears: employee.experience,
      certifications: employee.certifications,
      certificationCount,
    },
    domainInfo: {
      domain: employee.domain || null,
      country: employee.country || null,
      city: employee.city || null,
      state: employee.state || null,
      timezone: employee.timezone || null,
    },
    projectCount,
    taskCount,
    projects: employee.projects,
    tasks: employee.tasks,
    memberSince: employee.createdAt,
    lastUpdated: employee.updatedAt,
  };
};

// ══════════════════════════════════════════════════════════════
//  SECTION 5: DEDICATED SORT ROUTES (PR 2)
//  Each function has a HARDCODED sort object.
//  All support ?page=1&limit=10 pagination.
// ══════════════════════════════════════════════════════════════

/**
 * GET /employees/sort/experience-desc
 * Returns all employees sorted by experience descending (highest first).
 * Supports pagination: ?page=1&limit=10
 */
const getSortedByExperienceDesc = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const total     = await Employee.countDocuments();
  const employees = await Employee.find()
    .sort({ experience: -1 })          // hardcoded: highest experience first
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  const totalPages = Math.ceil(total / limitNum);
  return {
    pagination: {
      currentPage: pageNum, totalPages, totalRecords: total,
      limit: limitNum, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1,
    },
    appliedSort: { field: 'experience', direction: 'desc' },
    data: employees,
  };
};

/**
 * GET /employees/sort/name-asc
 * Returns all employees sorted alphabetically by name ascending.
 * Supports pagination: ?page=1&limit=10
 */
const getSortedByNameAsc = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const total     = await Employee.countDocuments();
  const employees = await Employee.find()
    .sort({ name: 1 })                 // hardcoded: A → Z
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  const totalPages = Math.ceil(total / limitNum);
  return {
    pagination: {
      currentPage: pageNum, totalPages, totalRecords: total,
      limit: limitNum, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1,
    },
    appliedSort: { field: 'name', direction: 'asc' },
    data: employees,
  };
};

/**
 * GET /employees/sort/project-asc
 * Returns all employees who have projects, sorted by first project name ascending.
 * Supports pagination: ?page=1&limit=10
 */
const getSortedByProjectAsc = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const filter = { projects: { $exists: true, $not: { $size: 0 } } };

  const total     = await Employee.countDocuments(filter);
  const employees = await Employee.find(filter)
    .sort({ 'projects': 1 })           // hardcoded: projects array lexicographic asc
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  const totalPages = Math.ceil(total / limitNum);
  return {
    pagination: {
      currentPage: pageNum, totalPages, totalRecords: total,
      limit: limitNum, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1,
    },
    appliedSort: { field: 'projects', direction: 'asc' },
    data: employees,
  };
};

/**
 * GET /employees/sort/domain-asc
 * Returns all employees sorted by domain name ascending (A → Z).
 * Supports pagination: ?page=1&limit=10
 */
const getSortedByDomainAsc = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const total     = await Employee.countDocuments();
  const employees = await Employee.find()
    .sort({ domain: 1 })               // hardcoded: domain A → Z
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  const totalPages = Math.ceil(total / limitNum);
  return {
    pagination: {
      currentPage: pageNum, totalPages, totalRecords: total,
      limit: limitNum, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1,
    },
    appliedSort: { field: 'domain', direction: 'asc' },
    data: employees,
  };
};

/**
 * GET /employees/sort/certification-desc
 * Returns employees sorted by number of certifications descending (most certs first).
 * Uses Aggregation Pipeline to compute certificationCount.
 * Supports pagination: ?page=1&limit=10
 */
const getSortedByCertificationDesc = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const matchStage = { $match: { certifications: { $exists: true } } };
  const addFieldsStage = {
    $addFields: { certificationCount: { $size: { $ifNull: ['$certifications', []] } } },
  };
  const sortStage    = { $sort: { certificationCount: -1, name: 1 } }; // hardcoded: most certs first
  const projectStage = { $project: { __v: 0 } };

  // Count total
  const countResult = await Employee.aggregate([matchStage, { $count: 'total' }]);
  const total       = countResult.length > 0 ? countResult[0].total : 0;
  const totalPages  = Math.ceil(total / limitNum);

  const employees = await Employee.aggregate([
    matchStage,
    addFieldsStage,
    sortStage,
    projectStage,
    { $skip: skip },
    { $limit: limitNum },
  ]);

  return {
    pagination: {
      currentPage: pageNum, totalPages, totalRecords: total,
      limit: limitNum, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1,
    },
    appliedSort: { field: 'certificationCount', direction: 'desc' },
    data: employees,
  };
};

/**
 * GET /employees/sort/lastUpdated-desc
 * Returns all employees sorted by updatedAt descending (most recently updated first).
 * Supports pagination: ?page=1&limit=10
 */
const getSortedByLastUpdatedDesc = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum  = Number(page);
  const limitNum = Number(limit);
  const skip     = (pageNum - 1) * limitNum;

  const total     = await Employee.countDocuments();
  const employees = await Employee.find()
    .sort({ updatedAt: -1 })           // hardcoded: most recently updated first
    .skip(skip)
    .limit(limitNum)
    .select('-__v');

  const totalPages = Math.ceil(total / limitNum);
  return {
    pagination: {
      currentPage: pageNum, totalPages, totalRecords: total,
      limit: limitNum, hasNextPage: pageNum < totalPages, hasPrevPage: pageNum > 1,
    },
    appliedSort: { field: 'updatedAt', direction: 'desc' },
    data: employees,
  };
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
  // Route Parameter Routes (Section 4)
  getByProject,
  getByTask,
  getEmployeePerformance,
  getEmployeeStats,
  // PR 2 — Dedicated Sort Routes (Section 5)
  getSortedByExperienceDesc,
  getSortedByNameAsc,
  getSortedByProjectAsc,
  getSortedByDomainAsc,
  getSortedByCertificationDesc,
  getSortedByLastUpdatedDesc,
};
