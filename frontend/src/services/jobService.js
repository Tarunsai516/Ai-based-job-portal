import api from './api';

export const jobService = {
  getAll: async (search = '', location = '', type = '', recruiterId = '', recruiterEmail = '') => {
    const params = {};
    if (search) params.q = search;
    if (location) params.location = location;
    if (type) params.type = type;
    if (recruiterId) params.recruiterId = recruiterId;
    if (recruiterEmail) params.recruiterEmail = recruiterEmail;
    
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  create: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  update: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  }
};
