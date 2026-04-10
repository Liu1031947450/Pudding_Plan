import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { Plan } from '../types/domain';

// 开发时使用 mock server
const USE_MOCK = true;

export const plansApi = {
  // 获取所有计划
  getAll: async (userId?: string): Promise<ApiResponse<Plan[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.getAll(userId);
        console.log('[Mock API] plansApi.getAll - 获取所有计划', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId ? `${API_ENDPOINTS.PLANS}?userId=${userId}` : API_ENDPOINTS.PLANS;
    return apiClient.get<Plan[]>(endpoint);
  },

  // 根据 ID 获取单个计划
  getById: async (id: string, userId?: string): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.getById(id, userId);
        if (!data) {
          return { success: false, error: '未找到计划' };
        }
        console.log('[Mock API] plansApi.getById - 获取单个计划详情', data, 'userId:', userId);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId 
      ? `${API_ENDPOINTS.PLAN_DETAIL(id)}?userId=${userId}` 
      : API_ENDPOINTS.PLAN_DETAIL(id);
    return apiClient.get<Plan>(endpoint);
  },

  // 创建新计划
  create: async (plan: Omit<Plan, 'id'>, userId?: string): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.create(plan, userId);
        console.log('[Mock API] plansApi.create - 创建新计划', data);
        return { success: true, data, message: '计划创建成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId ? `${API_ENDPOINTS.PLANS}?userId=${userId}` : API_ENDPOINTS.PLANS;
    return apiClient.post<Plan>(endpoint, plan);
  },

  // 更新计划
  update: async (
    id: string,
    updates: Partial<Plan>,
    userId?: string,
  ): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.update(id, updates, userId);
        if (!data) {
          return { success: false, error: '未找到计划' };
        }
        console.log('[Mock API] plansApi.update - 更新计划', data);
        return { success: true, data, message: '计划更新成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId 
      ? `${API_ENDPOINTS.PLAN_DETAIL(id)}?userId=${userId}` 
      : API_ENDPOINTS.PLAN_DETAIL(id);
    return apiClient.put<Plan>(endpoint, updates);
  },

  // 删除计划
  delete: async (id: string, userId?: string): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const success = await mockApiServer.plans.delete(id, userId);
        if (!success) {
          return { success: false, error: '未找到计划' };
        }
        console.log('[Mock API] plansApi.delete - 删除计划', id);
        return { success: true, data: true, message: '计划删除成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    const endpoint = userId 
      ? `${API_ENDPOINTS.PLAN_DETAIL(id)}?userId=${userId}` 
      : API_ENDPOINTS.PLAN_DETAIL(id);
    return apiClient.delete<boolean>(endpoint);
  },

  // 计划打卡
  checkIn: async (id: string): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.checkIn(id);
        if (!data) {
          return { success: false, error: '未找到计划' };
        }
        console.log('[Mock API] plansApi.checkIn - 计划打卡', data);
        return { success: true, data, message: '打卡成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<Plan>(API_ENDPOINTS.PLAN_CHECK_IN(id));
  },
};
