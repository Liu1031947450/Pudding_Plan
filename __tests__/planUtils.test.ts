import {
  getCompletedDays,
  getProgress,
  getCurrentStreak,
  getLongestStreak,
  isStreakBroken,
} from '../src/utils/planUtils';
import type { Plan } from '../src/types/domain';

// Helper to create a partial Plan object mock
const createMockPlan = (completedDate: string[], totalDays = 30): Plan => {
  return {
    id: '1',
    userId: '1',
    title: 'Test Plan',
    totalDays,
    completedDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Plan;
};

describe('planUtils', () => {
  describe('getCompletedDays', () => {
    it('should return 0 for empty completedDate', () => {
      const plan = createMockPlan([]);
      expect(getCompletedDays(plan)).toBe(0);
    });

    it('should return count of items in completedDate', () => {
      const plan = createMockPlan(['2026-06-01', '2026-06-02']);
      expect(getCompletedDays(plan)).toBe(2);
    });
  });

  describe('getProgress', () => {
    it('should calculate progress percentage correctly', () => {
      const plan = createMockPlan(['2026-06-01', '2026-06-02'], 10);
      expect(getProgress(plan)).toBe(20);
    });

    it('should cap progress percentage at 100', () => {
      const plan = createMockPlan(
        ['2026-06-01', '2026-06-02', '2026-06-03'],
        2
      );
      expect(getProgress(plan)).toBe(100);
    });
  });

  describe('getLongestStreak', () => {
    it('should return 0 for no completions', () => {
      const plan = createMockPlan([]);
      expect(getLongestStreak(plan)).toBe(0);
    });

    it('should calculate longest consecutive streak correctly', () => {
      const plan = createMockPlan([
        '2026-06-01',
        '2026-06-02',
        '2026-06-03', // 3 days streak
        '2026-06-05',
        '2026-06-06', // 2 days streak
      ]);
      expect(getLongestStreak(plan)).toBe(3);
    });
  });
});
