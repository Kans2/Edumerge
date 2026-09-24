import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join', user._id);
      });

      newSocket.on('new_notification', (notification) => {
        toast.success(notification.message, {
          icon: '🔔',
          duration: 4000,
        });
        
        // Dispatch custom event so Notifications component can update badge
        window.dispatchEvent(new CustomEvent('new_notification', { detail: notification }));
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
