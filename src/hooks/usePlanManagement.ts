import { useState, useCallback } from 'react';
import type { Plan } from '../types/domain';
import { planService } from '../services/planService';

export const usePlanManagement = () => {
  const [plans, setPlans] = useState<Plan[]>(planService.getPlans());
  const [isManaging, setIsManaging] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());

  const handleCreatePlan = useCallback((planData: Omit<Plan, 'id'>) => {
    const newPlan = planService.createPlan(planData);
    setPlans(planService.getPlans());
    return newPlan;
  }, []);

  const handleDeletePlan = useCallback((id: string) => {
    const success = planService.deletePlan(id);
    if (success) {
      setPlans(planService.getPlans());
    }
    return success;
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const deletedCount = planService.deletePlans(Array.from(selectedPlans));
    if (deletedCount > 0) {
      setPlans(planService.getPlans());
      setSelectedPlans(new Set());
      setIsManaging(false);
    }
    return deletedCount;
  }, [selectedPlans]);

  const handleReorderPlans = useCallback((newOrder: Plan[]) => {
    planService.reorderPlans(newOrder);
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
    isManaging,
    selectedPlans,
    handleCreatePlan,
    handleDeletePlan,
    handleDeleteSelected,
    handleReorderPlans,
    toggleManageMode,
    togglePlanSelection,
  };
};
