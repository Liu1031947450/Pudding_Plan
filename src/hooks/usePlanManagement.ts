import { useState, useCallback, useEffect } from 'react';
import type { Plan } from '../types/domain';
import { planService } from '../services/planService';
import type { ApiResponse } from '../api/client';

export const usePlanManagement = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(async (userId?: string, silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const response = await planService.getPlans(userId);
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  const handleCreatePlan = useCallback(
    async (planData: Omit<Plan, 'id'>, userId?: string): Promise<ApiResponse<Plan>> => {
      const response = await planService.createPlan(planData, userId);
      if (response.success) {
        await loadPlans();
      }
      return response;
    },
    [loadPlans],
  );

  const handleUpdatePlan = useCallback(
    async (id: string, planData: Partial<Plan>, userId?: string): Promise<ApiResponse<Plan>> => {
      const response = await planService.updatePlan(id, planData, userId);
      if (response.success) {
        await loadPlans();
      }
      return response;
    },
    [loadPlans],
  );

  const handleDeletePlan = useCallback(
    async (id: string, userId?: string): Promise<ApiResponse<boolean>> => {
      const response = await planService.deletePlan(id, userId);
      if (response.success) {
        await loadPlans(userId);
      }
      return response;
    },
    [loadPlans],
  );

  const handleDeleteSelected = useCallback(
    async (userId?: string) => {
      let deletedCount = 0;
      for (const id of selectedPlans) {
        const response = await planService.deletePlan(id, userId);
        if (response.success) deletedCount++;
      }
      if (deletedCount > 0) {
        await loadPlans(userId);
        setSelectedPlans(new Set());
        setIsManaging(false);
      }
      return deletedCount;
    },
    [selectedPlans, loadPlans],
  );

  const handleCheckIn = useCallback(
    async (id: string, date: string, userId?: string): Promise<ApiResponse<Plan>> => {
      const response = await planService.checkInPlan(id, date, userId);
      if (response.success) {
        await loadPlans(userId);
      }
      return response;
    },
    [loadPlans],
  );

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
    handleCheckIn,
  };
};
