import { useState, useEffect, useCallback } from 'react';
import type { DayData, Habit } from '../types/domain';
import { calendarService } from '../services/calendarService';
import { useAuth } from '../contexts/AuthContext';

export const useCalendarData = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentUserId) {
      setCalendarData([]);
      setHabits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [calendarResponse, habitsResponse] = await Promise.all([
        calendarService.getCalendarData(year, month),
        calendarService.getHabits(),
      ]);

      setCalendarData(calendarResponse.data || []);
      setHabits(habitsResponse.data || []);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleHabit = useCallback(
    async (habitId: string) => {
      if (!currentUserId) {
        return false;
      }

      const response = await calendarService.toggleHabit(habitId);
      if (response.success) {
        await loadData();
      }
      return response.success;
    },
    [currentUserId, loadData],
  );

  const updateDayActivity = useCallback(
    async (
      day: number,
      hasActivity: boolean,
      activityType?: 'primary' | 'secondary' | 'tertiary',
    ) => {
      const response = await calendarService.updateDayActivity(
        day,
        hasActivity,
        activityType,
      );
      if (response.success) {
        await loadData();
      }
      return response.success;
    },
    [loadData],
  );

  return {
    calendarData,
    habits,
    loading,
    toggleHabit,
    updateDayActivity,
    refreshData: loadData,
  };
};
