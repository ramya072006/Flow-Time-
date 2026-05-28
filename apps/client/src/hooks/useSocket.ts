import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || initialized.current) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    socketInstance = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketInstance.on('notification:new', (notification) => {
      addNotification(notification);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    initialized.current = true;

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
      initialized.current = false;
    };
  }, [isAuthenticated, accessToken]);

  return socketInstance;
};

export const getSocket = () => socketInstance;
