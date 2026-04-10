import { useState, useCallback, useEffect } from 'react';
import type { Plan } from '../types/domain';
import { planService } from '../services/planService';

export const usePlanManagement = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(async (userId?: string) => {
    setLoading(true);
    try {
      const data = await planService.getPlans(userId);
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreatePlan = useCallback(
    async (planData: Omit<Plan, 'id'>, userId?: string) => {
      const newPlan = await planService.createPlan(planData, userId);
      if (newPlan) {
        await loadPlans();
      }
      return newPlan;
    },
    [loadPlans],
  );

  const handleUpdatePlan = useCallback(
    async (id: string, planData: Partial<Plan>, userId?: string) => {
      const updatedPlan = await planService.updatePlan(id, planData, userId);
      if (updatedPlan) {
        await loadPlans();
      }
      return updatedPlan;
    },
    [loadPlans],
  );

  const handleDeletePlan = useCallback(
    async (id: string, userId?: string) => {
      const success = await planService.deletePlan(id, userId);
      if (success) {
        await loadPlans(userId);
      }
      return success;
    },
    [loadPlans],
  );

  const handleDeleteSelected = useCallback(async (userId?: string) => {
    let deletedCount = 0;
    for (const id of selectedPlans) {
      const success = await planService.deletePlan(id, userId);
      if (success) deletedCount++;
    }
    if (deletedCount > 0) {
      await loadPlans(userId);
      setSelectedPlans(new Set());
      setIsManaging(false);
    }
    return deletedCount;
  }, [selectedPlans, loadPlans]);

  const handleReorderPlans = useCallback((newOrder: Plan[]) => {
    setPlans(newOrder);
  }, []);

  const toggleManageMode = useCallback(() => {
    setIsManaging(prev => !prev);
    setSelectedPlans(new Set());
  }, []);

  const togglePlanSelection = useCallback((id: string) => {
    setSelectedPlans(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  return {
    plans,
    loading,
    isManaging,
    selectedPlans,
    handleCreatePlan,
    handleUpdatePlan,
    handleDeletePlan,
    handleDeleteSelected,
    handleReorderPlans,
    toggleManageMode,
    togglePlanSelection,
    refreshPlans: loadPlans,
  };
};
