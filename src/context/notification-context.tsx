
"use client";

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { AuthContext } from './auth-context';
import type { Notification, Order } from '@/lib/types';
import { io, Socket } from 'socket.io-client';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (orderId: string) => void;
  socket: Socket | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {},
  socket: null,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(API_BASE_URL, {
        query: { token }
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('newOrder', (order: Order) => {
        addNotification({
          message: `New order #${order.orderNumber.slice(-8)} from ${order.customerName}`,
          orderId: order.id,
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
       if (socket) {
           socket.disconnect();
           setSocket(null);
       }
    }
  }, [isAuthenticated, token]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep last 10
  }, []);

  const markAsRead = useCallback((orderId: string) => {
    setNotifications(prev => 
        prev.map(n => n.orderId === orderId ? { ...n, read: true } : n)
    );
  }, []);
  

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, socket }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
