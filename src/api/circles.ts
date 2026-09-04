import { apiClient, type ApiResponse } from './client';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from './config';
import type { CircleListItem, CircleMoment } from '../features/circle/types';
import type { Buddy } from '../types/domain';
import type { BlockedUser, BuddyRelationship } from '../types/domain';

export const circlesApi = {
  // 获取所有圈子
  getAll: async (): Promise<ApiResponse<CircleListItem[]>> => {
    return apiClient.get<CircleListItem[]>(API_ENDPOINTS.CIRCLES);
  },

  // 根据 ID 获取单个圈子
  getById: async (id: string): Promise<ApiResponse<CircleListItem>> => {
    return apiClient.get<CircleListItem>(API_ENDPOINTS.CIRCLE_DETAIL(id));
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
      if (Platform.OS === 'web') {
        const blob = await fetch(normalizedUri).then(response =>
          response.blob(),
        );
        (formData as any).append('image', blob, 'moment.jpg');
      } else {
        const filename = normalizedUri.split('/').pop() || 'photo.jpg';
        const extension = (
          /\.(\w+)$/.exec(filename)?.[1] || 'jpeg'
        ).toLowerCase();
        formData.append('image', {
          uri: normalizedUri,
          name: filename,
          type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        } as any);
      }

      return apiClient.post<string>(
        API_ENDPOINTS.CIRCLES + '/upload',
        formData,
      );
    } catch (error: any) {
      return { success: false, error: error.message || '图片上传失败' };
    }
  },

  cleanupUploads: (images: string[]): Promise<ApiResponse<boolean>> =>
    apiClient.delete(`${API_ENDPOINTS.CIRCLES}/upload`, { images }),

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
    return apiClient.post<boolean>(`/users/${userId}/follow`);
  },

  // 取消关注
  unfollowUser: async (userId: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/users/${userId}/follow`);
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

  // 获取用户收藏列表
  getCollections: async (): Promise<ApiResponse<CircleListItem[]>> => {
    return apiClient.get<CircleListItem[]>(
      API_ENDPOINTS.CIRCLES + '/collections',
    );
  },

  deleteMoment: (id: string): Promise<ApiResponse<boolean>> =>
    apiClient.delete(API_ENDPOINTS.CIRCLE_DETAIL(id)),

  deleteComment: (
    momentId: string,
    commentId: string,
  ): Promise<ApiResponse<boolean>> =>
    apiClient.delete(
      `${API_ENDPOINTS.CIRCLE_DETAIL(momentId)}/comments/${commentId}`,
    ),

  report: (
    targetType: 'moment' | 'comment',
    targetId: string,
    reason: 'spam' | 'harassment' | 'inappropriate' | 'other',
    detail?: string,
  ): Promise<ApiResponse<{ id: string }>> =>
    apiClient.post(API_ENDPOINTS.REPORTS, {
      targetType,
      targetId,
      reason,
      detail,
    }),
};

export const buddiesApi = {
  getAll: (): Promise<ApiResponse<BuddyRelationship[]>> =>
    apiClient.get(API_ENDPOINTS.BUDDIES),
  getRecommendations: (): Promise<ApiResponse<Buddy[]>> =>
    apiClient.get(API_ENDPOINTS.BUDDY_RECOMMENDATIONS),
  getRequests: (): Promise<
    ApiResponse<{
      incoming: BuddyRelationship[];
      outgoing: BuddyRelationship[];
      buddies: BuddyRelationship[];
    }>
  > => apiClient.get(API_ENDPOINTS.BUDDY_REQUESTS),
  request: (userId: string): Promise<ApiResponse<{ id: string }>> =>
    apiClient.post(API_ENDPOINTS.BUDDY_REQUESTS, { userId }),
  accept: (id: string): Promise<ApiResponse<BuddyRelationship>> =>
    apiClient.post(`${API_ENDPOINTS.BUDDIES}/${id}/accept`),
  reject: (id: string): Promise<ApiResponse<boolean>> =>
    apiClient.post(`${API_ENDPOINTS.BUDDIES}/${id}/reject`),
  cancel: (id: string): Promise<ApiResponse<boolean>> =>
    apiClient.delete(`${API_ENDPOINTS.BUDDY_REQUESTS}/${id}`),
  remove: (id: string): Promise<ApiResponse<boolean>> =>
    apiClient.delete(`${API_ENDPOINTS.BUDDIES}/${id}`),
  encourage: (id: string): Promise<ApiResponse<boolean>> =>
    apiClient.post(`${API_ENDPOINTS.BUDDIES}/${id}/encouragement`),
};

export const blocksApi = {
  getAll: (): Promise<ApiResponse<BlockedUser[]>> =>
    apiClient.get(API_ENDPOINTS.BLOCKS),
  block: (userId: string): Promise<ApiResponse<boolean>> =>
    apiClient.post(API_ENDPOINTS.BLOCKS, { userId }),
  unblock: (userId: string): Promise<ApiResponse<boolean>> =>
    apiClient.delete(`${API_ENDPOINTS.BLOCKS}/${userId}`),
};
