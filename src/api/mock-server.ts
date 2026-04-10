import {
  mockPlans,
  mockBadges,
  mockNotifications,
  mockBuddies,
  mockCircles,
  mockCalendarData,
  mockHabits,
  mockWeekRhythmData,
  mockMonthRhythmData,
} from '../data/mockData';
import { templateDetails } from '../data/templates';
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
import type { TemplateDetail } from '../data/templates';

// Mock database - 使用单例模式保持数据持久化（在应用运行期间）
class MockDatabase {
  private static instance: MockDatabase;
  private plansDB: Plan[];
  private badgesDB: Badge[];
  private notificationsDB: Notification[];
  private buddiesDB: Buddy[];
  private circlesDB: Circle[];
  private calendarDB: DayData[];
  private habitsDB: Habit[];

  private constructor() {
    this.plansDB = [...mockPlans];
    this.badgesDB = [...mockBadges];
    this.notificationsDB = [...mockNotifications];
    this.buddiesDB = [...mockBuddies];
    this.circlesDB = [...mockCircles];
    this.calendarDB = [...mockCalendarData];
    this.habitsDB = [...mockHabits];
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  getPlans(): Plan[] {
    return this.plansDB;
  }
  getBadges(): Badge[] {
    return this.badgesDB;
  }
  getNotifications(): Notification[] {
    return this.notificationsDB;
  }
  getBuddies(): Buddy[] {
    return this.buddiesDB;
  }
  getCircles(): Circle[] {
    return this.circlesDB;
  }
  getCalendar(): DayData[] {
    return this.calendarDB;
  }
  getHabits(): Habit[] {
    return this.habitsDB;
  }
}

const db = MockDatabase.getInstance();

// 模拟网络延迟
const delay = (ms: number = 300): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API Server
export const mockApiServer = {
  // Plans API - 计划相关接口
  plans: {
    // 获取所有计划列表
    getAll: async (): Promise<Plan[]> => {
      await delay();
      const data = [...db.getPlans()];
      return data;
    },

    // 获取单个计划详情
    getById: async (id: string): Promise<Plan | null> => {
      await delay();
      const data = db.getPlans().find(p => p.id === id) || null;
      return data;
    },

    // 创建新计划
    create: async (plan: Omit<Plan, 'id'>): Promise<Plan> => {
      await delay();
      const newPlan: Plan = {
        ...plan,
        id: Date.now().toString(),
      };
      db.getPlans().push(newPlan);
      return newPlan;
    },

    // 更新计划
    update: async (
      id: string,
      updates: Partial<Plan>,
    ): Promise<Plan | null> => {
      await delay();
      const plans = db.getPlans();
      const index = plans.findIndex(p => p.id === id);
      if (index === -1) return null;
      plans[index] = { ...plans[index], ...updates };
      return plans[index];
    },

    // 删除计划
    delete: async (id: string): Promise<boolean> => {
      await delay();
      const plans = db.getPlans();
      const index = plans.findIndex(p => p.id === id);
      if (index === -1) return false;
      plans.splice(index, 1);
      return true;
    },

    // 计划打卡
    checkIn: async (id: string): Promise<Plan | null> => {
      await delay();
      const plan = db.getPlans().find(p => p.id === id);
      if (!plan) return null;

      plan.days = (plan.days || 0) + 1;
      plan.progress = Math.round(((plan.days || 0) / plan.totalDays) * 100);
      return plan;
    },
  },

  // Templates API - 模板相关接口
  templates: {
    // 获取所有模板列表
    getAll: async (): Promise<TemplateDetail[]> => {
      await delay();
      const data = Object.values(templateDetails);
      return data;
    },

    // 获取单个模板详情
    getById: async (id: string): Promise<TemplateDetail | null> => {
      await delay();
      const data = templateDetails[id] || null;
      return data;
    },

    // 获取模板分类
    getByCategory: async (category: string): Promise<TemplateDetail[]> => {
      await delay();
      const data = Object.values(templateDetails).filter(
        t => t.category === category,
      );
      return data;
    },
  },

  // Circles API - 圈子相关接口
  circles: {
    // 获取所有圈子列表
    getAll: async (): Promise<Circle[]> => {
      await delay();
      const data = [...db.getCircles()];
      return data;
    },

    // 获取单个圈子详情
    getById: async (id: string): Promise<Circle | null> => {
      await delay();
      const data = db.getCircles().find(c => c.id === id) || null;
      return data;
    },

    // 加入圈子
    join: async (id: string): Promise<boolean> => {
      await delay();
      const circle = db.getCircles().find(c => c.id === id);
      return !!circle;
    },
  },

  // Buddies API - 伙伴相关接口
  buddies: {
    // 获取所有伙伴列表
    getAll: async (): Promise<Buddy[]> => {
      await delay();
      const data = [...db.getBuddies()];
      return data;
    },
  },

  // Calendar API - 日历相关接口
  calendar: {
    // 获取日历数据
    getData: async (): Promise<DayData[]> => {
      await delay();
      const data = [...db.getCalendar()];
      return data;
    },

    // 更新日历活动
    updateDay: async (
      day: number,
      hasActivity: boolean,
      activityType?: 'primary' | 'secondary' | 'tertiary',
    ): Promise<boolean> => {
      await delay();
      const dayData = db.getCalendar().find(d => d.day === day);
      if (!dayData) return false;
      dayData.hasActivity = hasActivity;
      dayData.activityType = activityType;
      return true;
    },
  },

  // Habits API - 习惯相关接口
  habits: {
    // 获取所有习惯列表
    getAll: async (): Promise<Habit[]> => {
      await delay();
      const data = [...db.getHabits()];
      return data;
    },

    // 切换习惯状态
    toggle: async (id: string): Promise<Habit | null> => {
      await delay();
      const habit = db.getHabits().find(h => h.id === id);
      if (!habit) return null;
      habit.completed = !habit.completed;
      return habit;
    },
  },

  // Notifications API - 通知相关接口
  notifications: {
    // 获取所有通知列表
    getAll: async (): Promise<Notification[]> => {
      await delay();
      const data = [...db.getNotifications()];
      return data;
    },

    // 标记通知为已读
    markAsRead: async (id: string): Promise<boolean> => {
      await delay();
      const notification = db.getNotifications().find(n => n.id === id);
      if (!notification) return false;
      notification.read = true;
      return true;
    },
  },

  // Badges API - 成就相关接口
  badges: {
    // 获取所有成就列表
    getAll: async (): Promise<Badge[]> => {
      await delay();
      const data = [...db.getBadges()];
      return data;
    },
  },

  // Rhythm Data API - 节奏数据相关接口
  rhythm: {
    // 获取周节奏数据
    getWeek: async (): Promise<RhythmData[]> => {
      await delay();
      return [...mockWeekRhythmData];
    },

    // 获取月节奏数据
    getMonth: async (): Promise<RhythmData[]> => {
      await delay();
      return [...mockMonthRhythmData];
    },
  },
};
