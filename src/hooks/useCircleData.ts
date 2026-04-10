import { useState, useEffect, useCallback } from 'react';
import type { Buddy, Circle } from '../types/domain';
import { circleService } from '../services/circleService';

export const useCircleData = () => {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [buddiesData, circlesData] = await Promise.all([
        circleService.getBuddies(),
        circleService.getCircles(),
      ]);
      setBuddies(buddiesData);
      setCircles(circlesData);
    } catch (error) {
      console.error('Failed to load circle data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const joinCircle = useCallback(async (circleId: string) => {
    const success = await circleService.joinCircle(circleId);
    if (success) {
      await loadData();
    }
    return success;
  }, [loadData]);

  return {
    buddies,
    circles,
    loading,
    joinCircle,
    refreshData: loadData,
  };
};
