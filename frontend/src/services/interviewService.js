import api from './api';

export const interviewService = {
  schedule: async (interviewData) => {
    const response = await api.post('/interviews/schedule', interviewData);
    return response.data;
  },

  getByApplication: async (applicationId) => {
    const response = await api.get(`/interviews/application/${applicationId}`);
    return response.data;
  },

  getByCandidate: async (candidateId) => {
    const response = await api.get(`/interviews/candidate/${candidateId}`);
    return response.data;
  },
};
