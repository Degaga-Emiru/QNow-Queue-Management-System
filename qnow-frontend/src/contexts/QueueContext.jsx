import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { queueAPI } from '../api/queue';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

const QueueContext = createContext();

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};

export const QueueProvider = ({ children }) => {
  const [currentQueue, setCurrentQueue] = useState([]);
  const [queueStats, setQueueStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refetchInterval, setRefetchInterval] = useState(null);
  const { business } = useAuth();
  const { socket, connected, subscribe } = useSocket();

  // Fetch current queue
  const fetchCurrentQueue = useCallback(async () => {
    if (!business?.id) return;
    
    try {
      setLoading(true);
      const response = await queueAPI.getCurrentQueue();
      setCurrentQueue(response.queue || []);
      setQueueStats(response.stats || {});
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  // Initial fetch
  useEffect(() => {
    if (business?.id) {
      fetchCurrentQueue();
    }
  }, [business?.id, fetchCurrentQueue]);

  // Setup socket subscriptions
  useEffect(() => {
    if (!connected || !socket) return;

    const unsubscribe = subscribe('queue-updated', (data) => {
      console.log('Queue updated via socket:', data);
      
      // Update queue based on event type
      switch (data.type) {
        case 'customer_called':
          setCurrentQueue(prev => prev.map(q => 
            q.id === data.queue.id ? { ...q, status: 'called', counterId: data.counter.id } : q
          ));
          break;
          
        case 'customer_serving':
          setCurrentQueue(prev => prev.map(q => 
            q.id === data.queue.id ? { ...q, status: 'serving' } : q
          ));
          break;
          
        case 'customer_completed':
          setCurrentQueue(prev => prev.filter(q => q.id !== data.queue.id));
          break;
          
        case 'customer_skipped':
          setCurrentQueue(prev => prev.filter(q => q.id !== data.queue.id));
          break;
          
        case 'queue_transferred':
          setCurrentQueue(prev => prev.map(q => 
            q.id === data.queue.id ? { ...q, counterId: data.toCounterId } : q
          ));
          break;
          
        default:
          // Refresh queue for other updates
          fetchCurrentQueue();
      }
    });

    return unsubscribe;
  }, [connected, socket, subscribe, fetchCurrentQueue]);

  // Call next customer
  const callNextCustomer = async (counterData) => {
    try {
      const response = await queueAPI.callNextCustomer(counterData);
      toast.success(`Called customer ${response.customer.queueNumber}`);
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to call next customer');
      throw error;
    }
  };

  // Start serving customer
  const startServing = async (queueId) => {
    try {
      const response = await queueAPI.startServing(queueId);
      toast.success(`Started serving customer ${response.queue.queueNumber}`);
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to start service');
      throw error;
    }
  };

  // Complete service
  const completeService = async (queueId) => {
    try {
      const response = await queueAPI.completeService(queueId);
      toast.success(`Completed service for customer ${response.queue.queueNumber}`);
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to complete service');
      throw error;
    }
  };

  // Skip customer
  const skipCustomer = async (queueId, reason) => {
    try {
      const response = await queueAPI.skipCustomer(queueId, reason);
      toast.success(`Skipped customer ${response.queue.queueNumber}`);
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to skip customer');
      throw error;
    }
  };

  // Transfer queue
  const transferQueue = async (transferData) => {
    try {
      const response = await queueAPI.transferQueue(transferData);
      toast.success(`Transferred queue to counter ${response.toCounter.name}`);
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to transfer queue');
      throw error;
    }
  };

  // Join queue as customer
  const joinQueue = async (queueData) => {
    try {
      const response = await queueAPI.joinQueue(queueData);
      toast.success(`Joined queue successfully. Your number: ${response.queue.queueNumber}`);
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to join queue');
      throw error;
    }
  };

  // Get queue status
  const getQueueStatus = async (businessCode, queueNumber) => {
    try {
      const response = await queueAPI.getQueueStatus(businessCode, queueNumber);
      return response;
    } catch (error) {
      toast.error(error?.message || 'Failed to get queue status');
      throw error;
    }
  };

  // Start auto-refresh
  const startAutoRefresh = (interval = 30000) => {
    if (refetchInterval) clearInterval(refetchInterval);
    const intervalId = setInterval(fetchCurrentQueue, interval);
    setRefetchInterval(intervalId);
  };

  // Stop auto-refresh
  const stopAutoRefresh = () => {
    if (refetchInterval) {
      clearInterval(refetchInterval);
      setRefetchInterval(null);
    }
  };

  const value = {
    currentQueue,
    queueStats,
    loading,
    fetchCurrentQueue,
    callNextCustomer,
    startServing,
    completeService,
    skipCustomer,
    transferQueue,
    joinQueue,
    getQueueStatus,
    startAutoRefresh,
    stopAutoRefresh
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
};