import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useEmployeesList,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useBulkDeleteEmployees
} from '../hooks/useEmployees';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiEye, FiFilter, FiCheck, FiX } from 'react-icons/fi';

const Employees = () => {
  const navigate = useNavigate();
  
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
  const [formData, setFormData] = useState({
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
  });

  // Query Hook
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

  const { data: employeesData, isLoading, error, refetch } = useEmployeesList(queryParams);

  // Mutations
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const bulkDeleteMutation = useBulkDeleteEmployees();

  if (isLoading) {
    return <Loader message="Loading employees roster..." />;
  }

  if (error) {
    return <ErrorMessage message={error.response?.data?.message || 'Error fetching employees.'} onRetry={refetch} />;
  }

  const employees = employeesData?.data || [];
  const pagination = employeesData?.pagination || { page: 1, totalPages: 1, totalRecords: 0 };

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
        await deleteMutation.mutateAsync(id);
        setSelectedIds(selectedIds.filter(x => x !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} employees?`)) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedIds);
        setSelectedIds([]);
      } catch (err) {
        alert(err.response?.data?.message || 'Bulk delete failed.');
      }
    }
  };

  const handleOpenForm = (employee = null) => {
    setFormError('');
    if (employee) {
      setCurrentEmployee(employee);
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        city: employee.city || '',
        state: employee.state || '',
        country: employee.country || '',
        timezone: employee.timezone || 'UTC',
        primarySkill: employee.primarySkill || '',
        secondarySkill: employee.secondarySkill || '',
        domain: employee.domain || '',
        experience: employee.experience || 0,
        certifications: employee.certifications?.join(', ') || '',
        projects: employee.projects?.join(', ') || '',
        tasks: employee.tasks?.join(', ') || '',
        isVerified: employee.isVerified || false
      });
    } else {
      setCurrentEmployee(null);
      setFormData({
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
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Format strings lists to arrays
    const formattedData = {
      ...formData,
      experience: Number(formData.experience),
      certifications: formData.certifications ? formData.certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
      projects: formData.projects ? formData.projects.split(',').map(s => s.trim()).filter(Boolean) : [],
      tasks: formData.tasks ? formData.tasks.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    try {
      if (currentEmployee) {
        await updateMutation.mutateAsync({ id: currentEmployee._id, data: formattedData });
      } else {
        await createMutation.mutateAsync(formattedData);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Form validation failed.');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employees Directory</h1>
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
      <div className="bg-brand-card border border-gray-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
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
            className="w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border border-gray-700 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
            className="w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border border-gray-700 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
            className="w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border border-gray-700 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">All Statuses</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Directory Table Grid */}
      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-800 text-left text-sm text-brand-text">
          <thead className="bg-gray-800/40 text-brand-textMuted">
            <tr>
              <th className="px-6 py-4">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={employees.length > 0 && selectedIds.length === employees.length}
                  className="rounded border-gray-700 bg-brand-bg text-brand-primary focus:ring-brand-primary h-4 w-4"
                />
              </th>
              <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('name')}>
                Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('domain')}>
                Domain {sortField === 'domain' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('experience')}>
                Experience {sortField === 'experience' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="px-6 py-4">Primary Skill</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 bg-transparent">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(emp._id)}
                      onChange={(e) => handleSelectOne(emp._id, e.target.checked)}
                      className="rounded border-gray-700 bg-brand-bg text-brand-primary focus:ring-brand-primary h-4 w-4"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{emp.name}</div>
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
                      className="text-brand-textMuted hover:text-brand-primary transition-colors"
                      title="View Details"
                    >
                      <FiEye className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleOpenForm(emp)}
                      className="text-brand-textMuted hover:text-emerald-400 transition-colors"
                      title="Edit Profile"
                    >
                      <FiEdit2 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="text-brand-textMuted hover:text-brand-danger transition-colors"
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
          <div className="px-6 py-4 bg-gray-800/10 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-brand-textMuted">
              Showing page <span className="text-white font-semibold">{pagination.page}</span> of{' '}
              <span className="text-white font-semibold">{pagination.totalPages}</span> ({pagination.totalRecords} total records)
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

      {/* CRUD Add/Edit Modal */}
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

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
            />
            <Input
              label="Years Experience"
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleFormChange}
              min="0"
              max="50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleFormChange}
            />
            <Input
              label="State"
              name="state"
              value={formData.state}
              onChange={handleFormChange}
            />
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleFormChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-brand-textMuted select-none">Domain</label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleFormChange}
                className="w-full px-4 py-2 text-sm rounded-lg bg-brand-bg border border-gray-700 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="">Select Domain</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Design">Design</option>
              </select>
            </div>
            <Input
              label="Timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleFormChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Skill"
              name="primarySkill"
              value={formData.primarySkill}
              onChange={handleFormChange}
            />
            <Input
              label="Secondary Skill"
              name="secondarySkill"
              value={formData.secondarySkill}
              onChange={handleFormChange}
            />
          </div>

          <Input
            label="Projects (Comma separated)"
            name="projects"
            value={formData.projects}
            onChange={handleFormChange}
            placeholder="E.g. Project Alpha, Project Beta"
          />

          <Input
            label="Tasks (Comma separated)"
            name="tasks"
            value={formData.tasks}
            onChange={handleFormChange}
            placeholder="E.g. Task-101, Task-102"
          />

          <Input
            label="Certifications (Comma separated)"
            name="certifications"
            value={formData.certifications}
            onChange={handleFormChange}
            placeholder="E.g. AWS Solutions Architect, CSM"
          />

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="isVerified"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleFormChange}
              className="rounded border-gray-700 bg-brand-bg text-brand-primary focus:ring-brand-primary h-4 w-4"
            />
            <label htmlFor="isVerified" className="text-sm font-semibold text-brand-text select-none">
              Mark Employee Profile as Verified
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isLoading || updateMutation.isLoading}
            >
              {currentEmployee ? 'Save Changes' : 'Create Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
