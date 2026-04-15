import type { Buddy } from '../types/domain';
import type { CircleListItem, CircleMoment } from '../features/circle/types';
import { circlesApi, buddiesApi } from '../api';

// Circle Service - handles circle and buddy operations
class CircleService {
  // Get all buddies
  async getBuddies(): Promise<Buddy[]> {
    const response = await buddiesApi.getAll();
    return response.data || [];
  }

  // Get all circles
  async getCircles(): Promise<CircleListItem[]> {
    const response = await circlesApi.getAll();
    return response.data || [];
  }

  // Get circle by ID
  async getCircleById(id: string): Promise<CircleListItem | undefined> {
    const response = await circlesApi.getById(id);
    return response.data;
  }

  // Join circle
  async joinCircle(circleId: string): Promise<boolean> {
    const response = await circlesApi.join(circleId);
    return response.success;
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
}

// Export singleton instance
export const circleService = new CircleService();
