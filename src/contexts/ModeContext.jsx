import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { storeService } from '@/modules/settings/storeService';
import { storeSettingsFallback } from '@/modules/shared/constants/storeDefaults';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  const [settings, setSettings] = useState(storeSettingsFallback);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const nextSettings = await storeService.getSettings();
      setSettings(nextSettings);
    } catch (error) {
      setSettings(storeSettingsFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = useCallback(async (updates) => {
    const previousSettings = settings;
    const optimistic = { ...settings, ...updates };
    setSettings(optimistic);

    try {
      const savedSettings = await storeService.saveSettings(optimistic);
      setSettings(savedSettings);
      return savedSettings;
    } catch (error) {
      setSettings(previousSettings);
      toast({
        title: 'Unable to save settings',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [settings]);

  const toggleMode = useCallback(
    async (newMode) => updateSettings({ mode: newMode }),
    [updateSettings],
  );

  return (
    <ModeContext.Provider
      value={{
        mode: settings.mode,
        settings,
        loading,
        refreshSettings,
        updateSettings,
        toggleMode,
        isGrowthMode: settings.mode === 'GROWTH',
      }}
    >
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within ModeProvider');
  }
  return context;
};

export const useStore = useMode;
