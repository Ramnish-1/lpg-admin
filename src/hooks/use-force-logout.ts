'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socket-context';
import { useToast } from '@/hooks/use-toast';
import socketService, { SocketEventData } from '@/lib/socket';

interface ForceLogoutHook {
  isListening: boolean;
}

export const useForceLogout = (): ForceLogoutHook => {
  const { isConnected } = useSocket();
  const { toast } = useToast();
  const router = useRouter();

  const handleForceLogout = useCallback((data: SocketEventData) => {
    const { type, message } = data.data;
    
    console.log('🚨 Force logout triggered:', { type, message });
    
    // Show alert to user
    toast({
      title: "Session Terminated",
      description: message || "Your session has been terminated by an administrator",
      variant: "destructive",
      duration: 6000,
    });
    
    // Clear all authentication data
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('agencyId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      
      // Clear sessionStorage
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('agencyId');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      
      // Clear any other app-specific storage
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // Disconnect socket
    socketService.disconnect();
    
    // Redirect to login page after a short delay
    setTimeout(() => {
      router.push('/login');
      
      // Force page reload to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 2000);
    
  }, [toast, router]);

  // Setup force logout listeners
  useEffect(() => {
    if (!isConnected) return;

    console.log('🔒 Setting up force logout listeners');

    // Listen for user force logout (account blocked/suspended)
    socketService.onForceLogout(handleForceLogout);

    // Cleanup on unmount
    return () => {
      console.log('🔓 Cleaning up force logout listeners');
      socketService.offForceLogout(handleForceLogout);
    };
  }, [isConnected, handleForceLogout]);

  return {
    isListening: isConnected,
  };
};
