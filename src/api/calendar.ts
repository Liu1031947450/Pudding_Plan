import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { DayData, Habit } from '../types/domain';

export const calendarApi = {
  // 获取日历数据
  getData: async (
    year: number,
    month: number,
    userId?: string,
  ): Promise<ApiResponse<DayData[]>> => {
    const endpoint = userId
      ? `${API_ENDPOINTS.CALENDAR}?year=${year}&month=${month}&userId=${userId}`
      : `${API_ENDPOINTS.CALENDAR}?year=${year}&month=${month}`;
    return apiClient.get<DayData[]>(endpoint);
  },
  // 获取每日金句
  getDailyQuote: async (): Promise<
    ApiResponse<{ text: string; author: string }>
  > => {
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
    return apiClient.get<Habit[]>(API_ENDPOINTS.HABITS);
  },

  // 切换习惯完成状态
  toggle: async (id: string): Promise<ApiResponse<Habit>> => {
    return apiClient.post<Habit>(API_ENDPOINTS.HABIT_TOGGLE(id));
  },
};
