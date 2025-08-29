
"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { User } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
}

const AUTH_STORAGE_KEY = 'gastrack-auth';
const TOKEN_STORAGE_KEY = 'gastrack-token';


export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  signup: async () => false,
});

const getStoredAuth = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
        const auth = window.localStorage.getItem(AUTH_STORAGE_KEY);
        return auth ? JSON.parse(auth) : null;
    } catch (error) {
        return null;
    }
}

const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedAuth = getStoredAuth();
      const storedToken = getStoredToken();
      if (storedAuth && storedToken) {
          setUser(storedAuth);
          setToken(storedToken);
          setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
  }, [isClient]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        
        const result = await response.json();

        if (result.success) {
            const loggedInUser = {
                ...result.data.user,
                name: result.data.user.name || result.data.user.email.split('@')[0], // Add default name if not present
                phone: result.data.user.phone || '',
            };

            setUser(loggedInUser);
            setToken(result.data.token);
            setIsAuthenticated(true);
            window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
            window.localStorage.setItem(TOKEN_STORAGE_KEY, result.data.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Login API call failed", error);
        return false;
    }
  }

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      const keysToRemove = [AUTH_STORAGE_KEY, TOKEN_STORAGE_KEY, 'gastrack-profile', 'gastrack-settings', 'gastrack-agents', 'gastrack-orders', 'gastrack-products', 'gastrack-customers', 'gastrack-users-db'];
      keysToRemove.forEach(key => {
        window.localStorage.removeItem(key);
      });
      window.location.href = '/login';
    }
  }

  const signup = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone }),
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error("Signup API call failed", error);
        return false;
    }
  }
  
  if (isLoading) {
    return null; // Or a loading screen
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
