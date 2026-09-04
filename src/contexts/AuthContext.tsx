import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { authApi, setAuthToken, setUnauthorizedHandler } from '../api';
import { websocketService } from '../services/websocketService';
import { storage } from '../services/storage';

export interface User {
  id: string;
  username: string;
  phone: string;
  /** 用户头像 URL，最大长度 1000 字符 */
  avatar?: string | null;
  bio?: string | null;
  goalTags: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: (options?: { skipRemote?: boolean }) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  updateToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'pudding_plan_auth';
const AUTH_EXPIRY_KEY = 'pudding_plan_auth_expiry';
const AUTH_TOKEN_KEY = 'pudding_plan_auth_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(async () => {
    await storage.removeItem(AUTH_STORAGE_KEY);
    await storage.removeItem(AUTH_EXPIRY_KEY);
    await storage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const storedUser = await storage.getItem(AUTH_STORAGE_KEY);
      const storedExpiry = await storage.getItem(AUTH_EXPIRY_KEY);
      const storedToken = await storage.getItem(AUTH_TOKEN_KEY);

      if (storedUser && storedExpiry && storedToken) {
        const expiryTime = parseInt(storedExpiry, 10);
        const now = Date.now();

        if (now < expiryTime) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          setAuthToken(storedToken);

          // 连接WebSocket
          await websocketService.connect();
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
  }, [clearAuth]);

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  React.useEffect(() => {
    setUnauthorizedHandler(async () => {
      websocketService.disconnect();
      await clearAuth();
      setUser(null);
      setToken(null);
    });
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  const login = async (tokenValue: string, userData: User) => {
    try {
      const expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      await storage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
      await storage.setItem(AUTH_TOKEN_KEY, tokenValue);
      setUser(userData);
      setToken(tokenValue);
      setAuthToken(tokenValue);

      // 连接WebSocket
      await websocketService.connect();
    } catch (error) {
      console.error('保存登录信息失败:', error);
      throw error;
    }
  };

  const updateUser = async (userData: User) => {
    try {
      await storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  };

  const updateToken = async (tokenValue: string) => {
    await storage.setItem(AUTH_TOKEN_KEY, tokenValue);
    setToken(tokenValue);
    setAuthToken(tokenValue);
    await websocketService.reconnect();
  };

  const logout = async (options?: { skipRemote?: boolean }) => {
    try {
      // 断开WebSocket连接
      websocketService.disconnect();

      if (!options?.skipRemote) {
        await authApi.logout();
      }

      await clearAuth();
      setUser(null);
      setToken(null);
      setAuthToken(null);
    } catch (error) {
      console.error('退出登录失败:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, updateUser, updateToken }}
    >
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
