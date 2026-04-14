import { apiClient, type ApiResponse, getAuthToken } from './client';
import { API_ENDPOINTS, API_CONFIG } from './config';
import type { CircleListItem, CircleMoment } from '../features/circle/types';
import type { Buddy } from '../types/domain';

export const circlesApi = {
  // 获取所有圈子
  getAll: async (): Promise<ApiResponse<CircleListItem[]>> => {
    return apiClient.get<CircleListItem[]>(API_ENDPOINTS.CIRCLES);
  },

  // 根据 ID 获取单个圈子
  getById: async (id: string): Promise<ApiResponse<CircleListItem>> => {
    return apiClient.get<CircleListItem>(API_ENDPOINTS.CIRCLE_DETAIL(id));
  },

  // 加入圈子
  join: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean>(API_ENDPOINTS.CIRCLE_JOIN(id));
  },

  // 上传图片
  uploadImage: async (uri: string): Promise<ApiResponse<string>> => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await fetch(
        `${API_CONFIG.BASE_URL.replace('/api', '')}/api/circles/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
          },
          body: formData,
        },
      );

      const data = await response.json();
      return data;
    } catch (error: any) {
      return { success: false, error: error.message || '图片上传失败' };
    }
  },

  // 创建动态 (Moment)
  createMoment: async (data: Partial<CircleMoment>): Promise<ApiResponse<CircleMoment>> => {
    return apiClient.post<CircleMoment>(API_ENDPOINTS.CIRCLES, data);
  },

  // 获取附近推荐地点
  getNearbyLocations: async (): Promise<ApiResponse<any[]>> => {
    return apiClient.get<any[]>(API_ENDPOINTS.CIRCLES + '/locations/nearby');
  },

  // 获取热门话题
  getTrendingTopics: async (): Promise<ApiResponse<string[]>> => {
    return apiClient.get<string[]>(API_ENDPOINTS.CIRCLES + '/topics/trending');
  },

  // 点赞圈子动态
  likeCircle: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean>(API_ENDPOINTS.CIRCLE_DETAIL(id) + '/like');
  },

  // 取消点赞
  unlikeCircle: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(API_ENDPOINTS.CIRCLE_DETAIL(id) + '/like');
  },

  // 收藏圈子动态
  collectCircle: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean>(API_ENDPOINTS.CIRCLE_DETAIL(id) + '/collect');
  },

  // 取消收藏
  uncollectCircle: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(API_ENDPOINTS.CIRCLE_DETAIL(id) + '/collect');
  },
};

export const buddiesApi = {
  // 获取所有伙伴
  getAll: async (): Promise<ApiResponse<Buddy[]>> => {
    return apiClient.get<Buddy[]>(API_ENDPOINTS.BUDDIES);
  },
};
