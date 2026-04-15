import { useState, useCallback, useEffect } from 'react';
import { notificationsApi } from '../api';
import type { Notification } from '../types/domain';
import { websocketService } from '../services/websocketService';
import { useAuth } from '../contexts';

export const useNotificationState = () => {
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

  const markAsRead = useCallback(async (id: string) => {
    if (!user) {
      return;
    }

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
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) {
      return;
    }

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

  // 监听WebSocket新通知
  useEffect(() => {
    const handleNewNotification = (data: any) => {
      setNotifications(prev => [data, ...prev]);
      // 触发新消息动画
      setShowNewMessageAnimation(true);
      setTimeout(() => {
        setShowNewMessageAnimation(false);
      }, 1000);
    };

    websocketService.on('new_notification', handleNewNotification);

    // 清理函数
    return () => {
      websocketService.off('new_notification', handleNewNotification);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    unreadCount,
    showNewMessageAnimation,
    refreshNotifications: loadNotifications,
  };
};
