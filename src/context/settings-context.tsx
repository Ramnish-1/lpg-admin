
"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Settings {
  appName: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
  saveSettings: () => void;
  tempSettings: Settings;
  setTempSettings: (settings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  appName: 'GasTrack Admin',
  timezone: 'Asia/Kolkata',
  emailNotifications: true,
  pushNotifications: false,
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
  saveSettings: () => {},
  tempSettings: defaultSettings,
  setTempSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => {
    if (typeof window === 'undefined') {
      return defaultSettings;
    }
    try {
      const savedSettings = window.localStorage.getItem('gastrack-settings');
      return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    } catch (error) {
      console.error('Error reading settings from localStorage', error);
      return defaultSettings;
    }
  });
  
  const [tempSettings, setTempSettingsState] = useState<Settings>(settings);
  const { toast } = useToast();

  useEffect(() => {
    setTempSettingsState(settings);
  }, [settings]);

  const setSettings = (newSettingsData: Partial<Settings>) => {
    setSettingsState(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettingsData };
      try {
        window.localStorage.setItem('gastrack-settings', JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Error writing settings to localStorage', error);
      }
      return updatedSettings;
    });
  }

  const setTempSettings = (newTempSettings: Partial<Settings>) => {
    setTempSettingsState(prev => ({...prev, ...newTempSettings}));
  }

  const saveSettings = () => {
    setSettings(tempSettings);
    toast({
      title: 'Settings Saved',
      description: 'Your new settings have been applied.',
    });
  }

  return (
    <SettingsContext.Provider value={{ settings, setSettings, tempSettings, setTempSettings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
