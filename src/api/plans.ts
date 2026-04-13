import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { Plan } from '../types/domain';

export const plansApi = {
  // 获取所有计划
  getAll: async (userId?: string): Promise<ApiResponse<Plan[]>> => {
    const endpoint = userId
      ? `${API_ENDPOINTS.PLANS}?userId=${userId}`
      : API_ENDPOINTS.PLANS;
    return apiClient.get<Plan[]>(endpoint);
  },

  // 根据 ID 获取单个计划
  getById: async (id: string, userId?: string): Promise<ApiResponse<Plan>> => {
    const endpoint = userId
      ? `${API_ENDPOINTS.PLAN_DETAIL(id)}?userId=${userId}`
      : API_ENDPOINTS.PLAN_DETAIL(id);
    return apiClient.get<Plan>(endpoint);
  },

  // 创建新计划
  create: async (
    plan: Omit<Plan, 'id'>,
    userId?: string,
  ): Promise<ApiResponse<Plan>> => {
    try {
      const endpoint = userId
        ? `${API_ENDPOINTS.PLANS}?userId=${userId}`
        : API_ENDPOINTS.PLANS;
      const response = await apiClient.post<Plan>(endpoint, plan);
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '创建计划失败' };
    }
  },

  // 更新计划
  update: async (
    id: string,
    updates: Partial<Plan>,
    userId?: string,
  ): Promise<ApiResponse<Plan>> => {
    try {
      const endpoint = userId
        ? `${API_ENDPOINTS.PLAN_DETAIL(id)}?userId=${userId}`
        : API_ENDPOINTS.PLAN_DETAIL(id);
      const response = await apiClient.put<Plan>(endpoint, updates);
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '更新计划失败' };
    }
  },

  // 删除计划
  delete: async (
    id: string,
    userId?: string,
  ): Promise<ApiResponse<boolean>> => {
    try {
      const endpoint = userId
        ? `${API_ENDPOINTS.PLAN_DETAIL(id)}?userId=${userId}`
        : API_ENDPOINTS.PLAN_DETAIL(id);
      const response = await apiClient.delete<boolean>(endpoint);
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '删除计划失败' };
    }
  },

  // 计划打卡
  checkIn: async (
    id: string,
    date: string,
    userId?: string,
  ): Promise<ApiResponse<Plan>> => {
    try {
      const endpoint = userId
        ? `${API_ENDPOINTS.PLAN_CHECK_IN(id)}?date=${date}&userId=${userId}`
        : `${API_ENDPOINTS.PLAN_CHECK_IN(id)}?date=${date}`;
      const response = await apiClient.post<Plan>(endpoint);
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '打卡失败' };
    }
  },
};
