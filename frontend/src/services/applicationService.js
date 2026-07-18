import api from './api';

export const applicationService = {
  getByCandidateId: async (candidateId) => {
    const response = await api.get('/applications', { params: { candidateId } });
    return response.data;
  },

  getByRecruiterId: async (recruiterId) => {
    const response = await api.get('/applications', { params: { recruiterId } });
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  getByJobId: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data;
  },

  apply: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  updateStatus: async (applicationId, status) => {
    const response = await api.put(`/applications/${applicationId}/status`, { status });
    return response.data;
  },

  delete: async (applicationId) => {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  }
};
