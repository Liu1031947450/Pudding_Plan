import type { DayData, Habit } from '../types/domain';
import { calendarApi, habitsApi } from '../api';
import type { ApiResponse } from '../api/client';
import type { HabitInput } from '../api/calendar';

// Calendar Service - handles calendar and habit operations
class CalendarService {
  // Get calendar data（依赖 token 鉴权）
  async getCalendarData(
    year: number,
    month: number,
  ): Promise<ApiResponse<DayData[]>> {
    return await calendarApi.getData(year, month);
  }

  // Get habits（依赖 token 鉴权）
  async getHabits(date?: string): Promise<ApiResponse<Habit[]>> {
    return await habitsApi.getAll(date);
  }

  // Toggle habit completion（依赖 token 鉴权）
  async toggleHabit(habitId: string): Promise<ApiResponse<Habit>> {
    return await habitsApi.toggle(habitId);
  }

  async createHabit(data: HabitInput): Promise<ApiResponse<Habit>> {
    return habitsApi.create(data);
  }

  async updateHabit(
    habitId: string,
    data: Partial<HabitInput>,
  ): Promise<ApiResponse<Habit>> {
    return habitsApi.update(habitId, data);
  }

  async deleteHabit(habitId: string): Promise<ApiResponse<boolean>> {
    return habitsApi.delete(habitId);
  }

  async setHabitCheckIn(
    habitId: string,
    date: string,
    completed: boolean,
  ): Promise<ApiResponse<Habit>> {
    return completed
      ? habitsApi.checkIn(habitId, date)
      : habitsApi.removeCheckIn(habitId, date);
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
