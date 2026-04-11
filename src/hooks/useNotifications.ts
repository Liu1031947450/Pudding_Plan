import { useState, useCallback } from 'react';
import type { Notification } from '../types/domain';
import { notificationsApi } from '../api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationVisible, setNotificationVisible] = useState(false);

  // Initialize notifications from mock data API
  useEffect(() => {
    notificationsApi.getAll().then(response => {
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    });
  }, []);

  const toggleNotificationDrawer = useCallback(() => {
    setNotificationVisible(prev => !prev);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

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
