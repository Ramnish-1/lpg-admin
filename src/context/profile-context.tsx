
"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AuthContext } from './auth-context';
import { User } from '@/lib/types';

interface Profile extends Omit<User, 'id' | 'createdAt' | 'orderHistory' | 'location' | 'address' | 'status'> {
  name: string;
  email: string;
  phone: string;
  role?: string;
  photoUrl: string;
}

interface ProfileUpdatePayload extends Partial<Omit<Profile, 'photoUrl'>> {
  photoFile?: File;
}

interface ProfileContextType {
  profile: Profile;
  setProfile: (profile: ProfileUpdatePayload) => Promise<boolean>;
  isFetchingProfile: boolean;
}

const defaultProfile: Profile = { 
  name: 'Admin', 
  photoUrl: 'https://picsum.photos/100',
  email: 'admin@gastrack.com',
  phone: '+91 99999 88888',
  role: 'Administrator'
};

export const ProfileContext = createContext<ProfileContextType>({
  profile: defaultProfile,
  setProfile: async () => false,
  isFetchingProfile: true,
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [profile, setProfileState] = useState<Profile>(defaultProfile);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && token) {
        setIsFetchingProfile(true);
        try {
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const result = await response.json();
          if (result.success) {
            const userData = result.data.user;
            setProfileState({
              name: userData.name || '',
              email: userData.email,
              phone: userData.phone || '',
              role: userData.role || 'User',
              photoUrl: userData.profileImage || `https://picsum.photos/seed/${userData.id}/100`,
            });
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        } finally {
          setIsFetchingProfile(false);
        }
      } else {
        setIsFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, token]);

  const setProfile = async (newProfileData: ProfileUpdatePayload): Promise<boolean> => {
    if (!token) return false;
    
    const formData = new FormData();
    if(newProfileData.name) formData.append('name', newProfileData.name);
    if(newProfileData.email) formData.append('email', newProfileData.email);
    if(newProfileData.phone) formData.append('phone', newProfileData.phone);
    if(newProfileData.photoFile) formData.append('image', newProfileData.photoFile);

    try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // No 'Content-Type' header, the browser will set it to 'multipart/form-data'
            },
            body: formData
        });
        const result = await response.json();
        
        if (result.success) {
            const userData = result.data.user;
             setProfileState({
              name: userData.name || '',
              email: userData.email,
              phone: userData.phone || '',
              role: userData.role || 'User',
              photoUrl: userData.profileImage || `https://picsum.photos/seed/${userData.id}/100`,
            });
            // Also update the auth context user data if needed, to keep them in sync
             try {
                const authUser = JSON.parse(window.localStorage.getItem('gastrack-auth') || '{}');
                const updatedAuthUser = { ...authUser, name: userData.name, email: userData.email, phone: userData.phone };
                window.localStorage.setItem('gastrack-auth', JSON.stringify(updatedAuthUser));
              } catch (error) {
                console.error('Error writing to localStorage', error);
              }
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
