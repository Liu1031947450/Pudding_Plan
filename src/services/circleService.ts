import type { Buddy, Circle } from '../types/domain';
import { mockBuddies, mockCircles } from '../data/mockData';

// Circle Service - handles circle and buddy operations
class CircleService {
  private buddies: Buddy[] = [...mockBuddies];
  private circles: Circle[] = [...mockCircles];

  // Get all buddies
  getBuddies(): Buddy[] {
    return this.buddies;
  }

  // Get all circles
  getCircles(): Circle[] {
    return this.circles;
  }

  // Get circle by ID
  getCircleById(id: string): Circle | undefined {
    return this.circles.find(circle => circle.id === id);
  }

  // Join circle
  joinCircle(circleId: string): boolean {
    const circle = this.circles.find(c => c.id === circleId);
    if (!circle) return false;
    // TODO: Implement join logic
    return true;
  }
}

// Export singleton instance
export const circleService = new CircleService();
