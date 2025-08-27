"use client";

import { createContext, useState, useEffect, ReactNode } from 'react';

interface Profile {
  name: string;
  photoUrl: string;
}

interface ProfileContextType {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

const defaultProfile: Profile = { name: 'Admin', photoUrl: 'https://picsum.photos/100' };

export const ProfileContext = createContext<ProfileContextType>({
  profile: defaultProfile,
  setProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() => {
    if (typeof window === 'undefined') {
      return defaultProfile;
    }
    try {
      const savedProfile = window.localStorage.getItem('gastrack-profile');
      return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return defaultProfile;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('gastrack-profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [profile]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
