import { useState, useCallback } from 'react';
import { businessAPI } from '../api/business';
import toast from 'react-hot-toast';

export const useBusiness = () => {
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Get business profile
  const getBusinessProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await businessAPI.getProfile();
      setBusiness(response.business);
      return response.business;
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch business profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update business profile
  const updateBusinessProfile = useCallback(async (businessData) => {
    try {
      setLoading(true);
      const response = await businessAPI.updateProfile(businessData);
      setBusiness(response.business);
      toast.success('Business profile updated successfully');
      return response.business;
    } catch (error) {
      toast.error(error?.message || 'Failed to update business profile');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get dashboard stats
  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await businessAPI.getDashboardStats();
      return response.stats;
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch dashboard stats');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get analytics
  const getAnalytics = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await businessAPI.getAnalytics(params);
      setAnalytics(response.analytics);
      return response.analytics;
    } catch (error) {
      toast.error(error?.message || 'Failed to fetch analytics');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Regenerate business code
  const regenerateBusinessCode = useCallback(async () => {
    try {
      setLoading(true);
      const response = await businessAPI.regenerateBusinessCode();
      if (business) {
        setBusiness(prev => ({ ...prev, businessCode: response.businessCode }));
      }
      toast.success('Business code regenerated successfully');
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to regenerate business code');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [business]);

  // Get business by code
  const getBusinessByCode = useCallback(async (businessCode) => {
    try {
      setLoading(true);
      const response = await businessAPI.getBusinessByCode(businessCode);
      return response.business;
    } catch (error) {
      toast.error(error?.message || 'Business not found');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    business,
    analytics,
    loading,
    getBusinessProfile,
    updateBusinessProfile,
    getDashboardStats,
    getAnalytics,
    regenerateBusinessCode,
    getBusinessByCode,
    setBusiness
  };
};