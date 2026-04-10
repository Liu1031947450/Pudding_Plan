import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { DayData, Habit } from '../types/domain';

const USE_MOCK = true;

export const calendarApi = {
  // 获取日历数据
  getData: async (
    year: number,
    month: number,
    userId?: string,
  ): Promise<ApiResponse<DayData[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.calendar.getData(year, month, userId);
        console.log(
          '[Mock API] calendarApi.getData - 获取日历数据',
          year,
          month,
        );
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId
      ? `${API_ENDPOINTS.CALENDAR}?year=${year}&month=${month}&userId=${userId}`
      : `${API_ENDPOINTS.CALENDAR}?year=${year}&month=${month}`;
    return apiClient.get<DayData[]>(endpoint);
  },
  // 获取每日金句
  getDailyQuote: async (): Promise<
    ApiResponse<{ text: string; author: string }>
  > => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.calendar.getDailyQuote();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<{ text: string; author: string }>(
      API_ENDPOINTS.CALENDAR_QUOTE,
    );
  },

  // 更新日历活动
  updateDay: async (
    day: number,
    hasActivity: boolean,
    activityType?: 'primary' | 'secondary' | 'tertiary',
  ): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const success = await mockApiServer.calendar.updateDay(
          day,
          hasActivity,
          activityType,
        );
        if (!success) {
          return { success: false, error: '未找到日期' };
        }
        console.log(
          '[Mock API] calendarApi.updateDay - 更新日历活动',
          day,
          hasActivity,
          activityType,
        );
        return { success: true, data: true, message: '日历更新成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.patch<boolean>(API_ENDPOINTS.CALENDAR, {
      day,
      hasActivity,
      activityType,
    });
  },
};

export const habitsApi = {
  // 获取所有习惯
  getAll: async (): Promise<ApiResponse<Habit[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.habits.getAll();
        console.log('[Mock API] habitsApi.getAll - 获取所有习惯', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Habit[]>(API_ENDPOINTS.HABITS);
  },

  // 切换习惯完成状态
  toggle: async (id: string): Promise<ApiResponse<Habit>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.habits.toggle(id);
        if (!data) {
          return { success: false, error: '未找到习惯' };
        }
        console.log('[Mock API] habitsApi.toggle - 切换习惯状态', id, data);
        return { success: true, data, message: '习惯状态更新成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<Habit>(API_ENDPOINTS.HABIT_TOGGLE(id));
  },
};
