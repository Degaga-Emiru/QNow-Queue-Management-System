import api from './axios';

export const queueAPI = {
  // Join queue as customer
  joinQueue: async (queueData) => {
    const response = await api.post('/queue/join', queueData);
    return response;
  },

  // Get queue status (public)
  getQueueStatus: async (businessCode, queueNumber) => {
    const response = await api.get(`/queue/status/${businessCode}/${queueNumber}`);
    return response;
  },

  // Get current queue (business)
  getCurrentQueue: async (params = {}) => {
    const response = await api.get('/queue/business/current', { params });
    return response;
  },

  // Call next customer
  callNextCustomer: async (counterData) => {
    const response = await api.post('/queue/business/call-next', counterData);
    return response;
  },

  // Start serving customer
  startServing: async (queueId) => {
    const response = await api.post(`/queue/business/serve/${queueId}`);
    return response;
  },

  // Complete service
  completeService: async (queueId) => {
    const response = await api.post(`/queue/business/complete/${queueId}`);
    return response;
  },

  // Skip customer
  skipCustomer: async (queueId, reason) => {
    const response = await api.post(`/queue/business/skip/${queueId}`, { reason });
    return response;
  },

  // Transfer queue
  transferQueue: async (transferData) => {
    const response = await api.post('/queue/business/transfer', transferData);
    return response;
  },

  // Get queue analytics
  getQueueAnalytics: async (params = {}) => {
    const response = await api.get('/queue/business/analytics', { params });
    return response;
  },

  // Get customer history
  getCustomerHistory: async (params = {}) => {
    const response = await api.get('/queue/business/customers', { params });
    return response;
  }
};