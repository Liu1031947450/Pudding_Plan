import type { Plan } from '../types/domain';
import { formatLocalDate, addLocalDays, parseLocalDate } from './date';

// ─────────────────────────────────────────────
//  内部辅助：把日期字符串统一为 'YYYY-MM-DD'
// ─────────────────────────────────────────────
const yesterday = (dateStr: string): string => addLocalDays(dateStr, -1);

// ─────────────────────────────────────────────
//  基础查询
// ─────────────────────────────────────────────

/** 获取已打卡总天数（completedDate 为服务端打卡记录的兼容投影） */
export const getCompletedDays = (plan: Plan): number =>
  plan.completedDate.length;

/** 获取进度百分比（0-100） */
export const getProgress = (plan: Plan): number =>
  Math.min(100, Math.round((getCompletedDays(plan) / plan.totalDays) * 100));

/** 是否在指定日期打卡 */
export const hasCheckedIn = (plan: Plan, dateStr: string): boolean =>
  plan.completedDate.includes(dateStr);

/** 是否今日已打卡 */
export const hasCheckedInToday = (plan: Plan): boolean =>
  hasCheckedIn(plan, formatLocalDate(new Date()));

// ─────────────────────────────────────────────
//  连续天数计算
// ─────────────────────────────────────────────

/**
 * 获取当前连续打卡天数。
 * 规则：从今天（或昨天，如今日未打卡）往前连续有记录的天数。
 */
export const getCurrentStreak = (plan: Plan): number => {
  if (plan.completedDate.length === 0) return 0;

  const sorted = [...plan.completedDate].sort().reverse(); // 最新在前
  const todayStr = formatLocalDate(new Date());
  const yesterdayStr = yesterday(todayStr);

  // 若今日和昨日都没打卡，则连续已中断，返回 0
  if (!sorted.includes(todayStr) && !sorted.includes(yesterdayStr)) return 0;

  // 从今天（若已打卡）或昨天开始往前数
  let cursor = sorted.includes(todayStr) ? todayStr : yesterdayStr;
  let streak = 0;

  while (plan.completedDate.includes(cursor)) {
    streak++;
    cursor = yesterday(cursor);
  }

  return streak;
};

/**
 * 获取历史最长连续打卡天数。
 */
export const getLongestStreak = (plan: Plan): number => {
  if (plan.completedDate.length === 0) return 0;

  const sorted = [...plan.completedDate].sort(); // 最早在前
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = parseLocalDate(sorted[i - 1]);
    const curr = parseLocalDate(sorted[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

// ─────────────────────────────────────────────
//  中断检测
// ─────────────────────────────────────────────

/**
 * 连续是否已中断（今日和昨日均未打卡，且历史上有过打卡记录）。
 */
export const isStreakBroken = (plan: Plan): boolean => {
  if (plan.completedDate.length === 0) return false;
  const todayStr = formatLocalDate(new Date());
  const yesterdayStr = yesterday(todayStr);
  return (
    !plan.completedDate.includes(todayStr) &&
    !plan.completedDate.includes(yesterdayStr)
  );
};

// ─────────────────────────────────────────────
//  PlanCard 展示用派生数据
// ─────────────────────────────────────────────

export interface PlanDisplayData {
  days: number; // 已打卡总天数
  progress: number; // 进度百分比
  streak: number; // 当前连续天数
  streakBroken: boolean; // 是否已中断
  subtitle: string; // 展示用副标题
}

/**
 * 一次性计算 PlanCard 所需的所有展示数据。
 */
export const getPlanDisplayData = (plan: Plan): PlanDisplayData => {
  const days = getCompletedDays(plan);
  const progress = getProgress(plan);
  const streak = getCurrentStreak(plan);
  const streakBroken = isStreakBroken(plan);

  let subtitle = `已坚持 ${days} 天`;
  if (streak > 0) {
    subtitle = `已坚持 ${days} 天 · 连续 ${streak} 天`;
  } else if (streakBroken && days > 0) {
    subtitle = `已打卡 ${days} 天（连续已中断）`;
  }

  return { days, progress, streak, streakBroken, subtitle };
};
