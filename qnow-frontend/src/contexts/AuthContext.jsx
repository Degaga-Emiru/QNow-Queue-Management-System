import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Fetch fresh user data if needed
          if (userData.role === 'business_owner' || userData.role === 'business_staff') {
            try {
              const userResponse = await authAPI.getCurrentUser();
              setUser(userResponse.user);
              if (userResponse.business) {
                setBusiness(userResponse.business);
              }
              localStorage.setItem('user', JSON.stringify(userResponse.user));
            } catch (error) {
              console.error('Failed to fetch user data:', error);
              // Keep using saved user data
            }
          }
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      setBusiness(response.business || null);
      
      toast.success('Login successful!');
      return response;
    } catch (error) {
      toast.error(error?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      // Save token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      setBusiness(response.business || null);
      
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      toast.error(error?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    setUser(null);
    setBusiness(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to change password');
      throw error;
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token;
  };

  // Check user role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has business
  const hasBusiness = () => {
    return !!business;
  };

  const value = {
    user,
    business,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    hasRole,
    hasBusiness,
    setUser,
    setBusiness
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};