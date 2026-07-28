import api from './api';

export const supportService = {
  // Create a new support ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/support/tickets', ticketData);
    return response.data;
  },

  // Get tickets for a specific user
  getUserTickets: async (userId) => {
    const response = await api.get(`/support/tickets/user/${userId}`);
    return response.data;
  },

  // Get all tickets (admin)
  getAllTickets: async () => {
    const response = await api.get('/support/tickets');
    return response.data;
  },

  // Update ticket status (admin)
  updateTicketStatus: async (ticketId, status) => {
    const response = await api.put(`/support/tickets/${ticketId}/status`, { status });
    return response.data;
  },

  // Reply to a ticket (admin)
  replyToTicket: async (ticketId, adminReply) => {
    const response = await api.put(`/support/tickets/${ticketId}/reply`, { adminReply });
    return response.data;
  },
};
