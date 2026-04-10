import type { DayData, Habit } from '../types/domain';
import { calendarApi, habitsApi } from '../api';

// Calendar Service - handles calendar and habit operations
class CalendarService {
  // Get calendar data
  async getCalendarData(): Promise<DayData[]> {
    const response = await calendarApi.getData();
    return response.data || [];
  }

  // Get habits
  async getHabits(): Promise<Habit[]> {
    const response = await habitsApi.getAll();
    return response.data || [];
  }

  // Toggle habit completion
  async toggleHabit(habitId: string): Promise<Habit | undefined> {
    const response = await habitsApi.toggle(habitId);
    return response.data;
  }

  // Update day activity
  async updateDayActivity(
    day: number,
    hasActivity: boolean,
    activityType?: 'primary' | 'secondary' | 'tertiary',
  ): Promise<boolean> {
    const response = await calendarApi.updateDay(
      day,
      hasActivity,
      activityType,
    );
    return response.success;
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
