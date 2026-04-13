import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { Notification, Badge } from '../types/domain';

export const notificationsApi = {
  // 获取所有通知
  getAll: async (userId?: string, unreadOnly?: boolean): Promise<ApiResponse<Notification[]>> => {
    let endpoint = userId
      ? `${API_ENDPOINTS.NOTIFICATIONS}?userId=${userId}`
      : API_ENDPOINTS.NOTIFICATIONS;
    
    if (unreadOnly) {
      endpoint += `${userId ? '&' : '?'}unreadOnly=true`;
    }
    
    return apiClient.get<Notification[]>(endpoint);
  },

  // 标记通知为已读
  markAsRead: async (
    id: string,
    userId?: string,
  ): Promise<ApiResponse<boolean>> => {
    const endpoint = userId
      ? `${API_ENDPOINTS.NOTIFICATIONS}/${id}/read?userId=${userId}`
      : `${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`;
    return apiClient.patch<boolean>(endpoint);
  },

  // 标记所有通知为已读
  markAllAsRead: async (userId?: string): Promise<ApiResponse<boolean>> => {
    const endpoint = userId
      ? `${API_ENDPOINTS.NOTIFICATIONS}/read-all?userId=${userId}`
      : `${API_ENDPOINTS.NOTIFICATIONS}/read-all`;
    return apiClient.patch<boolean>(endpoint);
  },

  // 删除通知
  delete: async (
    id: string,
    userId?: string,
  ): Promise<ApiResponse<boolean>> => {
    const endpoint = userId
      ? `${API_ENDPOINTS.NOTIFICATIONS}/${id}?userId=${userId}`
      : `${API_ENDPOINTS.NOTIFICATIONS}/${id}`;
    return apiClient.delete<boolean>(endpoint);
  },
};

export const badgesApi = {
  // 获取所有成就
  getAll: async (): Promise<ApiResponse<Badge[]>> => {
    return apiClient.get<Badge[]>(API_ENDPOINTS.BADGES);
  },
};
