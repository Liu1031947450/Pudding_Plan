import { useState, useEffect, useCallback } from 'react';
import type { Buddy } from '../types/domain';
import type { CircleListItem } from '../features/circle/types';
import { circleService } from '../services/circleService';

export const useCircleData = () => {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [circles, setCircles] = useState<CircleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [buddiesResponse, circlesResponse] = await Promise.all([
        circleService.getBuddies(),
        circleService.getCircles(),
      ]);
      if (buddiesResponse.success) {
        setBuddies(buddiesResponse.data || []);
      }
      if (circlesResponse.success) {
        setCircles(circlesResponse.data || []);
      }
      if (!buddiesResponse.success || !circlesResponse.success) {
        setError(
          circlesResponse.error ||
            buddiesResponse.error ||
            '圈子内容加载失败，请重试',
        );
      }
    } catch (caught) {
      console.error('Failed to load circle data:', caught);
      setError('圈子内容加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleLikeCircle = useCallback(
    async (circleId: string): Promise<CircleListItem | null> => {
      const targetCircle = circles.find(circle => circle.id === circleId);
      if (!targetCircle) return null;

      const nextLiked = !targetCircle.isLiked;
      const success = await circleService.toggleLikeCircle(targetCircle);
      if (!success) return null;

      let updatedCircle: CircleListItem | null = null;
      setCircles(prev =>
        prev.map(circle => {
          if (circle.id !== circleId) return circle;
          updatedCircle = {
            ...circle,
            isLiked: nextLiked,
            likes:
              circle.type === 'waterfall'
                ? Math.max(0, (circle.likes || 0) + (nextLiked ? 1 : -1))
                : undefined,
          } as CircleListItem;
          return updatedCircle;
        }),
      );

      return updatedCircle;
    },
    [circles],
  );

  const toggleCollectCircle = useCallback(
    async (circleId: string): Promise<CircleListItem | null> => {
      const targetCircle = circles.find(circle => circle.id === circleId);
      if (!targetCircle) return null;

      const nextCollected = !targetCircle.isCollected;
      const success = await circleService.toggleCollectCircle(targetCircle);
      if (!success) return null;

      let updatedCircle: CircleListItem | null = null;
      setCircles(prev =>
        prev.map(circle => {
          if (circle.id !== circleId) return circle;
          updatedCircle = {
            ...circle,
            isCollected: nextCollected,
          };
          return updatedCircle;
        }),
      );

      return updatedCircle;
    },
    [circles],
  );

  return {
    buddies,
    circles,
    loading,
    error,
    refreshData: loadData,
    toggleLikeCircle,
    toggleCollectCircle,
  };
};
