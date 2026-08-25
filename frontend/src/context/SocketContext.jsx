import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('⚡ [Socket] Connected to real-time server:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 [Socket] Disconnected from server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Helper to join ticket chat room
  const joinTicketRoom = (ticketId) => {
    if (socket && ticketId) {
      socket.emit('join_ticket', ticketId);
    }
  };

  // Helper to leave ticket chat room
  const leaveTicketRoom = (ticketId) => {
    if (socket && ticketId) {
      socket.emit('leave_ticket', ticketId);
    }
  };

  // Helper to emit typing state
  const sendTypingStatus = (ticketId, isTyping) => {
    if (socket && user) {
      socket.emit('typing', {
        ticketId,
        user: { name: user.name, role: user.role },
        isTyping,
      });
    }
  };

  // Helper to emit new message
  const broadcastMessage = (messageData) => {
    if (socket) {
      socket.emit('send_chat_message', messageData);
    }
  };

  // Helper to broadcast status changes
  const broadcastStatusChange = (statusData) => {
    if (socket) {
      socket.emit('complaint_status_changed', statusData);
    }
  };

  const value = {
    socket,
    connected,
    joinTicketRoom,
    leaveTicketRoom,
    sendTypingStatus,
    broadcastMessage,
    broadcastStatusChange,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
