import { useState, useCallback, useEffect } from 'react';
import type { Notification } from '../types/domain';
import { notificationsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationVisible, setNotificationVisible] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }

    notificationsApi.getAll().then(response => {
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    });
  }, [currentUserId]);

  const toggleNotificationDrawer = useCallback(() => {
    setNotificationVisible(prev => !prev);
  }, []);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!currentUserId) {
        return;
      }

      const response = await notificationsApi.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif,
          ),
        );
      }
    },
    [currentUserId],
  );

  const markAllAsRead = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    const response = await notificationsApi.markAllAsRead();
    if (response.success) {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    }
  }, [currentUserId]);

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!currentUserId) {
        return;
      }

      const response = await notificationsApi.delete(id);
      if (response.success) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
      }
    },
    [currentUserId],
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    notificationVisible,
    unreadCount,
    toggleNotificationDrawer,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
