import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

export interface User {
  id: string;
  username: string;
  phone: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const authApi = {
  // 登录
  login: async (data: LoginRequest): Promise<ApiResponse<User>> => {
    try {
      return await apiClient.post<User>('/auth/login', data);
    } catch (error: any) {
      return { success: false, error: error.message || '登录失败' };
    }
  },

  // 注册
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    try {
      return await apiClient.post<User>('/auth/register', data);
    } catch (error: any) {
      return { success: false, error: error.message || '注册失败' };
    }
  },

  // 获取用户信息
  getUserInfo: async (id: string): Promise<ApiResponse<User>> => {
    try {
      return await apiClient.get<User>(`/auth/user?id=${id}`);
    } catch (error: any) {
      return { success: false, error: error.message || '获取用户信息失败' };
    }
  },
};