import React from 'react';
import { Platform } from 'react-native';
import { settingsApi, type ApiResponse } from '../api';
import { syncNotificationSettings } from '../services/notificationScheduler';
import type { UserSettings } from '../types/domain';
import { useAuth } from './AuthContext';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  notificationsEnabled: false,
  notificationTime: '08:00',
  dndStart: '22:00',
  dndEnd: '07:00',
  theme: 'light',
  fontSize: 'medium',
};

interface SettingsContextValue {
  settings: UserSettings;
  isDark: boolean;
  fontScale: number;
  updateSettings: (
    updates: Partial<UserSettings>,
  ) => Promise<ApiResponse<UserSettings>>;
  refreshSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = React.createContext<SettingsContextValue | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [settings, setSettings] = React.useState(DEFAULT_USER_SETTINGS);
  const applySettings = React.useCallback(async (next: UserSettings) => {
    const lightSettings = { ...next, theme: 'light' as const };
    setSettings(lightSettings);
    const webDocument = (
      globalThis as typeof globalThis & {
        document?: { documentElement: { style: { colorScheme: string } } };
      }
    ).document;
    if (Platform.OS === 'web' && webDocument) {
      webDocument.documentElement.style.colorScheme = 'light';
    }
    await syncNotificationSettings(lightSettings);
  }, []);

  const refreshSettings = React.useCallback(async () => {
    if (!user) {
      await applySettings(DEFAULT_USER_SETTINGS);
      return;
    }
    const response = await settingsApi.get();
    if (response.success && response.data) {
      await applySettings(response.data);
    }
  }, [user, applySettings]);

  React.useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = React.useCallback(
    async (updates: Partial<UserSettings>) => {
      const response = await settingsApi.update(updates);
      if (response.success && response.data) {
        await applySettings(response.data);
      }
      return response;
    },
    [applySettings],
  );

  const resetSettings = React.useCallback(
    () => applySettings(DEFAULT_USER_SETTINGS),
    [applySettings],
  );

  const isDark = false;
  const fontScale =
    settings.fontSize === 'small'
      ? 0.9
      : settings.fontSize === 'large'
      ? 1.15
      : 1;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isDark,
        fontScale,
        updateSettings,
        refreshSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within SettingsProvider');
  }
  return context;
};
