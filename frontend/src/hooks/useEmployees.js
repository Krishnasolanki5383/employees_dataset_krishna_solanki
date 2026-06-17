import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';

export const useEmployeesList = (params = {}) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const response = await axiosInstance.get('/employees', { params });
      return response.data; // structure: { success: true, message, data: [...], pagination: { ... } }
    },
    keepPreviousData: true
  });
};

export const useEmployeeDetail = (id) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/employees/${id}`);
      return response.data; // structure: { success: true, message, data: { ... } }
    },
    enabled: !!id
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeeData) => {
      const response = await axiosInstance.post('/employees', employeeData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.patch(`/employees/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    }
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.delete(`/employees/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

export const useBulkDeleteEmployees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      const response = await axiosInstance.delete('/employees/bulk-delete', { data: { ids } });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};

export const useBulkCreateEmployees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employees) => {
      const response = await axiosInstance.post('/employees/bulk-create', { employees });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
};
