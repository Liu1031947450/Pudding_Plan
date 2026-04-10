import { apiClient, type ApiResponse } from './client';
import { mockApiServer } from './mock-server';
import type { RhythmData } from '../types/domain';

// 开发时使用 mock server
const USE_MOCK = true;

export const rhythmApi = {
  // 获取周节奏数据
  getWeek: async (): Promise<ApiResponse<RhythmData[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.rhythm.getWeek();
        console.log('[Mock API] rhythmApi.getWeek - 获取周节奏数据', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<RhythmData[]>('/rhythm/week');
  },

  // 获取月节奏数据
  getMonth: async (): Promise<ApiResponse<RhythmData[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.rhythm.getMonth();
        console.log('[Mock API] rhythmApi.getMonth - 获取月节奏数据', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<RhythmData[]>('/rhythm/month');
  },
};
