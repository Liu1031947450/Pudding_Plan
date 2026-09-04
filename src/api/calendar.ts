import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { DayData, Habit } from '../types/domain';

export type HabitInput = Pick<Habit, 'title' | 'weekdays' | 'startDate'> &
  Partial<
    Pick<Habit, 'subtitle' | 'icon' | 'category' | 'reminderTime' | 'isActive'>
  >;

export const calendarApi = {
  getData: (year: number, month: number): Promise<ApiResponse<DayData[]>> =>
    apiClient.get<DayData[]>(
      `${API_ENDPOINTS.CALENDAR}?year=${year}&month=${month}`,
    ),
  getDailyQuote: (): Promise<ApiResponse<{ text: string; author: string }>> =>
    apiClient.get(API_ENDPOINTS.CALENDAR_QUOTE),
};

export const habitsApi = {
  getAll: (date?: string): Promise<ApiResponse<Habit[]>> =>
    apiClient.get(
      `${API_ENDPOINTS.HABITS}${
        date ? `?date=${encodeURIComponent(date)}` : ''
      }`,
    ),
  create: (data: HabitInput): Promise<ApiResponse<Habit>> =>
    apiClient.post(API_ENDPOINTS.HABITS, data),
  update: (
    id: string,
    data: Partial<HabitInput>,
  ): Promise<ApiResponse<Habit>> =>
    apiClient.put(API_ENDPOINTS.HABIT_DETAIL(id), data),
  delete: (id: string): Promise<ApiResponse<boolean>> =>
    apiClient.delete(API_ENDPOINTS.HABIT_DETAIL(id)),
  reorder: (habitIds: string[]): Promise<ApiResponse<boolean>> =>
    apiClient.put(API_ENDPOINTS.HABIT_REORDER, { habitIds }),
  checkIn: (id: string, date: string): Promise<ApiResponse<Habit>> =>
    apiClient.put(API_ENDPOINTS.HABIT_CHECK_IN(id, date)),
  removeCheckIn: (id: string, date: string): Promise<ApiResponse<Habit>> =>
    apiClient.delete(API_ENDPOINTS.HABIT_CHECK_IN(id, date)),
  toggle: (id: string): Promise<ApiResponse<Habit>> =>
    apiClient.post(`${API_ENDPOINTS.HABIT_DETAIL(id)}/toggle`),
};
