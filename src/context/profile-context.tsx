
"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AuthContext } from './auth-context';
import { User } from '@/lib/types';
import { updateLocalStorage } from '@/lib/data';

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

const USERS_DB_KEY = 'gastrack-users-db';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [profile, setProfileState] = useState<Profile>(defaultProfile);

  useEffect(() => {
    if (isAuthenticated && user) {
       setProfileState({
         name: user.name || '',
         email: user.email || '',
         phone: user.phone || '',
         photoUrl: `https://picsum.photos/seed/${user.id}/100`, // Use a consistent avatar
       });
    }
  }, [user, isAuthenticated]);


  const setProfile = (newProfileData: Partial<Profile>) => {
    if (!user) return;

    setProfileState(prevProfile => {
      const updatedProfile = { ...prevProfile, ...newProfileData };
      
      // Also update the user in the main users list
      try {
        const storedUsers = JSON.parse(window.localStorage.getItem(USERS_DB_KEY) || '[]');
        const updatedUsers = storedUsers.map((u: User) => 
            u.id === user.id ? { ...u, ...newProfileData } : u
        );
        window.localStorage.setItem(USERS_DB_KEY, JSON.stringify(updatedUsers));
        
        // Also update the main 'gastrack-users' if it exists
         const mainUsers = JSON.parse(window.localStorage.getItem('gastrack-users') || '[]');
         const updatedMainUsers = mainUsers.map((u: User) => 
            u.id === user.id ? { ...u, ...newProfileData } : u
         );
         window.localStorage.setItem('gastrack-users', JSON.stringify(updatedMainUsers));


        // Update the auth storage as well so it's consistent on next load
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
