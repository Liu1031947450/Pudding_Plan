import { MaterialIcons } from '@expo/vector-icons';

// Plan related types
export interface Plan {
  id: string;
  title: string; // 计划名称
  totalDays: number; // 打卡周期（总天数）
  completedDate: string[]; // 已打卡日期兼容投影；服务端事实源为 plan_check_ins
  type: 0 | 1 | 2; // 打卡方式：0-盖章打卡, 1-数值记录, 2-文字日记
  remindSetting: {
    time: string; // 提醒时间（HH:mm）
    status: boolean; // 提醒状态：true-开启, false-关闭
  }[];
  rewords: {
    times: number; // 成就条件（天数）
    title: string; // 成就名称
    description: string; // 成就奖励
    status: boolean; // 成就状态：true-已解锁, false-未解锁
  }[];
  icon: keyof typeof MaterialIcons.glyphMap | string; // 计划图标
  // 以下字段为派生/兼容字段，优先从 completedDate 计算
  currentDays?: number; // 当前打卡天数（= completedDate.length）
  progress?: number; // 进度百分比
  days?: number; // 已打卡天数（兼容旧字段）
  color?: string; // 卡片颜色
  sortOrder?: number; // 用户自定义排序位置
  checkInRecords?: PlanCheckInRecord[]; // 规范化打卡事实，由后端按日期返回
}

export interface PlanCheckInRecord {
  date: string;
  numericValue: number | null;
  note: string | null;
}

export interface PlanCheckInDetails {
  numericValue?: number;
  note?: string;
}

export interface Reminder {
  id: string;
  time: Date | string; // 支持 Date 对象或 HH:mm 格式字符串
  label: string;
  enabled: boolean;
}

// Badge and Achievement types
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  percentage?: number;
}

// Notification types
export interface Notification {
  id: string;
  type:
    | 'reminder'
    | 'achievement'
    | 'social'
    | 'system'
    | 'like'
    | 'comment'
    | 'reply';
  title: string;
  message: string;
  time: string;
  read: boolean;
  senderId?: string;
  sender?: {
    userId: string;
    username: string;
    /** 用户头像 URL，最大长度 1000 字符 */
    avatar?: string;
  };
  targetType?: 'moment' | 'comment';
  targetId?: string;
}

// Rhythm data for charts
export interface RhythmData {
  date: string;
  value: number;
  label?: string;
}

// Circle and Social types
export interface Buddy {
  id: string;
  name: string;
  goal: string;
  /** 用户头像 URL，最大长度 1000 字符 */
  avatarUri?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  /** 用户头像 URL，最大长度 1000 字符 */
  userAvatarUri?: string;
  text: string;
  time: string;
  replies?: Comment[];
}

// Calendar types
export interface DayData {
  day: number;
  hasActivity: boolean;
  isToday: boolean;
  isSelected: boolean;
  activityType?: 'primary' | 'secondary' | 'tertiary';
  completedPlanIds?: string[];
}

export interface Habit {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  completed: boolean;
  category: string;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  notificationTime: string;
  dndStart: string;
  dndEnd: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}

// Template types
export interface Template {
  id: string;
  title: string;
  duration: number;
  icon: string;
  color: string;
  category?: string;
}

export interface TemplateDetail extends Template {
  subtitle: string;
  description: string;
  goals: string[];
  checkpoints: {
    day: number;
    title: string;
    description: string;
  }[];
  tips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  frequency: string;
}
