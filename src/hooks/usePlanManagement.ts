import { useState, useCallback } from 'react';
import type { Plan, PlanCheckInDetails } from '../types/domain';
import { planService } from '../services/planService';
import type { ApiResponse } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { cancelPlanReminders } from '../services/notificationScheduler';

export const usePlanManagement = () => {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadPlans = useCallback(
    async (userId?: string, silent = false) => {
      if (!userId && !currentUserId) {
        setPlans([]);
        return;
      }

      if (!silent) {
        setLoading(true);
      }
      try {
        const response = await planService.getPlans();
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
    },
    [currentUserId],
  );

  const handleCreatePlan = useCallback(
    async (
      planData: Omit<Plan, 'id'>,
      userId?: string,
    ): Promise<ApiResponse<Plan>> => {
      if (!userId && !currentUserId) {
        return { success: false, error: '当前用户未登录' };
      }

      const response = await planService.createPlan(planData);
      if (response.success) {
        await loadPlans(currentUserId);
      }
      return response;
    },
    [currentUserId, loadPlans],
  );

  const handleUpdatePlan = useCallback(
    async (
      id: string,
      planData: Partial<Plan>,
      userId?: string,
    ): Promise<ApiResponse<Plan>> => {
      if (!userId && !currentUserId) {
        return { success: false, error: '当前用户未登录' };
      }

      const response = await planService.updatePlan(id, planData);
      if (response.success) {
        await loadPlans(currentUserId);
      }
      return response;
    },
    [currentUserId, loadPlans],
  );

  const handleDeletePlan = useCallback(
    async (id: string, userId?: string): Promise<ApiResponse<boolean>> => {
      if (!userId && !currentUserId) {
        return { success: false, error: '当前用户未登录' };
      }

      const response = await planService.deletePlan(id);
      if (response.success) {
        // 取消该计划关联的所有系统通知
        await cancelPlanReminders(id);
        await loadPlans(currentUserId);
      }
      return response;
    },
    [currentUserId, loadPlans],
  );

  const handleDeleteSelected = useCallback(
    async (userId?: string) => {
      if (!userId && !currentUserId) {
        return 0;
      }

      let deletedCount = 0;
      for (const id of selectedPlans) {
        const response = await planService.deletePlan(id);
        if (response.success) {
          await cancelPlanReminders(id);
          deletedCount++;
        }
      }
      if (deletedCount > 0) {
        await loadPlans(currentUserId);
        setSelectedPlans(new Set());
        setIsManaging(false);
      }
      return deletedCount;
    },
    [currentUserId, selectedPlans, loadPlans],
  );

  const handleCheckIn = useCallback(
    async (
      id: string,
      date: string,
      details?: PlanCheckInDetails,
    ): Promise<ApiResponse<Plan>> => {
      if (!currentUserId) {
        return { success: false, error: '当前用户未登录' };
      }

      const response = await planService.checkInPlan(id, date, details);
      if (response.success) {
        await loadPlans(currentUserId);
      }
      return response;
    },
    [currentUserId, loadPlans],
  );

  const handleReorderPlans = useCallback(
    async (newOrder: Plan[]) => {
      setPlans(newOrder);
      const response = await planService.reorderPlans(
        newOrder.map(plan => plan.id),
      );
      if (!response.success) {
        await loadPlans(currentUserId, true);
      }
      return response;
    },
    [currentUserId, loadPlans],
  );

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
