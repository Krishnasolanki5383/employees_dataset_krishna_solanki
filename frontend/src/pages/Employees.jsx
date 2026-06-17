import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  bulkDeleteEmployees
} from '../store/dataSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiEye } from 'react-icons/fi';

const Employees = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Page Search, Filter, Sort, Paginate States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Multi-select for bulk delete
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null); // null means adding
  const [formError, setFormError] = useState('');

  // Query parameters mapping
  const queryParams = {
    page,
    limit: 10,
    sort: sortField,
    order: sortOrder,
    ...(search && { search }),
    ...(domainFilter && { domain: domainFilter }),
    ...(countryFilter && { country: countryFilter }),
    ...(verifiedFilter && { verified: verifiedFilter }),
  };

  // Selectors from Redux Toolkit
  const {
    employees,
    pagination,
    loadingEmployees: isLoading,
    errorEmployees: error
  } = useSelector((state) => state.data);

  // Fetch data on parameters change
  useEffect(() => {
    dispatch(fetchEmployees(queryParams));
  }, [page, search, domainFilter, countryFilter, verifiedFilter, sortField, sortOrder, dispatch]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(employees.map(emp => emp._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(x => x !== id));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await dispatch(deleteEmployee(id)).unwrap();
        toast.success('Employee deleted successfully!');
        setSelectedIds(selectedIds.filter(x => x !== id));
        dispatch(fetchEmployees(queryParams));
      } catch (err) {
        toast.error(err || 'Delete failed.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} employees?`)) {
      try {
        await dispatch(bulkDeleteEmployees(selectedIds)).unwrap();
        toast.success('Selected employees deleted successfully!');
        setSelectedIds([]);
        dispatch(fetchEmployees(queryParams));
      } catch (err) {
        toast.error(err || 'Bulk delete failed.');
      }
    }
  };

  const handleOpenForm = (employee = null) => {
    setFormError('');
    setCurrentEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Yup validation schema for employee form
  const employeeSchema = Yup.object().shape({
    name: Yup.string().trim().required('Full Name is required'),
    email: Yup.string().email('Please enter a valid email address').required('Email is required'),
    phone: Yup.string()
      .matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/, 'Invalid phone number format')
      .nullable(),
    experience: Yup.number()
      .typeError('Experience must be a number')
      .min(0, 'Experience cannot be negative')
      .max(50, 'Experience cannot exceed 50 years')
      .required('Years Experience is required'),
    city: Yup.string().trim().nullable(),
    state: Yup.string().trim().nullable(),
    country: Yup.string().trim().nullable(),
    timezone: Yup.string().trim().default('UTC').nullable(),
    primarySkill: Yup.string().trim().nullable(),
    secondarySkill: Yup.string().trim().nullable(),
    domain: Yup.string().trim().nullable(),
    certifications: Yup.string().trim().nullable(),
    projects: Yup.string().trim().nullable(),
    tasks: Yup.string().trim().nullable(),
    isVerified: Yup.boolean().default(false),
  });

  const getInitialValues = () => {
    if (currentEmployee) {
      return {
        name: currentEmployee.name || '',
        email: currentEmployee.email || '',
        phone: currentEmployee.phone || '',
        city: currentEmployee.city || '',
        state: currentEmployee.state || '',
        country: currentEmployee.country || '',
        timezone: currentEmployee.timezone || 'UTC',
        primarySkill: currentEmployee.primarySkill || '',
        secondarySkill: currentEmployee.secondarySkill || '',
        domain: currentEmployee.domain || '',
        experience: currentEmployee.experience || 0,
        certifications: currentEmployee.certifications?.join(', ') || '',
        projects: currentEmployee.projects?.join(', ') || '',
        tasks: currentEmployee.tasks?.join(', ') || '',
        isVerified: currentEmployee.isVerified || false
      };
    }
    return {
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      country: '',
      timezone: 'UTC',
      primarySkill: '',
      secondarySkill: '',
      domain: '',
      experience: 0,
      certifications: '',
      projects: '',
      tasks: '',
      isVerified: false
    };
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Employees Directory | EMS Portal</title>
        <meta name="description" content="Manage your company's employee records, update skill lists, and allocate projects and tasks." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-text tracking-tight">Employees Directory</h1>
          <p className="text-sm text-brand-textMuted mt-1">Manage, filter, and track employee details</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete} className="flex items-center gap-2">
              <FiTrash2 /> Bulk Delete ({selectedIds.length})
            </Button>
          )}
          <Button variant="primary" onClick={() => handleOpenForm()} className="flex items-center gap-2">
            <FiPlus /> Add Employee
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-brand-card border border-gray-800/10 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center transition-colors">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search name, email, skills..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full"
          />
          <FiSearch className="absolute right-3 top-[34px] text-gray-500" />
        </div>

        {/* Domain Filter */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-brand-textMuted select-none">Filter Domain</label>
          <select
            value={domainFilter}
            onChange={(e) => {
              setDomainFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border border-gray-700/50 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
          >
            <option value="">All Domains</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="HR">HR</option>
            <option value="Design">Design</option>
          </select>
        </div>

        {/* Country Filter */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-brand-textMuted select-none">Filter Country</label>
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border border-gray-700/50 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
          >
            <option value="">All Countries</option>
            <option value="USA">USA</option>
            <option value="India">India</option>
            <option value="Canada">Canada</option>
            <option value="UK">UK</option>
            <option value="Germany">Germany</option>
          </select>
        </div>

        {/* Verified Status Filter */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm font-medium text-brand-textMuted select-none">Verification Status</label>
          <select
            value={verifiedFilter}
            onChange={(e) => {
              setVerifiedFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border border-gray-700/50 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Directory Table Grid */}
      {isLoading ? (
        <Loader message="Loading employees roster..." />
      ) : error ? (
        <ErrorMessage
          message={error || 'Error fetching employees.'}
          onRetry={() => dispatch(fetchEmployees(queryParams))}
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-gray-800/10 text-left text-sm text-brand-text">
            <thead className="bg-brand-bg text-brand-textMuted">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={employees.length > 0 && selectedIds.length === employees.length}
                    className="rounded border-gray-700/50 bg-brand-bg text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 cursor-pointer select-none hover:text-white" onClick={() => handleSort('name')}>
                  Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 cursor-pointer select-none hover:text-white" onClick={() => handleSort('domain')}>
                  Domain {sortField === 'domain' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 cursor-pointer select-none hover:text-white" onClick={() => handleSort('experience')}>
                  Experience {sortField === 'experience' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4">Primary Skill</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/10 bg-transparent">
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-brand-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp._id)}
                        onChange={(e) => handleSelectOne(emp._id, e.target.checked)}
                        className="rounded border-gray-700/50 bg-brand-bg text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-text">{emp.name}</div>
                      <div className="text-xs text-brand-textMuted mt-0.5">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{emp.domain || 'N/A'}</td>
                    <td className="px-6 py-4">{emp.experience} Yrs</td>
                    <td className="px-6 py-4">
                      {emp.primarySkill ? (
                        <Badge variant="info">{emp.primarySkill}</Badge>
                      ) : (
                        <span className="text-brand-textMuted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {emp.city ? `${emp.city}, ` : ''}{emp.country || 'Global'}
                    </td>
                    <td className="px-6 py-4">
                      {emp.isVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2.5">
                      <button
                        onClick={() => navigate(`/employees/${emp._id}`)}
                        className="text-brand-textMuted hover:text-brand-primary transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <FiEye className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleOpenForm(emp)}
                        className="text-brand-textMuted hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <FiEdit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="text-brand-textMuted hover:text-brand-danger transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <FiTrash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-brand-textMuted">
                    No records matching search constraints.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Toolbar */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-brand-bg border-t border-gray-800/10 flex items-center justify-between">
              <p className="text-xs text-brand-textMuted">
                Showing page <span className="text-brand-text font-semibold">{pagination.page}</span> of{' '}
                <span className="text-brand-text font-semibold">{pagination.totalPages}</span> ({pagination.totalRecords} total records)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="py-1 px-3 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  className="py-1 px-3 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* CRUD Add/Edit Modal with Formik */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEmployee ? 'Edit Employee Details' : 'Add New Employee'}
        className="max-w-2xl"
      >
        {formError && (
          <div className="bg-brand-danger/10 border border-brand-danger/20 rounded-lg p-3 text-xs text-brand-danger mb-4">
            {formError}
          </div>
        )}

        <Formik
          initialValues={getInitialValues()}
          validationSchema={employeeSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            setFormError('');
            // Format strings lists to arrays
            const formattedData = {
              ...values,
              experience: Number(values.experience),
              certifications: values.certifications ? values.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
              projects: values.projects ? values.projects.split(',').map(s => s.trim()).filter(Boolean) : [],
              tasks: values.tasks ? values.tasks.split(',').map(s => s.trim()).filter(Boolean) : []
            };

            try {
              if (currentEmployee) {
                await dispatch(updateEmployee({ id: currentEmployee._id, data: formattedData })).unwrap();
                toast.success('Employee record updated successfully!');
              } else {
                await dispatch(createEmployee(formattedData)).unwrap();
                toast.success('Employee record created successfully!');
              }
              dispatch(fetchEmployees(queryParams));
              setIsModalOpen(false);
            } catch (err) {
              setFormError(err || 'Form submission failed.');
              toast.error(err || 'Form submission failed.');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && errors.name}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && errors.email}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && errors.phone}
                />
                <Input
                  label="Years Experience"
                  type="number"
                  name="experience"
                  value={values.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.experience && errors.experience}
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.city && errors.city}
                />
                <Input
                  label="State"
                  name="state"
                  value={values.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.state && errors.state}
                />
                <Input
                  label="Country"
                  name="country"
                  value={values.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.country && errors.country}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium text-brand-textMuted select-none">Domain</label>
                  <select
                    name="domain"
                    value={values.domain}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border border-gray-700 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
                  >
                    <option value="">Select Domain</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Design">Design</option>
                  </select>
                  {touched.domain && errors.domain && (
                    <span className="text-xs text-brand-danger mt-1">{errors.domain}</span>
                  )}
                </div>
                <Input
                  label="Timezone"
                  name="timezone"
                  value={values.timezone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.timezone && errors.timezone}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Skill"
                  name="primarySkill"
                  value={values.primarySkill}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.primarySkill && errors.primarySkill}
                />
                <Input
                  label="Secondary Skill"
                  name="secondarySkill"
                  value={values.secondarySkill}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.secondarySkill && errors.secondarySkill}
                />
              </div>

              <Input
                label="Projects (Comma separated)"
                name="projects"
                value={values.projects}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.projects && errors.projects}
                placeholder="E.g. Project Alpha, Project Beta"
              />

              <Input
                label="Tasks (Comma separated)"
                name="tasks"
                value={values.tasks}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.tasks && errors.tasks}
                placeholder="E.g. Task-101, Task-102"
              />

              <Input
                label="Certifications (Comma separated)"
                name="certifications"
                value={values.certifications}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.certifications && errors.certifications}
                placeholder="E.g. AWS Solutions Architect, CSM"
              />

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  name="isVerified"
                  checked={values.isVerified}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="rounded border-gray-700 bg-brand-bg text-brand-primary focus:ring-brand-primary h-4 w-4 cursor-pointer"
                />
                <label htmlFor="isVerified" className="text-sm font-semibold text-brand-text select-none cursor-pointer">
                  Mark Employee Profile as Verified
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/10">
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                >
                  {currentEmployee ? 'Save Changes' : 'Create Record'}
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default Employees;

