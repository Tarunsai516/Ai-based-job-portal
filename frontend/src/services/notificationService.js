import api from './api';

export const notificationService = {
  getByRole: async (role) => {
    const response = await api.get('/notifications', {
      params: { role }
    });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }
};
