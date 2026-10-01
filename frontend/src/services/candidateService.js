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

  getResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },

  reviewResumeForJob: async (resumeId, jobId) => {
    const response = await api.get(`/resumes/${resumeId}/ai-review/job/${jobId}`);
    return response.data;
  },

  getInterviewQuestions: async (resumeId, jobId) => {
    const response = await api.get(`/resumes/${resumeId}/interview-questions/job/${jobId}`);
    return response.data;
  },

  tailorResume: async (resumeId, jobId) => {
    const response = await api.post(`/resumes/${resumeId}/tailor/${jobId}`);
    return response.data;
  },

  previewTailorResume: async (resumeId, jobId) => {
    const response = await api.get(`/resumes/${resumeId}/tailor-preview/job/${jobId}`);
    return response.data;
  },

  generateCustomTailoredResume: async (resumeId, jobId, customizedData, format = 'docx') => {
    const response = await api.post(`/resumes/${resumeId}/tailor-custom/job/${jobId}?format=${format}`, customizedData);
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

  deleteResume: async (resumeId) => {
    const response = await api.delete(`/resumes/${resumeId}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/candidates');
    return response.data;
  }
};
