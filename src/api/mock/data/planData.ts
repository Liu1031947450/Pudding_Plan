import type { Plan, Habit } from '../../../types/domain';

export const mockPlans: Plan[] = [
  {
    id: '99',
    title: '测试数据01',
    totalDays: 20,
    type: 0,
    remindSetting: [
      {
        time: '09:00',
        status: true,
      },
    ],
    rewords: [
      {
        times: 7,
        title: '小有成就',
        description: '吃一顿大餐',
        status: true,
      },
    ],
    icon: 'event-available',
    completedDate: [
      '2026-04-01',
      '2026-04-02',
      '2026-04-03',
      '2026-04-04',
      '2026-04-05',
      '2026-04-06',
      '2026-04-07',
      '2026-04-08',
      '2026-04-09',
    ],
  },
];

export const mockHabits: Habit[] = [
  {
    id: '1',
    title: '晨间补水',
    subtitle: '250ml goal',
    icon: 'local-drink',
    completed: true,
    category: 'Morning Ritual',
  },
  {
    id: '2',
    title: '冥想练习',
    subtitle: '10 min session',
    icon: 'self-improvement',
    completed: false,
    category: 'Mindfulness',
  },
  {
    id: '3',
    title: '感恩日记',
    subtitle: '3 things today',
    icon: 'edit-note',
    completed: false,
    category: 'Reflection',
  },
];
