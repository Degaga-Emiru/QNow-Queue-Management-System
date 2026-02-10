import api from './axios';

export const countersAPI = {
  // Create new counter
  createCounter: async (counterData) => {
    const response = await api.post('/counters', counterData);
    return response;
  },

  // Get all counters
  getCounters: async (params = {}) => {
    const response = await api.get('/counters', { params });
    return response;
  },

  // Get counter by ID
  getCounter: async (counterId) => {
    const response = await api.get(`/counters/${counterId}`);
    return response;
  },

  // Update counter
  updateCounter: async (counterId, counterData) => {
    const response = await api.put(`/counters/${counterId}`, counterData);
    return response;
  },

  // Delete counter
  deleteCounter: async (counterId) => {
    const response = await api.delete(`/counters/${counterId}`);
    return response;
  },

  // Set counter status
  setCounterStatus: async (counterId, status) => {
    const response = await api.post(`/counters/${counterId}/status`, { status });
    return response;
  },

  // Set counter break
  setCounterBreak: async (counterId, duration) => {
    const response = await api.post(`/counters/${counterId}/break`, { duration });
    return response;
  },

  // End counter break
  endCounterBreak: async (counterId) => {
    const response = await api.post(`/counters/${counterId}/end-break`);
    return response;
  },

  // Get counter analytics
  getCounterAnalytics: async (counterId) => {
    const response = await api.get(`/counters/${counterId}/analytics`);
    return response;
  },

  // Assign staff to counter
  assignStaff: async (counterId, staffData) => {
    const response = await api.post(`/counters/${counterId}/assign`, staffData);
    return response;
  },

  // Unassign staff from counter
  unassignStaff: async (counterId) => {
    const response = await api.post(`/counters/${counterId}/unassign`);
    return response;
  }
};