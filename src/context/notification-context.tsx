
"use client";

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { AuthContext, useAuth } from './auth-context';
import type { Notification, Order } from '@/lib/types';
import { io, Socket } from 'socket.io-client';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (orderId: string) => void;
  markAsRead: (orderId: string) => void;
  socket: Socket | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  markAsRead: () => {},
  socket: null,
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, handleApiError } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchPendingOrders = useCallback(async () => {
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders?status=pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            handleApiError(response);
            return;
        };
        const result = await response.json();
        if (result.success) {
          const pendingOrders: Order[] = result.data.orders;
          const pendingNotifications: Notification[] = pendingOrders.map(order => ({
            id: order.id,
            message: `Order #${order.orderNumber.slice(-8)} from ${order.customerName}`,
            orderId: order.id,
            timestamp: new Date(order.createdAt),
            read: false,
          }));
          setNotifications(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newNotifs = pendingNotifications.filter(n => !existingIds.has(n.id));
            return [...prev, ...newNotifs].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
          });
        }
      } catch (error) {
        console.error("Failed to fetch pending orders", error);
      }
    }
  }, [isAuthenticated, token, handleApiError]);


  useEffect(() => {
    fetchPendingOrders();
  
    if (isAuthenticated && token) {
      const newSocket = io(API_BASE_URL, {
        query: { token }
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('newOrder', (order: Order) => {
         toast({
            title: "New Order Received!",
            description: `Order #${order.orderNumber.slice(-8)} from ${order.customerName}.`
        });
        addNotification({
          message: `Order #${order.orderNumber.slice(-8)} from ${order.customerName}`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: notification.orderId, // Use orderId as notification id
      timestamp: new Date(),
      read: false,
    };
     setNotifications(prev => [newNotification, ...prev.filter(n => n.id !== newNotification.id)].slice(0, 20));
  }, []);

  const removeNotification = useCallback((orderId: string) => {
    setNotifications(prev => prev.filter(n => n.orderId !== orderId));
  }, []);

  const markAsRead = useCallback((orderId: string) => {
    setNotifications(prev => 
        prev.map(n => n.orderId === orderId ? { ...n, read: true } : n)
    );
  }, []);
  

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, markAsRead, socket }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
