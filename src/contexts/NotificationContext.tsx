import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { notificationsApi } from '../api';
import type { Notification } from '../types/domain';
import { websocketService } from '../services/websocketService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  showNewMessageAnimation: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewMessageAnimation, setShowNewMessageAnimation] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const response = await notificationsApi.getAll();
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const response = await notificationsApi.markAsRead(id);
        if (response.success) {
          setNotifications(prev =>
            prev.map(notif =>
              notif.id === id ? { ...notif, read: true } : notif,
            ),
          );
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [user],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const response = await notificationsApi.markAllAsRead();
      if (response.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [user]);

  // 在用户登录后加载通知
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
    }
  }, [user, loadNotifications]);

  // 监听 WebSocket 新通知（全局唯一监听，避免多页面重复注册）
  useEffect(() => {
    const handleNewNotification = (data: any) => {
      setNotifications(prev => [data, ...prev]);
      setShowNewMessageAnimation(true);
      setTimeout(() => {
        setShowNewMessageAnimation(false);
      }, 1000);
    };

    websocketService.on('new_notification', handleNewNotification);

    return () => {
      websocketService.off('new_notification', handleNewNotification);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        showNewMessageAnimation,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
};
