import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, business, token } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      
      // Join appropriate rooms
      if (business?.id) {
        newSocket.emit('join-business', business.id);
        console.log('Joined business room:', business.id);
      }
      
      if (user?.id) {
        newSocket.emit('join-customer', user.id);
        console.log('Joined customer room:', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Queue update events
    newSocket.on('queue-updated', (data) => {
      console.log('Queue updated:', data);
      // Show toast notification based on update type
      if (data.type === 'customer_called') {
        toast.success(`Customer ${data.queue.queueNumber} called to counter`);
      } else if (data.type === 'customer_completed') {
        toast.success(`Customer ${data.queue.queueNumber} service completed`);
      }
    });

    // Counter update events
    newSocket.on('counter-updated', (data) => {
      console.log('Counter updated:', data);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token, user, business]);

  // Emit queue update
  const emitQueueUpdate = (data) => {
    if (socket && connected) {
      socket.emit('queue-update', data);
    }
  };

  // Emit counter update
  const emitCounterUpdate = (data) => {
    if (socket && connected) {
      socket.emit('counter-update', data);
    }
  };

  // Listen to specific event
  const subscribe = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
  };

  // Unsubscribe from event
  const unsubscribe = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emitQueueUpdate,
    emitCounterUpdate,
    subscribe,
    unsubscribe
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};