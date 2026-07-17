/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/navigation/AppNavigator', () => () => null);
jest.mock('../src/screens', () => ({
  SplashScreen: () => null,
}));
jest.mock('../src/contexts', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  NotificationProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  SettingsProvider: ({ children }: { children: React.ReactNode }) => children,
  useAppSettings: () => ({ isDark: false, fontScale: 1 }),
}));
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
