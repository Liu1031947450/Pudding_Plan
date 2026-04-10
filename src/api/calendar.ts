import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { DayData, Habit } from '../types/domain';

const USE_MOCK = true;

export const calendarApi = {
  // Get calendar data
  getData: async (): Promise<ApiResponse<DayData[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.calendar.getData();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<DayData[]>(API_ENDPOINTS.CALENDAR);
  },

  // Update day activity
  updateDay: async (
    day: number,
    hasActivity: boolean,
    activityType?: 'primary' | 'secondary' | 'tertiary'
  ): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const success = await mockApiServer.calendar.updateDay(day, hasActivity, activityType);
        if (!success) {
          return { success: false, error: 'Day not found' };
        }
        return { success: true, data: true, message: '日历更新成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.patch<boolean>(API_ENDPOINTS.CALENDAR, { day, hasActivity, activityType });
  },
};

export const habitsApi = {
  // Get all habits
  getAll: async (): Promise<ApiResponse<Habit[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.habits.getAll();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Habit[]>(API_ENDPOINTS.HABITS);
  },

  // Toggle habit completion
  toggle: async (id: string): Promise<ApiResponse<Habit>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.habits.toggle(id);
        if (!data) {
          return { success: false, error: 'Habit not found' };
        }
        return { success: true, data, message: '习惯状态更新成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<Habit>(API_ENDPOINTS.HABIT_TOGGLE(id));
  },
};
