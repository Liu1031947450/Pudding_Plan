import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { RhythmData } from '../types/domain';

export const rhythmApi = {
  // 获取周节奏数据
  getWeek: async (userId?: string): Promise<ApiResponse<RhythmData[]>> => {
    const endpoint = userId
      ? `${API_ENDPOINTS.RHYTHM_WEEK}?userId=${userId}`
      : API_ENDPOINTS.RHYTHM_WEEK;
    return apiClient.get<RhythmData[]>(endpoint);
  },

  // 获取月节奏数据
  getMonth: async (userId?: string): Promise<ApiResponse<RhythmData[]>> => {
    const endpoint = userId
      ? `${API_ENDPOINTS.RHYTHM_MONTH}?userId=${userId}`
      : API_ENDPOINTS.RHYTHM_MONTH;
    return apiClient.get<RhythmData[]>(endpoint);
  },
};
