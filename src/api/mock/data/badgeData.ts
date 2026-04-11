import { Colors } from '../../../constants/theme';
import type { Badge } from '../../../types/domain';

export const mockBadges: Badge[] = [
  {
    id: '1',
    title: '7天星火',
    description: '完成第一周',
    icon: 'local-fire-department',
    color: Colors.secondaryContainer,
    unlocked: true,
  },
  {
    id: '2',
    title: '自律达人',
    description: '维持 14 天连续纪录',
    icon: 'workspace-premium',
    color: Colors.secondaryContainer,
    unlocked: true,
  },
  {
    id: '3',
    title: '初入圈子',
    description: '同行共进，更好生活',
    icon: 'groups',
    color: Colors.secondaryContainer,
    unlocked: true,
  },
  {
    id: '4',
    title: '初入圈子2',
    description: '啊啊啊不不不',
    icon: 'groups',
    color: Colors.secondaryContainer,
    unlocked: true,
  },
];
