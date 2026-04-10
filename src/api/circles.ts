import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { Circle, Buddy } from '../types/domain';

const USE_MOCK = true;

export const circlesApi = {
  // Get all circles
  getAll: async (): Promise<ApiResponse<Circle[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.circles.getAll();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Circle[]>(API_ENDPOINTS.CIRCLES);
  },

  // Get circle by ID
  getById: async (id: string): Promise<ApiResponse<Circle>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.circles.getById(id);
        if (!data) {
          return { success: false, error: 'Circle not found' };
        }
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Circle>(API_ENDPOINTS.CIRCLE_DETAIL(id));
  },

  // Join circle
  join: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const success = await mockApiServer.circles.join(id);
        if (!success) {
          return { success: false, error: 'Circle not found' };
        }
        return { success: true, data: true, message: '加入圈子成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<boolean>(API_ENDPOINTS.CIRCLE_JOIN(id));
  },
};

export const buddiesApi = {
  // Get all buddies
  getAll: async (): Promise<ApiResponse<Buddy[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.buddies.getAll();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Buddy[]>(API_ENDPOINTS.BUDDIES);
  },
};
