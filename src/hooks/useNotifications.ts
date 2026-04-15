import { useState, useCallback, useEffect } from 'react';
import type { Notification } from '../types/domain';
import { notificationsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { websocketService } from '../services/websocketService';

export const useNotifications = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [showNewMessageAnimation, setShowNewMessageAnimation] = useState(false);

  useEffect(() => {
    if (!currentUserId) {
      setNotifications([]);
      return;
    }

    // 加载初始通知列表
    notificationsApi.getAll().then(response => {
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    });

    // 监听WebSocket新通知
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
    showNewMessageAnimation,
    toggleNotificationDrawer,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
