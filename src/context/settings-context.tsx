'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { FolderConfig } from '@/lib/types';
import { folderConfig as initialFolderConfig } from '@/lib/folder-config';

interface TimeRange {
  start: number;
  end: number;
}

interface Settings {
  timeCheckEnabled: boolean;
  timeRanges: Record<string, TimeRange>;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  getInitialTimeRange: (id: string) => TimeRange | undefined;
}

const defaultTimeRanges: Record<string, TimeRange> = {
    'titlow-park-ruston-pics': { start: 15, end: 16 },
    'airport-pics': { start: 9, end: 13 },
    'arriving-sign-pics': { start: 8, end: 9 },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'folder-finder-settings';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    timeCheckEnabled: true,
    timeRanges: defaultTimeRanges,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Merge stored settings with defaults to ensure all keys are present
        const mergedTimeRanges = { ...defaultTimeRanges, ...parsedSettings.timeRanges };
        setSettings({ ...parsedSettings, timeRanges: mergedTimeRanges });
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
    setIsInitialized(true);
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save settings to localStorage", error);
      }
      return updated;
    });
  };

  const getInitialTimeRange = (id: string) => {
    return defaultTimeRanges[id];
  }

  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getInitialTimeRange }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
