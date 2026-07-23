import api from './api';

export const adminService = {
  getAnalytics: async () => {
    const response = await api.get('/analytics/admin');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getJobs: async () => {
    const response = await api.get('/admin/jobs');
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },

  getApplications: async () => {
    const response = await api.get('/admin/applications');
    return response.data;
  },

  deleteApplication: async (id) => {
    const response = await api.delete(`/admin/applications/${id}`);
    return response.data;
  },

  getDatabaseInfo: async () => {
    const response = await api.get('/system/database-info');
    return response.data;
  }
};
