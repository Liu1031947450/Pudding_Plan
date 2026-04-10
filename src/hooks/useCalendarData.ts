import { useState, useEffect, useCallback } from 'react';
import type { DayData, Habit } from '../types/domain';
import { calendarService } from '../services/calendarService';

export const useCalendarData = () => {
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const [calendar, habitsData] = await Promise.all([
        calendarService.getCalendarData(year, month),
        calendarService.getHabits(),
      ]);
      setCalendarData(calendar);
      setHabits(habitsData);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleHabit = useCallback(
    async (habitId: string) => {
      const habit = await calendarService.toggleHabit(habitId);
      if (habit) {
        await loadData();
      }
      return !!habit;
    },
    [loadData],
  );

  const updateDayActivity = useCallback(
    async (
      day: number,
      hasActivity: boolean,
      activityType?: 'primary' | 'secondary' | 'tertiary',
    ) => {
      const success = await calendarService.updateDayActivity(
        day,
        hasActivity,
        activityType,
      );
      if (success) {
        await loadData();
      }
      return success;
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
