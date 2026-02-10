import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { QueueProvider } from './contexts/QueueContext';

// Layout Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CustomerQueue from './pages/public/CustomerQueue';

// Business Pages
import Dashboard from './pages/business/Dashboard';
import QueueControl from './pages/business/QueueControl';
import Counters from './pages/business/Counters';
import Analytics from './pages/business/Analytics';
import Settings from './pages/business/Settings';
import Staff from './pages/business/Staff';

// User Pages
import Profile from './pages/user/Profile';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <QueueProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        theme: {
                          primary: 'green',
                          secondary: 'black',
                        },
                      },
                    }}
                  />
                  
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/customer" element={<CustomerQueue />} />
                    <Route path="/customer/:businessCode" element={<CustomerQueue />} />
                    <Route path="/customer/:businessCode/:queueNumber" element={<CustomerQueue />} />
                    
                    {/* User Profile (Protected) */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Business Routes (Protected - Business Users Only) */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute roles={['business_owner', 'business_staff', 'admin']}>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/queue" 
                      element={
                        <ProtectedRoute roles={['business_owner', 'business_staff', 'admin']}>
                          <QueueControl />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/counters" 
                      element={
                        <ProtectedRoute roles={['business_owner', 'business_staff', 'admin']}>
                          <Counters />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute roles={['business_owner', 'business_staff', 'admin']}>
                          <Analytics />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/staff" 
                      element={
                        <ProtectedRoute roles={['business_owner', 'admin']}>
                          <Staff />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/business/settings" 
                      element={
                        <ProtectedRoute roles={['business_owner', 'admin']}>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* 404 Route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </Router>
            </QueueProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
      
      {/* React Query Devtools - Only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;