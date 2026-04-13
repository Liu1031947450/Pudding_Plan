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
    const response = circle.isLiked
      ? await circlesApi.unlikeCircle(circle.id)
      : await circlesApi.likeCircle(circle.id);
    return response.success;
  }

  // Toggle collect status
  async toggleCollectCircle(circle: CircleListItem): Promise<boolean> {
    const response = circle.isCollected
      ? await circlesApi.uncollectCircle(circle.id)
      : await circlesApi.collectCircle(circle.id);
    return response.success;
  }
}

// Export singleton instance
export const circleService = new CircleService();
