import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { Notification, Badge, RhythmData } from '../types/domain';

const USE_MOCK = true;

export const notificationsApi = {
  // Get all notifications
  getAll: async (): Promise<ApiResponse<Notification[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.notifications.getAll();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS);
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const success = await mockApiServer.notifications.markAsRead(id);
        if (!success) {
          return { success: false, error: 'Notification not found' };
        }
        return { success: true, data: true, message: '通知已标记为已读' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.patch<boolean>(`${API_ENDPOINTS.NOTIFICATIONS}/${id}/read`);
  },
};

export const badgesApi = {
  // Get all badges
  getAll: async (): Promise<ApiResponse<Badge[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.badges.getAll();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Badge[]>(API_ENDPOINTS.BADGES);
  },
};

export const rhythmApi = {
  // Get week rhythm data
  getWeek: async (): Promise<ApiResponse<RhythmData[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.rhythm.getWeek();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<RhythmData[]>(API_ENDPOINTS.RHYTHM_WEEK);
  },

  // Get month rhythm data
  getMonth: async (): Promise<ApiResponse<RhythmData[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.rhythm.getMonth();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<RhythmData[]>(API_ENDPOINTS.RHYTHM_MONTH);
  },
};
