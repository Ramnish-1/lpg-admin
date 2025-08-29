
"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { User } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
}

const TOKEN_STORAGE_KEY = 'gastrack-token';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => false,
  logout: async () => {},
  signup: async () => false,
});

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
      const storedToken = getStoredToken();
      if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
  }, [isClient]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        
        const result = await response.json();

        if (result.success) {
            const loggedInUser: User = result.data.user;

            setUser(loggedInUser);
            setToken(result.data.token);
            setIsAuthenticated(true);
            window.localStorage.setItem(TOKEN_STORAGE_KEY, result.data.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Login API call failed", error);
        return false;
    }
  }

  const logout = async (): Promise<void> => {
    const currentToken = getStoredToken();
    if (currentToken) {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
            });
        } catch (error) {
            console.error("Logout API call failed", error);
        }
    }

    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('gastrack-') && key !== 'gastrack-settings') {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        window.location.href = '/login';
    }
  }

  const signup = async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
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
