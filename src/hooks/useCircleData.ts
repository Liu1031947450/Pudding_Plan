import { useState, useEffect } from 'react';
import type { Buddy, Circle } from '../types/domain';
import { circleService } from '../services/circleService';

export const useCircleData = () => {
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      try {
        const buddiesData = circleService.getBuddies();
        const circlesData = circleService.getCircles();
        setBuddies(buddiesData);
        setCircles(circlesData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const joinCircle = (circleId: string) => {
    return circleService.joinCircle(circleId);
  };

  return {
    buddies,
    circles,
    loading,
    joinCircle,
  };
};
