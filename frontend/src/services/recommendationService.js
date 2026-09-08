import api from './api';

export const recommendationService = {
  getForCandidate: async (candidateId, page = 0, size = 10) => {
    const response = await api.get(`/recommendations/candidate/${candidateId}`, {
      params: { page, size },
    });
    return response.data;
  },
};
