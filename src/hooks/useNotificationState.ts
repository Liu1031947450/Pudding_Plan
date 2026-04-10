import { useState, useCallback } from 'react';
import { notificationsApi } from '../api';
import type { Notification } from '../types/domain';

export const useNotificationState = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async (userId?: string) => {
    setLoading(true);
    try {
      const response = await notificationsApi.getAll(userId);
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string, userId?: string) => {
    try {
      const response = await notificationsApi.markAsRead(id, userId);
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
  }, []);

  const markAllAsRead = useCallback(
    async (userId?: string) => {
      try {
        // 批量标记所有未读通知
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        await Promise.all(
          unreadIds.map(id => notificationsApi.markAsRead(id, userId)),
        );
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    },
    [notifications],
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    unreadCount,
    refreshNotifications: loadNotifications,
  };
};
