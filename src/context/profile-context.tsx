
"use client";

import { createContext, useState, useEffect, ReactNode } from 'react';

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
  const [profile, setProfileState] = useState<Profile>(() => {
    if (typeof window === 'undefined') {
      return defaultProfile;
    }
    try {
      const savedProfile = window.localStorage.getItem('gastrack-profile');
      return savedProfile ? { ...defaultProfile, ...JSON.parse(savedProfile) } : defaultProfile;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return defaultProfile;
    }
  });

  const setProfile = (newProfileData: Partial<Profile>) => {
    setProfileState(prevProfile => {
      const updatedProfile = { ...prevProfile, ...newProfileData };
      try {
        window.localStorage.setItem('gastrack-profile', JSON.stringify(updatedProfile));
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
