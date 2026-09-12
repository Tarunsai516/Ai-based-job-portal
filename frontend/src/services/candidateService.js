import api from './api';

export const candidateService = {
  getMyProfile: async () => {
    const response = await api.get('/candidates/me');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  updateProfile: async (candidateData) => {
    const response = await api.put('/candidates/profile', candidateData);
    return response.data;
  },

  uploadResume: async (formData) => {
    // formData is already a FormData object passed in from the component
    const response = await api.post('/candidates/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getResume: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}`);
    return response.data;
  },

  getLatestResume: async () => {
    const response = await api.get('/resumes/latest');
    return response.status === 204 ? null : response.data;
  },

  reviewLatestResume: async () => {
    const response = await api.get('/resumes/latest/ai-review');
    return response.data;
  },

  downloadResume: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/file`, { responseType: 'blob' });
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/candidates');
    return response.data;
  }
};
