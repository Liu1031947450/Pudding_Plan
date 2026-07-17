import { apiClient, type ApiResponse } from './client';

export interface User {
  id: string;
  username: string;
  phone: string;
  /** 用户头像 URL，最大长度 1000 字符 */
  avatar?: string;
  bio?: string;
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

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserStats {
  streakDays: number;
  totalCheckIns: number;
  healingPlans: number;
  totalHabits: number;
  totalPlans: number;
  socialStats?: {
    moments: number;
    likes: number;
    collects: number;
    friends: number;
  };
  checkInRecords?: { date: string; planTitles: string[]; count: number }[];
}

export const authApi = {
  // 登录
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      return await apiClient.post<AuthResponse>('/auth/login', data, {
        skipAuth: true,
      });
    } catch (error: any) {
      return { success: false, error: error.message || '登录失败' };
    }
  },

  // 注册
  register: async (
    data: RegisterRequest,
  ): Promise<ApiResponse<AuthResponse>> => {
    try {
      return await apiClient.post<AuthResponse>('/auth/register', data, {
        skipAuth: true,
      });
    } catch (error: any) {
      return { success: false, error: error.message || '注册失败' };
    }
  },

  logout: async (): Promise<ApiResponse<void>> => {
    return apiClient.post<void>('/auth/logout');
  },

  clearData: async (): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>('/auth/data');
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      return await apiClient.get<User>('/auth/me');
    } catch (error: any) {
      return { success: false, error: error.message || '获取用户信息失败' };
    }
  },

  // 更新用户资料
  updateProfile: async (data: {
    username: string;
    /** 用户头像 URL，最大长度 1000 字符 */
    avatar?: string;
    bio?: string;
  }): Promise<ApiResponse<User>> => {
    try {
      return await apiClient.put<User>('/auth/me', data);
    } catch (error: any) {
      return { success: false, error: error.message || '更新资料失败' };
    }
  },

  // 获取当前用户统计
  getCurrentUserStats: async (): Promise<ApiResponse<UserStats>> => {
    try {
      return await apiClient.get<UserStats>('/auth/stats');
    } catch (error: any) {
      return { success: false, error: error.message || '获取用户统计失败' };
    }
  },
};
