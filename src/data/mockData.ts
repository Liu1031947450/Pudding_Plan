import { Colors } from '../constants/theme';
import type {
  Plan,
  Badge,
  Notification,
  Buddy,
  Circle,
  DayData,
  Habit,
  RhythmData,
} from '../types/domain';

// Mock Plans Data
export const mockPlans: Plan[] = [
  {
    id: '99',
    title: '测试数据01', // 计划名称
    totalDays: 21, // 打卡周期（总天数）
    currentDays: 10, // 当前打卡天数
    type: 0, // 打卡方式：0-盖章打卡, 1-数值记录, 2-文字日记
    remindSetting: [
      {
        time: '09:00', // 提醒时间（HH:mm）
        status: true, // 提醒状态：true-开启, false-关闭
      },
    ], // 提醒设置
    rewords: [
      {
        times: 7, // 成就条件（天数）
        title: '小有成就', // 成就名称
        description: '吃一顿大餐', // 成就奖励
        status: true, // 成就状态：true-已解锁, false-未解锁
      },
    ], // 阶段里程碑,
    icon: '', // 计划图标
  },
];

// Mock Badges Data
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

// Mock Notifications Data
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: '每日打卡提醒',
    message: '别忘了完成今天的冥想打卡哦，坚持就是胜利！',
    time: '2分钟前',
    read: false,
  },
  {
    id: '2',
    type: 'achievement',
    title: '恭喜解锁新成就',
    message: '你已连续打卡7天，获得"7天星火"勋章！',
    time: '1小时前',
    read: false,
  },
  {
    id: '3',
    type: 'social',
    title: '好友互动',
    message: 'Elena R. 给你的计划点赞并留言：加油，一起进步！',
    time: '3小时前',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: '系统更新',
    message: 'PuddingPlan v2.4.0 已发布，新增圈子功能和更多主题。',
    time: '昨天',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: '系统更新2',
    message: 'PuddingPlan v2.4.0 已发布，新增圈子功能和更多主题2。',
    time: '昨天',
    read: true,
  },
];

// Mock Buddies Data
export const mockBuddies: Buddy[] = [
  {
    id: '1',
    name: 'Elena R.',
    goal: '目标：晨间瑜伽',
    avatarUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCzHNNTMZyepnzwLaDqIvgso4V35x1bl2_TDeiuDwej1bQKqOI6IUYakhakF_Jmc71ldFcX5WyVt-DLNaDhrDPP2WBGk7w7y1DVcry-meJRs24T0xuR3cd5-zJDS7tw-RQgpWDzifTvotOKXjwGG_12z3E8z8OIbV2Ik62j_1P-ZSSu4Y0QTmz3uoNTcx8ydIjz4EsAN5IAcGZo7wMdMeR0QEUcYVpS303iWx-9_xuehFs70T6196mLsS_cFKecNanVEVKFJC3Zf-6',
  },
  {
    id: '2',
    name: 'Marcus K.',
    goal: '目标：数字排毒',
    avatarUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLHmFkwx_27vL1dDGAI87sjjG_ZBPNZeAGazhUc78yBFn6QsytuyOYOLkKVVJBSzcfVFw6Azbc1y9EYYGw5zS2YENRpGlCb68a1HbCujAcmJ273s-GaVYhKvn69hPYJ_3ouEhyxbfxPDs3qnkn2zIZPjJ4txEc6mlLwgU30kCqo_KzbF2NHnXRrSm85_BfH1Y8Nwk6mm6nFivSxVC1uithNi8OqSrD0Myr5HnRYL0OoOe_wf59dTI7E_wXm3nRWRieefXIKCSG7SUJ',
  },
];

// Mock Circles Data
export const mockCircles: Circle[] = [
  {
    id: '1',
    title: '晨读小组',
    members: '1.2k 位成员正在安静共读',
    type: 'large',
    category: '热门',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC7e1EPbLFG18ZXQnqUlFa8dlguceJHlALBrnE12J49MYJcPB-bghS8lMTYRJY_retjM1ZUQDR_QAbiO1z241ph2TDLqQXPRgFjve2dYUXd_4HOO8ynn7Zoz3pgZlMNfP7-0lhcKvV5RHzS6bxFFqvQQUPt3M67_jzwIEtuVurEo92R5BHOS0Q0SD_2h3mcz0GVCSZgpUnk7Ar5qpOOW6eVRzeVBeINW6E5DWKe78MQnVxkbHZTLxs-2tKYtpzd4ELRY0wTOd-Ytad2',
  },
  {
    id: '2',
    title: '静心手工',
    members: '加入',
    type: 'small',
  },
  {
    id: '3',
    title: '深呼吸',
    members: '加入',
    type: 'small',
  },
  {
    id: '4',
    title: '睡前放松',
    members: '在休息前分享感恩时刻',
    type: 'medium',
  },
];

// Mock Calendar Data
export const mockCalendarData: DayData[] = [
  { day: 26, hasActivity: false, isToday: false, isSelected: false },
  { day: 27, hasActivity: false, isToday: false, isSelected: false },
  { day: 28, hasActivity: false, isToday: false, isSelected: false },
  { day: 29, hasActivity: false, isToday: false, isSelected: false },
  { day: 1, hasActivity: false, isToday: false, isSelected: false },
  { day: 2, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 3,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  {
    day: 4,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  { day: 5, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 6,
    hasActivity: true,
    activityType: 'primary',
    isToday: false,
    isSelected: false,
  },
  { day: 7, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 8,
    hasActivity: true,
    activityType: 'secondary',
    isToday: false,
    isSelected: false,
  },
  { day: 9, hasActivity: false, isToday: false, isSelected: false },
  {
    day: 10,
    hasActivity: true,
    activityType: 'tertiary',
    isToday: false,
    isSelected: false,
  },
  {
    day: 11,
    hasActivity: true,
    activityType: 'primary',
    isToday: true,
    isSelected: true,
  },
  { day: 12, hasActivity: false, isToday: false, isSelected: false },
  { day: 13, hasActivity: false, isToday: false, isSelected: false },
  { day: 14, hasActivity: false, isToday: false, isSelected: false },
  { day: 15, hasActivity: false, isToday: false, isSelected: false },
  { day: 16, hasActivity: false, isToday: false, isSelected: false },
  { day: 17, hasActivity: false, isToday: false, isSelected: false },
];

// Mock Habits Data
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

// Mock Rhythm Data (Week)
export const mockWeekRhythmData: RhythmData[] = [
  { date: '周一', value: 100 },
  { date: '周二', value: 85 },
  { date: '周三', value: 100 },
  { date: '周四', value: 70 },
  { date: '周五', value: 95 },
  { date: '周六', value: 60 },
  { date: '周日', value: 80 },
];

// Mock Rhythm Data (Month)
export const mockMonthRhythmData: RhythmData[] = Array.from(
  { length: 30 },
  (_, i) => ({
    date: `${i + 1}`,
    value: Math.max(
      40,
      Math.min(100, 65 + Math.sin(i / 4) * 25 + (Math.random() - 0.5) * 15),
    ),
  }),
);
