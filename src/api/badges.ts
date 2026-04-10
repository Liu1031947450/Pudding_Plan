import type { Badge } from '../types/domain';
import { mockBadges } from '../data/mockData';

/**
 * 获取用户成就列表
 */
export const fetchBadges = async (): Promise<Badge[]> => {
  // 模拟网络延迟
  await new Promise<void>(resolve => setTimeout(resolve, 300));
  console.log('获取用户成就列表', mockBadges);

  // TODO: 替换为真实 API 调用
  return mockBadges;
};
