import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { Notification, Badge } from '../types/domain';

export const notificationsApi = {
  // 获取所有通知（依赖 token 鉴权）
  getAll: async (
    unreadOnly?: boolean,
  ): Promise<ApiResponse<Notification[]>> => {
    const endpoint = unreadOnly
      ? `${API_ENDPOINTS.NOTIFICATIONS}?unreadOnly=true`
      : API_ENDPOINTS.NOTIFICATIONS;

    return apiClient.get<Notification[]>(endpoint);
  },

  // 标记通知为已读（依赖 token 鉴权）
  markAsRead: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.patch<boolean>(
      `${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`,
    );
  },

  // 标记所有通知为已读（依赖 token 鉴权）
  markAllAsRead: async (): Promise<ApiResponse<boolean>> => {
    return apiClient.patch<boolean>(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
  },

  // 删除通知（依赖 token 鉴权）
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`);
  },
};

export const badgesApi = {
  // 获取所有成就（依赖 token 鉴权）
  getAll: async (): Promise<ApiResponse<Badge[]>> => {
    return apiClient.get<Badge[]>(API_ENDPOINTS.BADGES);
  },
};
