import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

// Async Thunks
export const fetchEmployees = createAsyncThunk(
  'data/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/employees', { params });
      return response.data; // structure: { success: true, message, data: [...], pagination: { ... } }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'data/fetchEmployeeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/employees/${id}`);
      return response.data; // structure: { success: true, message, data: { ... } }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee details');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'data/createEmployee',
  async (employeeData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.errors?.[0] || 
        'Failed to create employee'
      );
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'data/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/employees/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.errors?.[0] || 
        'Failed to update employee'
      );
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'data/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/employees/${id}`);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete employee');
    }
  }
);

export const bulkDeleteEmployees = createAsyncThunk(
  'data/bulkDeleteEmployees',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/employees/bulk-delete', { data: { ids } });
      return { ids, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to perform bulk delete');
    }
  }
);

export const bulkCreateEmployees = createAsyncThunk(
  'data/bulkCreateEmployees',
  async (employees, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/employees/bulk-create', { employees });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk import employees');
    }
  }
);

export const fetchStatsOverview = createAsyncThunk(
  'data/fetchStatsOverview',
  async (_, { rejectWithValue }) => {
    try {
      const [totalRes, verifiedRes, avgExpRes, totalProjectsRes, totalTasksRes] = await Promise.all([
        axiosInstance.get('/stats/employees/count'),
        axiosInstance.get('/stats/employees/verified-count'),
        axiosInstance.get('/stats/employees/experience-average'),
        axiosInstance.get('/stats/employees/project-count'),
        axiosInstance.get('/stats/employees/task-count'),
      ]);

      return {
        total: totalRes.data.data.count,
        verified: verifiedRes.data.data.count,
        averageExperience: avgExpRes.data.data.averageExperience,
        totalProjects: totalProjectsRes.data.data.count,
        totalTasks: totalTasksRes.data.data.count,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

export const fetchAnalyticsData = createAsyncThunk(
  'data/fetchAnalyticsData',
  async (_, { rejectWithValue }) => {
    try {
      const [
        skillsDist,
        domainDist,
        expAnalysis,
        verificationAnalysis,
        timezoneAnalysis,
        topSkills,
        topProjects
      ] = await Promise.all([
        axiosInstance.get('/analytics/employees/skill-distribution'),
        axiosInstance.get('/analytics/employees/domain-distribution'),
        axiosInstance.get('/analytics/employees/experience-analysis'),
        axiosInstance.get('/analytics/employees/verification-analysis'),
        axiosInstance.get('/analytics/employees/timezone-analysis'),
        axiosInstance.get('/analytics/employees/top-skills'),
        axiosInstance.get('/analytics/employees/top-projects')
      ]);

      return {
        skillsDistribution: skillsDist.data.data,
        domainDistribution: domainDist.data.data,
        experienceAnalysis: expAnalysis.data.data,
        verificationAnalysis: verificationAnalysis.data.data,
        timezoneAnalysis: timezoneAnalysis.data.data,
        topSkills: topSkills.data.data,
        topProjects: topProjects.data.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics data');
    }
  }
);

export const fetchEmployeePersonalStats = createAsyncThunk(
  'data/fetchEmployeePersonalStats',
  async (id, { rejectWithValue }) => {
    try {
      const [perfRes, statsRes] = await Promise.all([
        axiosInstance.get(`/employees/performance/${id}`),
        axiosInstance.get(`/employees/stats/${id}`),
      ]);
      return {
        performance: perfRes.data.data,
        stats: statsRes.data.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee personal stats');
    }
  }
);

// Slice Definition
const dataSlice = createSlice({
  name: 'data',
  initialState: {
    employees: [],
    pagination: {
      page: 1,
      totalPages: 1,
      totalRecords: 0,
      limit: 10
    },
    selectedEmployee: null,
    selectedEmployeeStats: null,
    statsOverview: null,
    analyticsData: null,

    // Loading states
    loadingEmployees: false,
    loadingDetail: false,
    loadingStats: false,
    loadingAnalytics: false,
    loadingPersonalStats: false,
    loadingMutation: false,

    // Error states
    errorEmployees: null,
    errorDetail: null,
    errorStats: null,
    errorAnalytics: null,
    errorPersonalStats: null,
    errorMutation: null
  },
  reducers: {
    clearErrors: (state) => {
      state.errorEmployees = null;
      state.errorDetail = null;
      state.errorStats = null;
      state.errorAnalytics = null;
      state.errorPersonalStats = null;
      state.errorMutation = null;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
      state.selectedEmployeeStats = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchEmployees
      .addCase(fetchEmployees.pending, (state) => {
        state.loadingEmployees = true;
        state.errorEmployees = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loadingEmployees = false;
        state.employees = action.payload.data || [];
        state.pagination = action.payload.pagination || { page: 1, totalPages: 1, totalRecords: 0, limit: 10 };
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loadingEmployees = false;
        state.errorEmployees = action.payload;
      })

      // fetchEmployeeById
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selectedEmployee = action.payload.data;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload;
      })

      // createEmployee
      .addCase(createEmployee.pending, (state) => {
        state.loadingMutation = true;
        state.errorMutation = null;
      })
      .addCase(createEmployee.fulfilled, (state) => {
        state.loadingMutation = false;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loadingMutation = false;
        state.errorMutation = action.payload;
      })

      // updateEmployee
      .addCase(updateEmployee.pending, (state) => {
        state.loadingMutation = true;
        state.errorMutation = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loadingMutation = false;
        if (state.selectedEmployee && state.selectedEmployee._id === action.payload.data?._id) {
          state.selectedEmployee = action.payload.data;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loadingMutation = false;
        state.errorMutation = action.payload;
      })

      // deleteEmployee
      .addCase(deleteEmployee.pending, (state) => {
        state.loadingMutation = true;
        state.errorMutation = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loadingMutation = false;
        state.employees = state.employees.filter((emp) => emp._id !== action.payload.id);
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loadingMutation = false;
        state.errorMutation = action.payload;
      })

      // bulkDeleteEmployees
      .addCase(bulkDeleteEmployees.pending, (state) => {
        state.loadingMutation = true;
        state.errorMutation = null;
      })
      .addCase(bulkDeleteEmployees.fulfilled, (state, action) => {
        state.loadingMutation = false;
        state.employees = state.employees.filter((emp) => !action.payload.ids.includes(emp._id));
      })
      .addCase(bulkDeleteEmployees.rejected, (state, action) => {
        state.loadingMutation = false;
        state.errorMutation = action.payload;
      })

      // bulkCreateEmployees
      .addCase(bulkCreateEmployees.pending, (state) => {
        state.loadingMutation = true;
        state.errorMutation = null;
      })
      .addCase(bulkCreateEmployees.fulfilled, (state) => {
        state.loadingMutation = false;
      })
      .addCase(bulkCreateEmployees.rejected, (state, action) => {
        state.loadingMutation = false;
        state.errorMutation = action.payload;
      })

      // fetchStatsOverview
      .addCase(fetchStatsOverview.pending, (state) => {
        state.loadingStats = true;
        state.errorStats = null;
      })
      .addCase(fetchStatsOverview.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.statsOverview = action.payload;
      })
      .addCase(fetchStatsOverview.rejected, (state, action) => {
        state.loadingStats = false;
        state.errorStats = action.payload;
      })

      // fetchAnalyticsData
      .addCase(fetchAnalyticsData.pending, (state) => {
        state.loadingAnalytics = true;
        state.errorAnalytics = null;
      })
      .addCase(fetchAnalyticsData.fulfilled, (state, action) => {
        state.loadingAnalytics = false;
        state.analyticsData = action.payload;
      })
      .addCase(fetchAnalyticsData.rejected, (state, action) => {
        state.loadingAnalytics = false;
        state.errorAnalytics = action.payload;
      })

      // fetchEmployeePersonalStats
      .addCase(fetchEmployeePersonalStats.pending, (state) => {
        state.loadingPersonalStats = true;
        state.errorPersonalStats = null;
      })
      .addCase(fetchEmployeePersonalStats.fulfilled, (state, action) => {
        state.loadingPersonalStats = false;
        state.selectedEmployeeStats = action.payload;
      })
      .addCase(fetchEmployeePersonalStats.rejected, (state, action) => {
        state.loadingPersonalStats = false;
        state.errorPersonalStats = action.payload;
      });
  }
});

export const { clearErrors, clearSelectedEmployee } = dataSlice.actions;
export default dataSlice.reducer;
