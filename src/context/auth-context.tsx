
"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import type { User } from '@/lib/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  signup: (name: string, email: string, password: string) => boolean;
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

  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth) {
        setUser(storedAuth);
        setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const users = getStoredUsers();
    // In a real app, you would also check the hashed password.
    const foundUser = users.find(u => u.email === email);

    if (foundUser) {
        // This is a mock authentication. In a real app, passwords would be hashed.
        // For simplicity, we just check if the user exists.
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
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  const signup = (name: string, email: string, password: string): boolean => {
    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
        return false; // User already exists
    }

    const newUser: User = {
        id: `usr_${Date.now()}`,
        name,
        email,
        // password should be hashed in a real app
        phone: '',
        address: '',
        status: 'Active',
        orderHistory: [],
        createdAt: new Date(),
        location: { lat: 0, lng: 0 }
    };

    const updatedUsers = [...users, newUser];
    window.localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
    // Also save this new user to the main user list for the Users page
     window.localStorage.setItem('gastrack-users', JSON.stringify(updatedUsers));

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
