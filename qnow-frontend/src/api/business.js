import api from './axios';

export const businessAPI = {
  // Get business profile
  getProfile: async () => {
    const response = await api.get('/business/profile');
    return response;
  },

  // Update business profile
  updateProfile: async (businessData) => {
    const response = await api.put('/business/profile', businessData);
    return response;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/business/dashboard');
    return response;
  },

  // Get analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get('/business/analytics', { params });
    return response;
  },

  // Regenerate business code
  regenerateBusinessCode: async () => {
    const response = await api.post('/business/regenerate-code');
    return response;
  },

  // Get business by code (public)
  getBusinessByCode: async (businessCode) => {
    const response = await api.get(`/business/public/${businessCode}`);
    return response;
  },

  // Get all staff
  getStaff: async () => {
    const response = await api.get('/business/staff');
    return response;
  },

  // Add staff member
  addStaff: async (staffData) => {
    const response = await api.post('/business/staff', staffData);
    return response;
  },

  // Update staff member
  updateStaff: async (staffId, staffData) => {
    const response = await api.put(`/business/staff/${staffId}`, staffData);
    return response;
  },

  // Remove staff member
  removeStaff: async (staffId) => {
    const response = await api.delete(`/business/staff/${staffId}`);
    return response;
  }
};