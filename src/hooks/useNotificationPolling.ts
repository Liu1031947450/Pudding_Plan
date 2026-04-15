import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { notificationsApi } from '../api/notifications';

interface UseNotificationPollingOptions {
  interval?: number;
  onCountChange?: (count: number) => void;
  enabled?: boolean;
}

export const useNotificationPolling = ({
  interval = 10000,
  onCountChange,
  enabled = true,
}: UseNotificationPollingOptions = {}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getAll(true);
      if (res.success && res.data) {
        onCountChange?.(res.data.length);
      }
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
    }
  }, [onCountChange]);

  useEffect(() => {
    if (!enabled) return;

    fetchUnreadCount();

    intervalRef.current = setInterval(fetchUnreadCount, interval);

    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          fetchUnreadCount();
        }
        appState.current = nextAppState;
      },
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.remove();
    };
  }, [enabled, interval, fetchUnreadCount]);

  return { refetch: fetchUnreadCount };
};
