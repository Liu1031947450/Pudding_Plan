import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import type { Plan, PlanCheckInDetails } from '../types/domain';

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
  create: async (plan: Omit<Plan, 'id'>): Promise<ApiResponse<Plan>> => {
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
      const safeUpdates = { ...updates };
      delete safeUpdates.completedDate;
      delete safeUpdates.checkInRecords;
      const response = await apiClient.put<Plan>(
        API_ENDPOINTS.PLAN_DETAIL(id),
        safeUpdates,
      );
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '更新计划失败' };
    }
  },

  // 删除计划（依赖 token 鉴权）
  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      const response = await apiClient.delete<boolean>(
        API_ENDPOINTS.PLAN_DETAIL(id),
      );
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '删除计划失败' };
    }
  },

  reorder: async (planIds: string[]): Promise<ApiResponse<boolean>> => {
    return apiClient.put<boolean>(API_ENDPOINTS.PLAN_REORDER, { planIds });
  },

  // 计划打卡（依赖 token 鉴权）
  checkIn: async (
    id: string,
    date: string,
    details?: PlanCheckInDetails,
  ): Promise<ApiResponse<Plan>> => {
    try {
      const response = await apiClient.post<Plan>(
        `${API_ENDPOINTS.PLAN_CHECK_IN(id)}?date=${encodeURIComponent(date)}`,
        details,
      );
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || '打卡失败' };
    }
  },

  removeCheckIn: async (id: string, date: string): Promise<ApiResponse<Plan>> =>
    apiClient.delete<Plan>(API_ENDPOINTS.PLAN_CHECK_IN_DATE(id, date)),
};
