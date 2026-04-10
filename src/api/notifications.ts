import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { Notification, Badge } from '../types/domain';

const USE_MOCK = true;

export const notificationsApi = {
  // 获取所有通知
  getAll: async (): Promise<ApiResponse<Notification[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.notifications.getAll();
        console.log('[Mock API] notificationsApi.getAll - 获取所有通知', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS);
  },

  // 标记通知为已读
  markAsRead: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const success = await mockApiServer.notifications.markAsRead(id);
        if (!success) {
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
    return apiClient.patch<boolean>(
      `${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`,
    );
  },
};

export const badgesApi = {
  // 获取所有成就
  getAll: async (): Promise<ApiResponse<Badge[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.badges.getAll();
        console.log('[Mock API] badgesApi.getAll - 获取所有成就', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Badge[]>(API_ENDPOINTS.BADGES);
  },
};
