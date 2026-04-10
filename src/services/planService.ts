import type { Plan } from '../types/domain';
import { plansApi } from '../api';

// Plan Service - handles all plan-related operations
class PlanService {
  // Get all plans
  async getPlans(): Promise<Plan[]> {
    const response = await plansApi.getAll();
    return response.data || [];
  }

  // Get plan by ID
  async getPlanById(id: string): Promise<Plan | undefined> {
    const response = await plansApi.getById(id);
    return response.data;
  }

  // Create new plan
  async createPlan(plan: Omit<Plan, 'id'>): Promise<Plan | undefined> {
    const response = await plansApi.create(plan);
    return response.data;
  }

  // Update plan
  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    const response = await plansApi.update(id, updates);
    return response.data;
  }

  // Delete plan
  async deletePlan(id: string): Promise<boolean> {
    const response = await plansApi.delete(id);
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
