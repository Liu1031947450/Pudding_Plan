import { useState, useCallback } from 'react';
import type { Plan } from '../types/domain';
import { planService } from '../services/planService';
import type { ApiResponse } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export const usePlanManagement = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(async (userId?: string, silent = false) => {
    const effectiveUserId = userId || currentUserId;
    if (!effectiveUserId) {
      setPlans([]);
      return;
    }

    if (!silent) {
      setLoading(true);
    }
    try {
      const response = await planService.getPlans(effectiveUserId);
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
  }, [currentUserId]);

  const handleCreatePlan = useCallback(
    async (planData: Omit<Plan, 'id'>, userId?: string): Promise<ApiResponse<Plan>> => {
      const effectiveUserId = userId || currentUserId;
      if (!effectiveUserId) {
        return { success: false, error: '当前用户未登录' };
      }

      const response = await planService.createPlan(planData, effectiveUserId);
      if (response.success) {
        await loadPlans(effectiveUserId);
      }
      return response;
    },
    [currentUserId, loadPlans],
  );

  const handleUpdatePlan = useCallback(
    async (id: string, planData: Partial<Plan>, userId?: string): Promise<ApiResponse<Plan>> => {
      const effectiveUserId = userId || currentUserId;
      if (!effectiveUserId) {
        return { success: false, error: '当前用户未登录' };
      }

      const response = await planService.updatePlan(id, planData, effectiveUserId);
      if (response.success) {
        await loadPlans(effectiveUserId);
      }
      return response;
    },
    [currentUserId, loadPlans],
  );

  const handleDeletePlan = useCallback(
    async (id: string, userId?: string): Promise<ApiResponse<boolean>> => {
      const effectiveUserId = userId || currentUserId;
      if (!effectiveUserId) {
        return { success: false, error: '当前用户未登录' };
      }

      const response = await planService.deletePlan(id, effectiveUserId);
      if (response.success) {
        await loadPlans(effectiveUserId);
      }
      return response;
    },
    [currentUserId, loadPlans],
  );

  const handleDeleteSelected = useCallback(
    async (userId?: string) => {
      const effectiveUserId = userId || currentUserId;
      if (!effectiveUserId) {
        return 0;
      }

      let deletedCount = 0;
      for (const id of selectedPlans) {
        const response = await planService.deletePlan(id, effectiveUserId);
        if (response.success) deletedCount++;
      }
      if (deletedCount > 0) {
        await loadPlans(effectiveUserId);
        setSelectedPlans(new Set());
        setIsManaging(false);
      }
      return deletedCount;
    },
    [currentUserId, selectedPlans, loadPlans],
  );

  const handleCheckIn = useCallback(
    async (id: string, date: string, userId?: string): Promise<ApiResponse<Plan>> => {
      const effectiveUserId = userId || currentUserId;
      if (!effectiveUserId) {
        return { success: false, error: '当前用户未登录' };
      }

      const response = await planService.checkInPlan(id, date, effectiveUserId);
      if (response.success) {
        await loadPlans(effectiveUserId);
      }
      return response;
    },
    [currentUserId, loadPlans],
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
