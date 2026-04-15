import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
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
      if (!uri || typeof uri !== 'string') {
        return { success: false, error: '无效的图片路径' };
      }

      const normalizedUri = uri.trim();
      if (!normalizedUri) {
        return { success: false, error: '无效的图片路径' };
      }

      const formData = new FormData();
      const filename = normalizedUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const extension = (match?.[1] || 'jpeg').toLowerCase();
      const normalizedExtension = extension === 'jpg' ? 'jpeg' : extension;
      const type = `image/${normalizedExtension}`;

      formData.append('image', {
        uri: normalizedUri,
        name: filename,
        type,
      } as any);

      return apiClient.post<string>(
        API_ENDPOINTS.CIRCLES + '/upload',
        formData,
      );
    } catch (error: any) {
      return { success: false, error: error.message || '图片上传失败' };
    }
  },

  // 创建动态 (Moment)
  createMoment: async (
    data: Partial<CircleMoment>,
  ): Promise<ApiResponse<CircleMoment>> => {
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
    return apiClient.post<boolean>(
      API_ENDPOINTS.CIRCLE_DETAIL(id) + '/collect',
    );
  },

  // 取消收藏
  uncollectCircle: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(
      API_ENDPOINTS.CIRCLE_DETAIL(id) + '/collect',
    );
  },

  // 关注用户
  followUser: async (userId: string): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean>(`/auth/follow/${userId}`);
  },

  // 取消关注
  unfollowUser: async (userId: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/auth/follow/${userId}`);
  },

  // 获取点赞列表
  getLikers: async (id: string): Promise<ApiResponse<any[]>> => {
    return apiClient.get<any[]>(API_ENDPOINTS.CIRCLE_DETAIL(id) + '/likers');
  },

  // 获取评论列表
  getComments: async (id: string): Promise<ApiResponse<any[]>> => {
    return apiClient.get<any[]>(API_ENDPOINTS.CIRCLE_DETAIL(id) + '/comments');
  },

  // 发表评论
  postComment: async (
    id: string,
    content: string,
    parentId?: string,
  ): Promise<ApiResponse<{ id: number }>> => {
    return apiClient.post<{ id: number }>(
      API_ENDPOINTS.CIRCLE_DETAIL(id) + '/comments',
      { content, parentId },
    );
  },
};

export const buddiesApi = {
  // 获取所有伙伴
  getAll: async (): Promise<ApiResponse<Buddy[]>> => {
    return apiClient.get<Buddy[]>(API_ENDPOINTS.BUDDIES);
  },
};
