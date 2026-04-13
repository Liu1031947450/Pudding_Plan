import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { mockApiServer } from './mock-server';
import type { Circle, Buddy } from '../types/domain';

const USE_MOCK = true;

export const circlesApi = {
  // 获取所有圈子
  getAll: async (): Promise<ApiResponse<Circle[]>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.circles.getAll();
        console.log(
          '[Mock API] circlesApi.getAll - 获取所有圈子',
          response.data,
        );
        return { success: true, data: response.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Circle[]>(API_ENDPOINTS.CIRCLES);
  },

  // 根据 ID 获取单个圈子
  getById: async (id: string): Promise<ApiResponse<Circle>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.circles.getById(id);
        const data = response.data;
        if (!data) {
          return { success: false, error: '未找到圈子' };
        }
        console.log('[Mock API] circlesApi.getById - 获取单个圈子详情', data);
        return { success: true, data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Circle>(API_ENDPOINTS.CIRCLE_DETAIL(id));
  },

  // 加入圈子
  join: async (id: string): Promise<ApiResponse<boolean>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.circles.join(id);
        if (!response.data) {
          return { success: false, error: '未找到圈子' };
        }
        console.log('[Mock API] circlesApi.join - 加入圈子', id);
        return { success: true, data: true, message: '加入圈子成功' };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<boolean>(API_ENDPOINTS.CIRCLE_JOIN(id));
  },

  // 上传图片 (Mock)
  uploadImage: async (uri: string): Promise<ApiResponse<string>> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[Mock API] circlesApi.uploadImage - 上传图片成功:', uri);
    // 返回传入的 uri 作为模拟的上传路径
    return { success: true, data: uri };
  },

  // 创建动态 (Moment)
  createMoment: async (data: Partial<Circle>): Promise<ApiResponse<Circle>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.circles.create(data);
        return { success: true, data: response.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.post<Circle>(API_ENDPOINTS.CIRCLES, data);
  },

  // 获取附近推荐地点
  getNearbyLocations: async (): Promise<ApiResponse<any[]>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.circles.getNearby();
        return { success: true, data: response.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    // 实际项目中可能调用位置服务接口
    return { success: true, data: [] };
  },

  // 获取热门话题
  getTrendingTopics: async (): Promise<ApiResponse<string[]>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.circles.getTrendingTopics();
        return { success: true, data: response.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return { success: true, data: [] };
  },
};

export const buddiesApi = {
  // 获取所有伙伴
  getAll: async (): Promise<ApiResponse<Buddy[]>> => {
    if (USE_MOCK) {
      try {
        const response = await mockApiServer.buddies.getAll();
        console.log(
          '[Mock API] buddiesApi.getAll - 获取所有伙伴',
          response.data,
        );
        return { success: true, data: response.data };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }
    return apiClient.get<Buddy[]>(API_ENDPOINTS.BUDDIES);
  },
};
