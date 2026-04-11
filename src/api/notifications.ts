import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { Notification, Badge } from '../types/domain';

const USE_MOCK = true;

export const notificationsApi = {
  // 获取所有通知
  getAll: async (userId?: string): Promise<ApiResponse<Notification[]>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.notifications.getAll(userId);
        console.log(
          '[Mock API] notificationsApi.getAll - 获取所有通知',
          response.data,
        );
        return { success: true, data: response.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId
      ? `${API_ENDPOINTS.NOTIFICATIONS}?userId=${userId}`
      : API_ENDPOINTS.NOTIFICATIONS;
    return apiClient.get<Notification[]>(endpoint);
  },

  // 标记通知为已读
  markAsRead: async (
    id: string,
    userId?: string,
  ): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.notifications.markAsRead(
          id,
          userId,
        );
        if (!response.data) {
          return { success: false, error: '未找到通知' };
        }
        console.log(
          '[Mock API] notificationsApi.markAsRead - 标记通知为已读',
          id,
        );
        return { success: true, data: true, message: '通知已标记为已读' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId
      ? `${API_ENDPOINTS.NOTIFICATIONS}/${id}/read?userId=${userId}`
      : `${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`;
    return apiClient.patch<boolean>(endpoint);
  },
};

export const badgesApi = {
  // 获取所有成就
  getAll: async (): Promise<ApiResponse<Badge[]>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.badges.getAll();
        console.log(
          '[Mock API] badgesApi.getAll - 获取所有成就',
          response.data,
        );
        return { success: true, data: response.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Badge[]>(API_ENDPOINTS.BADGES);
  },
};
