import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { Plan } from '../types/domain';

export const plansApi = {
  // 获取所有计划（依赖 token 鉴权）
  getAll: async (): Promise<ApiResponse<Plan[]>> => {
    return apiClient.get<Plan[]>(API_ENDPOINTS.PLANS);
  },

  // 根据 ID 获取单个计划（依赖 token 鉴权）
  getById: async (id: string): Promise<ApiResponse<Plan>> => {
    return apiClient.get<Plan>(API_ENDPOINTS.PLAN_DETAIL(id));
  },

  // 创建新计划（依赖 token 鉴权）
  create: async (
    plan: Omit<Plan, 'id'>,
  ): Promise<ApiResponse<Plan>> => {
    try {
      const response = await apiClient.post<Plan>(API_ENDPOINTS.PLANS, plan);
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '创建计划失败' };
    }
  },

  // 更新计划（依赖 token 鉴权）
  update: async (
    id: string,
    updates: Partial<Plan>,
  ): Promise<ApiResponse<Plan>> => {
    try {
      const response = await apiClient.put<Plan>(API_ENDPOINTS.PLAN_DETAIL(id), updates);
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '更新计划失败' };
    }
  },

  // 删除计划（依赖 token 鉴权）
  delete: async (
    id: string,
  ): Promise<ApiResponse<boolean>> => {
    try {
      const response = await apiClient.delete<boolean>(API_ENDPOINTS.PLAN_DETAIL(id));
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '删除计划失败' };
    }
  },

  // 计划打卡（依赖 token 鉴权）
  checkIn: async (
    id: string,
    date: string,
  ): Promise<ApiResponse<Plan>> => {
    try {
      const response = await apiClient.post<Plan>(`${API_ENDPOINTS.PLAN_CHECK_IN(id)}?date=${date}`);
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '打卡失败' };
    }
  },
};
