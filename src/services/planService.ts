import type { Plan, PlanCheckInDetails } from '../types/domain';
import { plansApi } from '../api';
import type { ApiResponse } from '../api/client';

// Plan Service - handles all plan-related operations
class PlanService {
  // Get all plans（依赖 token 鉴权）
  async getPlans(): Promise<ApiResponse<Plan[]>> {
    return await plansApi.getAll();
  }

  // Get plan by ID（依赖 token 鉴权）
  async getPlanById(id: string): Promise<ApiResponse<Plan>> {
    return await plansApi.getById(id);
  }

  // Create new plan（依赖 token 鉴权）
  async createPlan(plan: Omit<Plan, 'id'>): Promise<ApiResponse<Plan>> {
    return await plansApi.create(plan);
  }

  // Update plan（依赖 token 鉴权）
  async updatePlan(
    id: string,
    updates: Partial<Plan>,
  ): Promise<ApiResponse<Plan>> {
    return await plansApi.update(id, updates);
  }

  // Delete plan（依赖 token 鉴权）
  async deletePlan(id: string): Promise<ApiResponse<boolean>> {
    return await plansApi.delete(id);
  }

  async reorderPlans(planIds: string[]): Promise<ApiResponse<boolean>> {
    return await plansApi.reorder(planIds);
  }

  // Check in plan（依赖 token 鉴权）
  async checkInPlan(
    id: string,
    date: string,
    details?: PlanCheckInDetails,
  ): Promise<ApiResponse<Plan>> {
    return await plansApi.checkIn(id, date, details);
  }

  async removeCheckIn(id: string, date: string): Promise<ApiResponse<Plan>> {
    return plansApi.removeCheckIn(id, date);
  }
}

// Export singleton instance
export const planService = new PlanService();
