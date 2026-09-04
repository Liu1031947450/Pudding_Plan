import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const getWebStorage = () =>
  (
    globalThis as typeof globalThis & {
      localStorage?: {
        getItem: (key: string) => string | null;
        setItem: (key: string, value: string) => void;
        removeItem: (key: string) => void;
      };
    }
  ).localStorage;

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return getWebStorage()?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      getWebStorage()?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      getWebStorage()?.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
