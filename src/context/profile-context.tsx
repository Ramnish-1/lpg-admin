
"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AuthContext } from './auth-context';
import { User } from '@/lib/types';

interface Profile {
  name: string;
  photoUrl: string;
  email: string;
  phone: string;
}

interface ProfileContextType {
  profile: Profile;
  setProfile: (profile: Partial<Profile>) => void;
}

const defaultProfile: Profile = { 
  name: 'Admin', 
  photoUrl: 'https://picsum.photos/100',
  email: 'admin@gastrack.com',
  phone: '+91 99999 88888'
};

export const ProfileContext = createContext<ProfileContextType>({
  profile: defaultProfile,
  setProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [profile, setProfileState] = useState<Profile>(defaultProfile);

  useEffect(() => {
    if (isAuthenticated && user) {
       setProfileState({
         name: user.name || user.email.split('@')[0], // Use a default name if not provided
         email: user.email,
         phone: user.phone || '',
         photoUrl: `https://picsum.photos/seed/${user.id}/100`, // Use a consistent avatar
       });
    }
  }, [user, isAuthenticated]);


  const setProfile = (newProfileData: Partial<Profile>) => {
    if (!user) return;

    // This part of the logic would need to be replaced with an API call to update the user profile
    // on the backend. For now, we'll optimistically update the UI and local state.
    
    setProfileState(prevProfile => {
      const updatedProfile = { ...prevProfile, ...newProfileData };
      
      try {
        const authUser = JSON.parse(window.localStorage.getItem('gastrack-auth') || '{}');
        const updatedAuthUser = { ...authUser, ...newProfileData };
        window.localStorage.setItem('gastrack-auth', JSON.stringify(updatedAuthUser));
      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
      
      return updatedProfile;
    });
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
