import type { Plan } from '../types/domain';
import { plansApi } from '../api';
import type { ApiResponse } from '../api/client';

// Plan Service - handles all plan-related operations
class PlanService {
  // Get all plans
  async getPlans(userId?: string): Promise<ApiResponse<Plan[]>> {
    return await plansApi.getAll(userId);
  }

  // Get plan by ID
  async getPlanById(id: string, userId?: string): Promise<ApiResponse<Plan>> {
    return await plansApi.getById(id, userId);
  }

  // Create new plan
  async createPlan(
    plan: Omit<Plan, 'id'>,
    userId?: string,
  ): Promise<ApiResponse<Plan>> {
    return await plansApi.create(plan, userId);
  }

  // Update plan
  async updatePlan(
    id: string,
    updates: Partial<Plan>,
    userId?: string,
  ): Promise<ApiResponse<Plan>> {
    return await plansApi.update(id, updates, userId);
  }

  // Delete plan
  async deletePlan(id: string, userId?: string): Promise<ApiResponse<boolean>> {
    return await plansApi.delete(id, userId);
  }

  // Check in plan
  async checkInPlan(
    id: string,
    date: string,
    userId?: string,
  ): Promise<ApiResponse<Plan>> {
    return await plansApi.checkIn(id, date, userId);
  }
}

// Export singleton instance
export const planService = new PlanService();
