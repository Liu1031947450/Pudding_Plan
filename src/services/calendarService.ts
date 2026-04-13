import type { DayData, Habit } from '../types/domain';
import { calendarApi, habitsApi } from '../api';
import type { ApiResponse } from '../api/client';

// Calendar Service - handles calendar and habit operations
class CalendarService {
  // Get calendar data
  async getCalendarData(
    year: number,
    month: number,
    userId?: string,
  ): Promise<ApiResponse<DayData[]>> {
    return await calendarApi.getData(year, month, userId);
  }

  // Get habits
  async getHabits(): Promise<ApiResponse<Habit[]>> {
    return await habitsApi.getAll();
  }

  // Toggle habit completion
  async toggleHabit(habitId: string): Promise<ApiResponse<Habit>> {
    return await habitsApi.toggle(habitId);
  }

  // Update day activity
  async updateDayActivity(
    day: number,
    hasActivity: boolean,
    activityType?: 'primary' | 'secondary' | 'tertiary',
  ): Promise<ApiResponse<boolean>> {
    return await calendarApi.updateDay(
      day,
      hasActivity,
      activityType,
    );
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
