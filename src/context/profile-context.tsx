"use client";

import { createContext, useState, ReactNode } from 'react';

interface Profile {
  name: string;
  photoUrl: string;
}

interface ProfileContextType {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

export const ProfileContext = createContext<ProfileContextType>({
  profile: { name: 'Admin', photoUrl: 'https://picsum.photos/100' },
  setProfile: () => {},
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>({
    name: 'Admin',
    photoUrl: 'https://picsum.photos/100',
  });

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
