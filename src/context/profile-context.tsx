

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
  agencyId?: string;
  agencyStatus?: 'active' | 'inactive';
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
  role: 'admin' // Default to admin for initial state
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
        if (!response.ok) {
            handleApiError(response);
            return;
        }
        const result = await response.json();
        if (result.success) {
          const userData = result.data.user;
          setProfileState({
            name: userData.name || '',
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role || 'User',
            photoUrl: userData.profileImage || '',
            agencyId: userData.agencyId,
            agencyStatus: userData.agencyStatus,
          });
        } else {
            // If API call is successful but backend says no, use default but mark as not fetching
            setProfileState(defaultProfile);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setProfileState(defaultProfile);
      } finally {
        setIsFetchingProfile(false);
      }
    } else if (!isAuthenticated) {
      setProfileState(defaultProfile);
      setIsFetchingProfile(false);
    }
  }, [isAuthenticated, token, handleApiError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const setProfile = async (newProfileData: ProfileUpdatePayload): Promise<boolean> => {
    if (!token) return false;
    
    // Handle agency status update separately
    if (newProfileData.agencyStatus && profile.agencyId) {
       try {
         const response = await fetch(`${API_BASE_URL}/api/agencies/${profile.agencyId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ status: newProfileData.agencyStatus })
        });
         if (!response.ok) {
            handleApiError(response);
            return false;
        }
        const result = await response.json();
        if (result.success) {
            // Refetch profile to get the latest state including the updated status
            await fetchProfile();
            return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to update agency status", error);
        return false;
      }
    }


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
        if (!response.ok) {
            handleApiError(response);
            return false;
        }
        const result = await response.json();
        
        if (result.success) {
            await fetchProfile(); // Refetch to ensure all data is up-to-date
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
