
"use client";

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { AuthContext, useAuth } from './auth-context';
import { User } from '@/lib/types';

interface Profile {
  name: string;
  email: string;
  phone: string;
  role?: string;
  photoUrl: string;
}

interface ProfileUpdatePayload extends Partial<Omit<Profile, 'photoUrl' | 'email'>> {
  photoFile?: File;
}

interface ProfileContextType {
  profile: Profile;
  setProfile: (profile: ProfileUpdatePayload) => Promise<boolean>;
  isFetchingProfile: boolean;
}

const defaultProfile: Profile = { 
  name: 'Admin', 
  photoUrl: '',
  email: 'admin@gastrack.com',
  phone: '+91 99999 88888',
  role: 'Administrator'
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ProfileContext = createContext<ProfileContextType>({
  profile: defaultProfile,
  setProfile: async () => false,
  isFetchingProfile: true,
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useContext(AuthContext);
  const { handleApiError } = useAuth();
  const [profile, setProfileState] = useState<Profile>(defaultProfile);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (isAuthenticated && token) {
      setIsFetchingProfile(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        if (result.success) {
          const userData = result.data.user;
          setProfileState({
            name: userData.name || '',
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role || 'User',
            photoUrl: userData.profileImage || '',
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsFetchingProfile(false);
      }
    } else {
      setProfileState(defaultProfile);
      setIsFetchingProfile(false);
    }
  }, [isAuthenticated, token, handleApiError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const setProfile = async (newProfileData: ProfileUpdatePayload): Promise<boolean> => {
    if (!token) return false;
    
    const formData = new FormData();
    if(newProfileData.name) formData.append('name', newProfileData.name);
    if(newProfileData.phone) formData.append('phone', newProfileData.phone);
    if(newProfileData.role) formData.append('role', newProfileData.role);
    if(newProfileData.photoFile) formData.append('image', newProfileData.photoFile);

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: formData
        });
        if (!response.ok) handleApiError(response);
        const result = await response.json();
        
        if (result.success) {
            const userData = result.data.user;
            setProfileState({
                name: userData.name || '',
                email: userData.email,
                phone: userData.phone || '',
                role: userData.role || 'User',
                photoUrl: userData.profileImage || '',
            });
            return true;
        }
        return false;
    } catch(error) {
        console.error("Failed to update profile", error);
        return false;
    }
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile, isFetchingProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
