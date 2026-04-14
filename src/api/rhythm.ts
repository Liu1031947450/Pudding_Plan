import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { RhythmData } from '../types/domain';

export const rhythmApi = {
  // 获取周节奏数据（依赖 token 鉴权）
  getWeek: async (): Promise<ApiResponse<RhythmData[]>> => {
    return apiClient.get<RhythmData[]>(API_ENDPOINTS.RHYTHM_WEEK);
  },

  // 获取月节奏数据（依赖 token 鉴权）
  getMonth: async (): Promise<ApiResponse<RhythmData[]>> => {
    return apiClient.get<RhythmData[]>(API_ENDPOINTS.RHYTHM_MONTH);
  },
};
