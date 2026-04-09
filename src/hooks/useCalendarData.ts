import { useState, useEffect, useCallback } from 'react';
import type { DayData, Habit } from '../types/domain';
import { calendarService } from '../services/calendarService';

export const useCalendarData = () => {
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      try {
        const calendar = calendarService.getCalendarData();
        const habitsData = calendarService.getHabits();
        setCalendarData(calendar);
        setHabits(habitsData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleHabit = useCallback((habitId: string) => {
    const success = calendarService.toggleHabit(habitId);
    if (success) {
      setHabits(calendarService.getHabits());
    }
    return success;
  }, []);

  const updateDayActivity = useCallback(
    (
      day: number,
      hasActivity: boolean,
      activityType?: 'primary' | 'secondary' | 'tertiary',
    ) => {
      const success = calendarService.updateDayActivity(
        day,
        hasActivity,
        activityType,
      );
      if (success) {
        setCalendarData(calendarService.getCalendarData());
      }
      return success;
    },
    [],
  );

  return {
    calendarData,
    habits,
    loading,
    toggleHabit,
    updateDayActivity,
  };
};
