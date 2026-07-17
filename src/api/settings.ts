import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { UserSettings } from '../types/domain';

export const settingsApi = {
  get: (): Promise<ApiResponse<UserSettings>> =>
    apiClient.get<UserSettings>(API_ENDPOINTS.SETTINGS),

  update: (
    updates: Partial<UserSettings>,
  ): Promise<ApiResponse<UserSettings>> =>
    apiClient.put<UserSettings>(API_ENDPOINTS.SETTINGS, updates),
};
