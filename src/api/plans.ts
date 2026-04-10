import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { Plan } from '../types/domain';

// 开发时使用 mock server
const USE_MOCK = true;

export const plansApi = {
  // 获取所有计划
  getAll: async (): Promise<ApiResponse<Plan[]>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.getAll();
        console.log('[Mock API] plansApi.getAll - 获取所有计划', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Plan[]>(API_ENDPOINTS.PLANS);
  },

  // 根据 ID 获取单个计划
  getById: async (id: string): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.getById(id);
        if (!data) {
          return { success: false, error: '未找到计划' };
        }
        console.log('[Mock API] plansApi.getById - 获取单个计划详情', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Plan>(API_ENDPOINTS.PLAN_DETAIL(id));
  },

  // 创建新计划
  create: async (plan: Omit<Plan, 'id'>): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.create(plan);
        console.log('[Mock API] plansApi.create - 创建新计划', data);
        return { success: true, data, message: '计划创建成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<Plan>(API_ENDPOINTS.PLANS, plan);
  },

  // 更新计划
  update: async (
    id: string,
    updates: Partial<Plan>,
  ): Promise<ApiResponse<Plan>> => {
    if (USE_MOCK) {
      try {
        const data = await mockApiServer.plans.update(id, updates);
        if (!data) {
          return { success: false, error: '未找到计划' };
        }
        console.log('[Mock API] plansApi.update - 更新计划', data);
        return { success: true, data, message: '计划更新成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.put<Plan>(API_ENDPOINTS.PLAN_DETAIL(id), updates);
  },

  // 删除计划
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const success = await mockApiServer.plans.delete(id);
        if (!success) {
          return { success: false, error: '未找到计划' };
        }
        console.log('[Mock API] plansApi.delete - 删除计划', id);
        return { success: true, data: true, message: '计划删除成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.delete<boolean>(API_ENDPOINTS.PLAN_DETAIL(id));
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
