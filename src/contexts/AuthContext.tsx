import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  username: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pudding_plan_auth';
const AUTH_EXPIRY_KEY = 'pudding_plan_auth_expiry';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
      const storedExpiry = await SecureStore.getItemAsync(AUTH_EXPIRY_KEY);

      if (storedUser && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        const now = Date.now();

        if (now < expiryTime) {
          setUser(JSON.parse(storedUser));
        } else {
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      const expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(userData));
      await SecureStore.setItemAsync(AUTH_EXPIRY_KEY, expiryTime.toString());
      setUser(userData);
    } catch (error) {
      console.error('保存登录信息失败:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearAuth();
      setUser(null);
    } catch (error) {
      console.error('退出登录失败:', error);
      throw error;
    }
  };

  const clearAuth = async () => {
    await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    await SecureStore.deleteItemAsync(AUTH_EXPIRY_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
