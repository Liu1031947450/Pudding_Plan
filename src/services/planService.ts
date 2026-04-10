import type { Plan } from '../types/domain';
import { plansApi } from '../api';

// Plan Service - handles all plan-related operations
class PlanService {
  // Get all plans
  async getPlans(userId?: string): Promise<Plan[]> {
    const response = await plansApi.getAll(userId);
    return response.data || [];
  }

  // Get plan by ID
  async getPlanById(id: string, userId?: string): Promise<Plan | undefined> {
    const response = await plansApi.getById(id, userId);
    return response.data;
  }

  // Create new plan
  async createPlan(plan: Omit<Plan, 'id'>, userId?: string): Promise<Plan | undefined> {
    const response = await plansApi.create(plan, userId);
    return response.data;
  }

  // Update plan
  async updatePlan(
    id: string,
    updates: Partial<Plan>,
    userId?: string,
  ): Promise<Plan | undefined> {
    const response = await plansApi.update(id, updates, userId);
    return response.data;
  }

  // Delete plan
  async deletePlan(id: string, userId?: string): Promise<boolean> {
    const response = await plansApi.delete(id, userId);
    return response.success;
  }

  // Check in plan
  async checkInPlan(id: string): Promise<Plan | undefined> {
    const response = await plansApi.checkIn(id);
    return response.data;
  }
}

// Export singleton instance
export const planService = new PlanService();
