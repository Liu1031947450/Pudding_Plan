import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { ActivityRecord } from '../types/domain';

export const activityApi = {
  getHistory: (limit = 100): Promise<ApiResponse<ActivityRecord[]>> =>
    apiClient.get(`${API_ENDPOINTS.ACTIVITY_HISTORY}?limit=${limit}`),
};
