
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
  joinRoom: (room: string, data?: any) => void;
  leaveRoom: (room: string, data?: any) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  markAsRead: () => {},
  socket: null,
  joinRoom: () => {},
  leaveRoom: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, handleApiError } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        extraHeaders: {
            'ngrok-skip-browser-warning': 'true'
        }
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket connected');
        
        // Subscribe to events based on user role
        const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
        const agencyId = localStorage.getItem('agencyId') || sessionStorage.getItem('agencyId');
        
        console.log('🔔 Notification socket - User role:', userRole);
        
        switch (userRole) {
          case 'admin':
            newSocket.emit('subscribe-orders');
            newSocket.emit('subscribe-products');
            newSocket.emit('subscribe-agencies');
            newSocket.emit('subscribe-agents');
            console.log('🔔 Admin subscribed to all events via notification socket');
            break;

          case 'agency_owner':
            newSocket.emit('subscribe-orders');
            if (agencyId) {
              newSocket.emit('subscribe-inventory', agencyId);
            }
            console.log('🔔 Agency owner subscribed to orders and inventory via notification socket');
            break;

          case 'customer':
            newSocket.emit('subscribe-orders');
            console.log('🔔 Customer subscribed to orders via notification socket');
            break;

          case 'agent':
            newSocket.emit('subscribe-orders');
            console.log('🔔 Agent subscribed to orders via notification socket');
            break;

          default:
            console.log('🔔 No specific subscriptions for role:', userRole);
        }
      });

      // New socket events
      newSocket.on('order:created', (data: { data: Order }) => {
         toast({
            title: "New Order Received!",
            description: `Order #${data.data.orderNumber.slice(-8)} from ${data.data.customerName}.`
        });
        addNotification({
          message: `Order #${data.data.orderNumber.slice(-8)} from ${data.data.customerName}`,
          orderId: data.data.id,
        });
      });

      newSocket.on('order:status-updated', (data: { data: Order }) => {
         toast({
            title: "Order Status Updated",
            description: `Order #${data.data.orderNumber.slice(-8)} is now ${data.data.status}`
        });
      });

      newSocket.on('agent:status-updated', (data: { data: any }) => {
         toast({
            title: "Agent Status Updated",
            description: `${data.data.name} is now ${data.data.status}`
        });
      });

      // Legacy events (for backward compatibility)
      newSocket.on('order_created', (data: { data: Order }) => {
         toast({
            title: "New Order Received!",
            description: `Order #${data.data.orderNumber.slice(-8)} from ${data.data.customerName}.`
        });
        addNotification({
          message: `Order #${data.data.orderNumber.slice(-8)} from ${data.data.customerName}`,
          orderId: data.data.id,
        });
      });
      
      newSocket.on('system_notification', (data) => {
        toast({
            title: data.data.title || "System Notification",
            description: data.data.message
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      newSocket.on('error_occurred', (data) => {
         toast({
            variant: 'destructive',
            title: data.data.title || "An Error Occurred",
            description: data.data.message
        });
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
  
  const joinRoom = useCallback((room: string, data?: any) => {
    socket?.emit(room, data);
  }, [socket]);

  const leaveRoom = useCallback((room: string, data?: any) => {
    socket?.emit(room, data);
  }, [socket]);
  

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, markAsRead, socket, joinRoom, leaveRoom }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
