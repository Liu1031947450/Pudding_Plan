import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { Plan } from '../types/domain';

// Use mock server for development
const USE_MOCK = true;

export const plansApi = {
  // Get all plans
  getAll: async (): Promise<ApiResponse<Plan[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.getAll();
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Plan[]>(API_ENDPOINTS.PLANS);
  },

  // Get plan by ID
  getById: async (id: string): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.getById(id);
        if (!data) {
          return { success: false, error: 'Plan not found' };
        }
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Plan>(API_ENDPOINTS.PLAN_DETAIL(id));
  },

  // Create new plan
  create: async (plan: Omit<Plan, 'id'>): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.create(plan);
        return { success: true, data, message: '计划创建成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<Plan>(API_ENDPOINTS.PLANS, plan);
  },

  // Update plan
  update: async (
    id: string,
    updates: Partial<Plan>,
  ): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.update(id, updates);
        if (!data) {
          return { success: false, error: 'Plan not found' };
        }
        return { success: true, data, message: '计划更新成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.put<Plan>(API_ENDPOINTS.PLAN_DETAIL(id), updates);
  },

  // Delete plan
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const success = await mockApiServer.plans.delete(id);
        if (!success) {
          return { success: false, error: 'Plan not found' };
        }
        return { success: true, data: true, message: '计划删除成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.delete<boolean>(API_ENDPOINTS.PLAN_DETAIL(id));
  },

  // Check in plan
  checkIn: async (id: string): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.checkIn(id);
        if (!data) {
          return { success: false, error: 'Plan not found' };
        }
        return { success: true, data, message: '打卡成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<Plan>(API_ENDPOINTS.PLAN_CHECK_IN(id));
  },
};
