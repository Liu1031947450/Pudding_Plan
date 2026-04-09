import type { Plan } from '../types/domain';
import { mockPlans } from '../data/mockData';

// Plan Service - handles all plan-related operations
class PlanService {
  private plans: Plan[] = [...mockPlans];

  // Get all plans
  getPlans(): Plan[] {
    return this.plans;
  }

  // Get plan by ID
  getPlanById(id: string): Plan | undefined {
    return this.plans.find(plan => plan.id === id);
  }

  // Create new plan
  createPlan(plan: Omit<Plan, 'id'>): Plan {
    const newPlan: Plan = {
      ...plan,
      id: Date.now().toString(),
    };
    this.plans.push(newPlan);
    return newPlan;
  }

  // Update plan
  updatePlan(id: string, updates: Partial<Plan>): Plan | undefined {
    const index = this.plans.findIndex(plan => plan.id === id);
    if (index === -1) return undefined;

    this.plans[index] = { ...this.plans[index], ...updates };
    return this.plans[index];
  }

  // Delete plan
  deletePlan(id: string): boolean {
    const index = this.plans.findIndex(plan => plan.id === id);
    if (index === -1) return false;

    this.plans.splice(index, 1);
    return true;
  }

  // Delete multiple plans
  deletePlans(ids: string[]): number {
    const idsSet = new Set(ids);
    const initialLength = this.plans.length;
    this.plans = this.plans.filter(plan => !idsSet.has(plan.id));
    return initialLength - this.plans.length;
  }

  // Reorder plans
  reorderPlans(newOrder: Plan[]): void {
    this.plans = newOrder;
  }
}

// Export singleton instance
export const planService = new PlanService();
