'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import socketService, { SocketEventData } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token?: string) => void;
  disconnect: () => void;
  subscribeToOrders: () => void;
  subscribeToProducts: () => void;
  subscribeToAgencies: () => void;
  subscribeToAgents: () => void;
  subscribeToInventory: (agencyId: string) => void;
  emit: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { toast } = useToast();

  const connect = useCallback((token?: string) => {
    try {
      const socketInstance = socketService.connect(token);
      if (socketInstance) {
        setSocket(socketInstance);

        // Setup connection event listeners
        socketInstance.on('connect', () => {
          setIsConnected(true);
          console.log('✅ Socket connected in context');
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('❌ Socket disconnected in context:', reason);
          // Only set to false if it's a real disconnect, not a reconnection attempt
          if (reason === 'io server disconnect' || reason === 'io client disconnect') {
            setIsConnected(false);
          }
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error in context:', error);
          setIsConnected(false);
        });

        socketInstance.on('reconnect', () => {
          setIsConnected(true);
          console.log('🔄 Socket reconnected in context');
        });

        // Setup global event listeners
        setupGlobalEventListeners(socketInstance);
      }
    } catch (error) {
      console.error('Failed to connect socket:', error);
      toast({
        title: "Connection Error",
        description: "Failed to establish real-time connection",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  const setupGlobalEventListeners = useCallback((socketInstance: Socket) => {
    // System Messages
    socketInstance.on('system:message', (data: SocketEventData) => {
      const { message, messageType = 'info' } = data.data;
      toast({
        title: "System Message",
        description: message,
        variant: messageType === 'error' ? 'destructive' : 'default',
      });
    });

    // Generic Notifications
    socketInstance.on('notification', (data: SocketEventData) => {
      const { type, message } = data.data;
      
      switch (type) {
        case 'USER_LOGGED_IN':
          console.log('User logged in:', data.data);
          break;
        case 'USER_BLOCK_STATUS_CHANGED':
          toast({
            title: "Account Status Changed",
            description: message || "Your account status has been updated",
            variant: data.data.isBlocked ? 'destructive' : 'default',
          });
          break;
        case 'CUSTOM_NOTIFICATION':
          toast({
            title: "Notification",
            description: message || "You have a new notification",
          });
          break;
        default:
          console.log('Generic notification:', data);
      }
    });

    // Force Logout Events
    socketInstance.on('user:force-logout', (data: SocketEventData) => {
      handleForceLogout(data);
    });

    socketInstance.on('agency:force-logout', (data: SocketEventData) => {
      handleForceLogout(data);
    });

  }, [toast]);

  const handleForceLogout = useCallback((data: SocketEventData) => {
    const { type, message } = data.data;
    
    toast({
      title: "Account Access Revoked",
      description: message || "Your session has been terminated",
      variant: "destructive",
      duration: 6000,
    });

    // Clear all storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, [toast]);

  // Auto-connect on mount if token exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
      console.log('🔍 Socket Context - Checking for auth token:', token ? 'Found' : 'Not found');
      console.log('🔍 Socket Context - User role:', userRole || 'Not found');
      
      // Connect with token if available
      if (!socket) {
        console.log('🚀 Socket Context - Auto-connecting socket...');
        connect(token || undefined);
      } else {
        console.log('🔍 Socket Context - Socket already exists:', socket.connected);
      }
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log('🧹 Socket Context - Cleaning up socket listeners');
        socket.removeAllListeners();
      }
    };
  }, [connect, socket]);

  // Manual subscription methods
  const subscribeToOrders = useCallback(() => {
    socketService.subscribeToOrders();
  }, []);

  const subscribeToProducts = useCallback(() => {
    socketService.subscribeToProducts();
  }, []);

  const subscribeToAgencies = useCallback(() => {
    socketService.subscribeToAgencies();
  }, []);

  const subscribeToAgents = useCallback(() => {
    socketService.subscribeToAgents();
  }, []);

  const subscribeToInventory = useCallback((agencyId: string) => {
    socketService.subscribeToInventory(agencyId);
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
    subscribeToOrders,
    subscribeToProducts,
    subscribeToAgencies,
    subscribeToAgents,
    subscribeToInventory,
    emit,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
