import type { Buddy } from '../types/domain';
import type { CircleListItem } from '../features/circle/types';
import { circlesApi, buddiesApi } from '../api';
import type { ApiResponse } from '../api/client';

// Circle Service - handles circle and buddy operations
class CircleService {
  // Get all buddies
  async getBuddies(): Promise<ApiResponse<Buddy[]>> {
    return buddiesApi.getRecommendations();
  }

  // Get all circles
  async getCircles(): Promise<ApiResponse<CircleListItem[]>> {
    return circlesApi.getAll();
  }

  // Get circle by ID
  async getCircleById(id: string): Promise<CircleListItem | undefined> {
    const response = await circlesApi.getById(id);
    return response.data;
  }

  // Toggle like status
  async toggleLikeCircle(circle: CircleListItem): Promise<boolean> {
    // circle.isLiked is the NEW state from the UI
    const response = circle.isLiked
      ? await circlesApi.likeCircle(circle.id)
      : await circlesApi.unlikeCircle(circle.id);
    return response.success;
  }

  // Toggle collect status
  async toggleCollectCircle(circle: CircleListItem): Promise<boolean> {
    // circle.isCollected is the NEW state from the UI
    const response = circle.isCollected
      ? await circlesApi.collectCircle(circle.id)
      : await circlesApi.uncollectCircle(circle.id);
    return response.success;
  }

  // Toggle follow status
  async toggleFollowBuddy(
    userId: string,
    isFollowing: boolean,
  ): Promise<boolean> {
    const response = isFollowing
      ? await circlesApi.unfollowUser(userId)
      : await circlesApi.followUser(userId);
    return response.success;
  }

  // Get likers for a moment
  async getLikers(id: string) {
    const response = await circlesApi.getLikers(id);
    return response.data || [];
  }

  // Get comments for a moment
  async getComments(id: string) {
    const response = await circlesApi.getComments(id);
    return response.data || [];
  }

  // Post a comment
  async postComment(id: string, content: string, parentId?: string) {
    const response = await circlesApi.postComment(id, content, parentId);
    return response;
  }

  // Get user collections
  async getCollections() {
    const response = await circlesApi.getCollections();
    return response;
  }
}

// Export singleton instance
export const circleService = new CircleService();
