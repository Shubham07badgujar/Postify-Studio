import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

// Create Socket Context
const SocketContext = createContext();

// Socket Provider Component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const authContext = useAuth();
  
  // Safely destructure auth context
  const { user = null, isAuthenticated = false } = authContext || {};
  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id,
          role: user.role,
        },
        autoConnect: true,
        forceNew: true,
        transports: ['websocket', 'polling']
      });

      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        // Join user-specific room
        newSocket.emit('join-room', user.id);
        
        // If user is admin, join admin room
        if (user.role === 'admin') {
          newSocket.emit('join-room', 'admin');
        }
      });

      // Handle connection errors gracefully
      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection failed (backend may not be running):', error.message);
        // Don't show error toast during development when backend is not running
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // Listen for incoming messages
      newSocket.on('receive-message', (data) => {
        // Handle incoming chat messages
        handleIncomingMessage(data);
      });

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.info(notification.message);
      });

      // Listen for user status updates
      newSocket.on('user-online', (userId) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])]);
      });

      newSocket.on('user-offline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      // Handle reconnection
      newSocket.on('reconnect', () => {
        console.log('Socket reconnected successfully');
      });

      // Cleanup on unmount
      return () => {
        console.log('Cleaning up socket connection');
        newSocket.close();
      };
    } else {
      // Close socket if user is not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  // Handle incoming chat messages
  const handleIncomingMessage = (data) => {
    // This will be handled by individual chat components
    // We can emit a custom event or use a callback system
    const messageEvent = new CustomEvent('newChatMessage', {
      detail: data,
    });
    window.dispatchEvent(messageEvent);
  };

  // Send message function
  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('send-message', messageData);
    }
  };

  // Join chat room
  const joinChatRoom = (roomId) => {
    if (socket) {
      socket.emit('join-room', roomId);
    }
  };

  // Leave chat room
  const leaveChatRoom = (roomId) => {
    if (socket) {
      socket.emit('leave-room', roomId);
    }
  };

  // Send notification (admin only)
  const sendNotification = (notificationData) => {
    if (socket && user?.role === 'admin') {
      socket.emit('send-notification', notificationData);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const value = {
    socket,
    onlineUsers,
    notifications,
    sendMessage,
    joinChatRoom,
    leaveChatRoom,
    sendNotification,
    markNotificationAsRead,
    clearNotifications,
    getUnreadNotificationsCount,
    isConnected: socket?.connected || false,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
