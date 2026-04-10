import type { Badge } from '../types/domain';
import { mockBadges } from '../data/mockData';

/**
 * 获取用户成就列表
 */
export const fetchBadges = async (): Promise<Badge[]> => {
  // 模拟网络延迟
  await new Promise<void>(resolve => setTimeout(resolve, 300));
  const data = mockBadges;
  console.log('[Mock API] fetchBadges - 获取用户成就列表', data);
  return data;
};
