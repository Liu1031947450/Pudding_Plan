import type { Buddy, Circle } from '../types/domain';
import { circlesApi, buddiesApi } from '../api';

// Circle Service - handles circle and buddy operations
class CircleService {
  // Get all buddies
  async getBuddies(): Promise<Buddy[]> {
    const response = await buddiesApi.getAll();
    return response.data || [];
  }

  // Get all circles
  async getCircles(): Promise<Circle[]> {
    const response = await circlesApi.getAll();
    return response.data || [];
  }

  // Get circle by ID
  async getCircleById(id: string): Promise<Circle | undefined> {
    const response = await circlesApi.getById(id);
    return response.data;
  }

  // Join circle
  async joinCircle(circleId: string): Promise<boolean> {
    const response = await circlesApi.join(circleId);
    return response.success;
  }
}

// Export singleton instance
export const circleService = new CircleService();
