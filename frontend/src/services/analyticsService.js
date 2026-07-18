import api from './api';

export const analyticsService = {
  getSeeker: async (candidateId) => {
    const response = await api.get('/analytics/seeker', {
      params: { candidateId }
    });
    return response.data;
  },

  getRecruiter: async (recruiterId) => {
    const response = await api.get('/analytics/recruiter', {
      params: { recruiterId }
    });
    return response.data;
  }
};
