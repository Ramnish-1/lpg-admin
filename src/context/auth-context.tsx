
"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { User } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  signup: (name: string, email: string, password: string, phone: string) => boolean;
}

const AUTH_STORAGE_KEY = 'gastrack-auth';
const USERS_DB_KEY = 'gastrack-users-db';


export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: () => {},
  signup: () => false,
});

const getStoredUsers = (): User[] => {
    if (typeof window === 'undefined') return [];
    try {
        const users = window.localStorage.getItem(USERS_DB_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        return [];
    }
}
const getStoredAuth = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
        const auth = window.localStorage.getItem(AUTH_STORAGE_KEY);
        return auth ? JSON.parse(auth) : null;
    } catch (error) {
        return null;
    }
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedAuth = getStoredAuth();
      if (storedAuth) {
          setUser(storedAuth);
          setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
  }, [isClient]);

  const login = (email: string, password: string): boolean => {
    const users = getStoredUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (foundUser) {
        setUser(foundUser);
        setIsAuthenticated(true);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
        return true;
    }
    return false;
  }

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      const keysToRemove = [AUTH_STORAGE_KEY, 'gastrack-profile', 'gastrack-settings', 'gastrack-agents', 'gastrack-orders', 'gastrack-products', 'gastrack-customers'];
      keysToRemove.forEach(key => {
        window.localStorage.removeItem(key);
      });
      window.localStorage.removeItem(USERS_DB_KEY); // Also clear the user DB for consistency
      window.location.href = '/login';
    }
  }

  const signup = (name: string, email: string, password: string, phone: string): boolean => {
    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
        return false; // User already exists
    }

    const newUser: User = {
        id: `usr_${Date.now()}`,
        name,
        email,
        password, // In a real app, this would be hashed
        phone: phone,
        address: '',
        status: 'Active',
        orderHistory: [],
        createdAt: new Date(),
        location: { lat: 0, lng: 0 }
    };

    const updatedUsers = [...users, newUser];
    window.localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
    // Also save this new user to the main user list for the Customers page
     window.localStorage.setItem('gastrack-customers', JSON.stringify(updatedUsers));

    return true;
  }
  
  if (isLoading) {
    return null; // Or a loading screen
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
