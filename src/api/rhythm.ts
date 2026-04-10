import { apiClient, type ApiResponse } from './client';
import { mockApiServer } from './mock-server';
import type { RhythmData } from '../types/domain';

// 开发时使用 mock server
const USE_MOCK = true;

export const rhythmApi = {
  // 获取周节奏数据
  getWeek: async (userId?: string): Promise<ApiResponse<RhythmData[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.rhythm.getWeek(userId);
        console.log('[Mock API] rhythmApi.getWeek - 获取周节奏数据', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId ? `/rhythm/week?userId=${userId}` : '/rhythm/week';
    return apiClient.get<RhythmData[]>(endpoint);
  },

  // 获取月节奏数据
  getMonth: async (userId?: string): Promise<ApiResponse<RhythmData[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.rhythm.getMonth(userId);
        console.log('[Mock API] rhythmApi.getMonth - 获取月节奏数据', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId
      ? `/rhythm/month?userId=${userId}`
      : '/rhythm/month';
    return apiClient.get<RhythmData[]>(endpoint);
  },
};
