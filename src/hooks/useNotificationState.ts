import { useState, useEffect } from 'react';
import { mockNotifications } from '../data/mockData';
import type { Notification } from '../types/domain';

// 全局状态存储
let globalNotifications: Notification[] = mockNotifications;
const listeners: Set<(notifications: Notification[]) => void> = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener([...globalNotifications]));
};

export const useNotificationState = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(globalNotifications);

  useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setNotifications(newNotifications);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const markAsRead = (id: string) => {
    globalNotifications = globalNotifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif,
    );
    notifyListeners();
  };

  const markAllAsRead = () => {
    globalNotifications = globalNotifications.map(notif => ({
      ...notif,
      read: true,
    }));
    notifyListeners();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  };
};
