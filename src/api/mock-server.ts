import { mockPlans, mockHabits } from './mock/data/planData';
import { mockBadges } from './mock/data/badgeData';
import { mockNotifications } from './mock/data/notificationData';
import { mockBuddies, mockCircles } from './mock/data/communityData';
import {
  mockCalendarData,
  mockWeekRhythmData,
  mockMonthRhythmData,
} from './mock/data/calendarData';
import { mockLocations, mockTopics } from './mock/data/communityData';
import { ApiResponse } from './types';
import { getCompletedDays, getProgress } from '../utils/planUtils';
import { templateDetails } from '../data/templates';
import type {
  Plan,
  Badge,
  Notification,
  Buddy,
  DayData,
  Habit,
  RhythmData,
} from '../types/domain';
import type { CircleListItem, CircleMoment } from '../features/circle/types';
import type { TemplateDetail } from '../data/templates';

// Mock database - 使用单例模式保持数据持久化（在应用运行期间）
class MockDatabase {
  private static instance: MockDatabase;
  private plansDB: Plan[];
  private badgesDB: Badge[];
  private notificationsDB: Notification[];
  private buddiesDB: Buddy[];
  private circlesDB: CircleListItem[];
  private calendarDB: DayData[];
  private habitsDB: Habit[];
  private locationsDB: any[];
  private topicsDB: string[];

  private constructor() {
    // 深拷贝计划数组，避免污染原始 mockData
    this.plansDB = mockPlans.map(p => ({
      ...p,
      completedDate: [...p.completedDate],
    }));
    this.badgesDB = [...mockBadges];
    this.notificationsDB = [...mockNotifications];
    this.buddiesDB = [...mockBuddies];
    this.circlesDB = [...mockCircles];
    this.calendarDB = [...mockCalendarData];
    this.habitsDB = [...mockHabits];
    this.locationsDB = [...mockLocations];
    this.topicsDB = [...mockTopics];

    // 初始化时，从 completedDate 派生 currentDays / progress（保持字段同步）
    for (const plan of this.plansDB) {
      plan.currentDays = getCompletedDays(plan);
      plan.days = plan.currentDays;
      plan.progress = getProgress(plan);
    }
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
  getCircles(): CircleListItem[] {
    return this.circlesDB;
  }
  getCalendar(): DayData[] {
    return this.calendarDB;
  }
  getHabits(): Habit[] {
    return this.habitsDB;
  }
  getLocations(): any[] {
    return this.locationsDB;
  }
  getTopics(): string[] {
    return this.topicsDB;
  }
}

const db = MockDatabase.getInstance();

// 模拟网络延迟
export const delay = (ms: number = 300): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// 标准响应包装器
export const wrapResponse = <T>(
  data: T,
  message: string = 'success',
): ApiResponse<T> => ({
  code: 200,
  data,
  message,
});

// Mock API Server
export const mockApiServer = {
  // Plans API - 计划相关接口
  plans: {
    // 获取所有计划列表
    getAll: async (userId?: string): Promise<ApiResponse<Plan[]>> => {
      await delay();
      const data = [...db.getPlans()];
      if (userId) {
        console.log(`[Mock API] plans.getAll - userId: ${userId}`);
      }
      return wrapResponse(data);
    },

    // 获取单个计划详情
    getById: async (
      id: string,
      userId?: string,
    ): Promise<ApiResponse<Plan | null>> => {
      await delay();
      const data = db.getPlans().find(p => p.id === id) || null;
      if (userId) {
        console.log(`[Mock API] getById - planId: ${id}, userId: ${userId}`);
      }
      return wrapResponse(data);
    },

    // 创建新计划
    create: async (
      plan: Omit<Plan, 'id'>,
      userId?: string,
    ): Promise<ApiResponse<Plan>> => {
      await delay();
      const newPlan: Plan = {
        ...plan,
        id: Date.now().toString(),
      };
      db.getPlans().push(newPlan);
      if (userId) {
        console.log(
          `[Mock API] create - planId: ${newPlan.id}, userId: ${userId}`,
        );
      }
      return wrapResponse(newPlan);
    },

    // 更新计划
    update: async (
      id: string,
      updates: Partial<Plan>,
      userId?: string,
    ): Promise<ApiResponse<Plan | null>> => {
      await delay();
      const plans = db.getPlans();
      const index = plans.findIndex(p => p.id === id);
      if (index === -1) return wrapResponse(null, 'Plan not found');
      plans[index] = { ...plans[index], ...updates };
      if (userId) {
        console.log(`[Mock API] update - planId: ${id}, userId: ${userId}`);
      }
      return wrapResponse(plans[index]);
    },

    // 删除计划
    delete: async (
      id: string,
      userId?: string,
    ): Promise<ApiResponse<boolean>> => {
      await delay();
      const plans = db.getPlans();
      const index = plans.findIndex(p => p.id === id);
      if (index === -1) return wrapResponse(false, 'Plan not found');
      plans.splice(index, 1);
      if (userId) {
        console.log(
          `[Mock API] plans.delete - planId: ${id}, userId: ${userId}`,
        );
      }
      return wrapResponse(true);
    },

    // 计划打卡
    checkIn: async (
      id: string,
      date: string,
      userId: string = '1234567890',
    ): Promise<ApiResponse<Plan | null>> => {
      await delay();
      const plan = db.getPlans().find(p => p.id === id);
      if (!plan) return wrapResponse(null, 'Plan not found');

      // completedDate 是唯一事实源，直接检查是否已包含该日期
      if (!plan.completedDate.includes(date)) {
        plan.completedDate.push(date);
        // 保持派生字段与 completedDate 同步
        plan.currentDays = getCompletedDays(plan);
        plan.days = plan.currentDays;
        plan.progress = getProgress(plan);
        console.log(
          `[Mock API] plans.checkIn - 打卡成功 -> planId: ${id}, date: ${date}, userId: ${userId}, 累计: ${plan.currentDays} 天`,
        );
      } else {
        console.log(
          `[Mock API] plans.checkIn - 已打卡，跳过 -> planId: ${id}, date: ${date}`,
        );
      }

      return wrapResponse(plan);
    },
  },

  // Templates API - 模板相关接口
  templates: {
    // 获取所有模板列表
    getAll: async (): Promise<ApiResponse<TemplateDetail[]>> => {
      await delay();
      const data = Object.values(templateDetails);
      return wrapResponse(data);
    },

    // 获取单个模板详情
    getById: async (
      id: string,
    ): Promise<ApiResponse<TemplateDetail | null>> => {
      await delay();
      const data = templateDetails[id] || null;
      return wrapResponse(data);
    },

    // 获取模板分类
    getByCategory: async (
      category: string,
    ): Promise<ApiResponse<TemplateDetail[]>> => {
      await delay();
      const data = Object.values(templateDetails).filter(
        t => t.category === category,
      );
      return wrapResponse(data);
    },
  },

  // Circles API - 圈子相关接口
  circles: {
    // 获取所有圈子列表
    getAll: async (): Promise<ApiResponse<CircleListItem[]>> => {
      await delay();
      const data = [...db.getCircles()];
      return wrapResponse(data);
    },

    // 获取单个圈子详情
    getById: async (id: string): Promise<ApiResponse<CircleListItem | null>> => {
      await delay();
      const data = db.getCircles().find(c => c.id === id) || null;
      return wrapResponse(data);
    },

    // 加入圈子
    join: async (id: string): Promise<ApiResponse<boolean>> => {
      await delay();
      const circle = db.getCircles().find(c => c.id === id);
      return wrapResponse(!!circle);
    },

    // 创建新动态 (Moment)
    create: async (moment: Partial<CircleMoment>): Promise<ApiResponse<CircleMoment>> => {
      await delay(1000);
      const newMoment: CircleMoment = {
        id: `m_${Date.now()}`,
        title: moment.title || '',
        description: moment.description,
        content: moment.content,
        members: moment.members || '1',
        type: 'waterfall',
        imageUri: moment.imageUri,
        images: moment.images,
        category: moment.category,
        authorName: moment.authorName || '我',
        authorAvatarUri: moment.authorAvatarUri || 'https://i.pravatar.cc/150?u=me',
        likes: 0,
        commentsCount: 0,
        comments: [],
        isLiked: false,
        isCollected: false,
      };

      db.getCircles().unshift(newMoment);
      console.log('[Mock API] circles.create - 发布成功:', newMoment);
      return wrapResponse(newMoment);
    },

    // 获取附近地点
    getNearby: async (): Promise<ApiResponse<any[]>> => {
      await delay(500);
      return wrapResponse(db.getLocations());
    },

    // 获取热门话题
    getTrendingTopics: async (): Promise<ApiResponse<string[]>> => {
      await delay(300);
      return wrapResponse(db.getTopics());
    },
  },

  // Buddies API - 伙伴相关接口
  buddies: {
    // 获取所有伙伴列表
    getAll: async (): Promise<ApiResponse<Buddy[]>> => {
      await delay();
      const data = [...db.getBuddies()];
      return wrapResponse(data);
    },
  },

  // Calendar API - 日历相关接口
  calendar: {
    // 获取日历数据
    getData: async (
      year: number,
      month: number,
      _userId?: string,
    ): Promise<ApiResponse<DayData[]>> => {
      await delay();

      const daysInMonth = new Date(year, month, 0).getDate();
      const mockedMonthData: DayData[] = [];

      const now = new Date();
      const isCurrentMonth =
        now.getFullYear() === year && now.getMonth() + 1 === month;

      // 从所有计划的 completedDate 直接派生日历打卡数据（completedDate 是唯一事实源）
      const plans = db.getPlans();

      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(
          i,
        ).padStart(2, '0')}`;

        // 收集当天有打卡记录的计划
        const completedPlanIds = plans
          .filter(p => p.completedDate.includes(dateStr))
          .map(p => p.id);
        const hasActivity = completedPlanIds.length > 0;
        const activityType = hasActivity ? 'primary' : undefined;

        mockedMonthData.push({
          day: i,
          hasActivity,
          isToday: isCurrentMonth && now.getDate() === i,
          isSelected: false,
          activityType: activityType as any,
          completedPlanIds,
        });
      }

      console.log(
        `[Mock API] calendar.getData - 从 completedDate 派生日历 -> year: ${year}, month: ${month}`,
      );
      return wrapResponse(mockedMonthData);
    },

    // 获取每日金句
    getDailyQuote: async (): Promise<
      ApiResponse<{ text: string; author: string }>
    > => {
      await delay();
      const quotes = [
        {
          text: '生活就像海洋，只有意志坚强的人，才能到达彼岸。',
          author: '马原',
        },
        { text: '不要等待机会，而要创造机会。', author: '无名' },
        { text: '成功的秘诀在于对目标的执着追求。', author: '本杰明·富兰克林' },
        {
          text: '行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧。',
          author: '无名氏',
        },
        { text: '真正的高贵应该是优于过去的自己。', author: '海明威' },
      ];
      const today = new Date().getDate();
      console.log(`[Mock API] calendar.getDailyQuote - 获取今日金句`);
      return wrapResponse(quotes[today % quotes.length]);
    },

    // 更新日历活动
    updateDay: async (
      day: number,
      hasActivity: boolean,
      activityType?: 'primary' | 'secondary' | 'tertiary',
    ): Promise<ApiResponse<boolean>> => {
      await delay();
      const dayData = db.getCalendar().find(d => d.day === day);
      if (!dayData) return wrapResponse(false, 'Day not found');
      dayData.hasActivity = hasActivity;
      dayData.activityType = activityType;
      return wrapResponse(true);
    },
  },

  // Habits API - 习惯相关接口
  habits: {
    // 获取所有习惯列表
    getAll: async (): Promise<ApiResponse<Habit[]>> => {
      await delay();
      const data = [...db.getHabits()];
      return wrapResponse(data);
    },

    // 切换习惯状态
    toggle: async (id: string): Promise<ApiResponse<Habit | null>> => {
      await delay();
      const habit = db.getHabits().find(h => h.id === id);
      if (!habit) return wrapResponse(null, 'Habit not found');
      habit.completed = !habit.completed;
      return wrapResponse(habit);
    },
  },

  // Notifications API - 通知相关接口
  notifications: {
    // 获取所有通知列表
    getAll: async (userId?: string): Promise<ApiResponse<Notification[]>> => {
      await delay();
      const data = [...db.getNotifications()];
      if (userId) {
        console.log(`[Mock API] notifications.getAll - userId: ${userId}`);
      }
      return wrapResponse(data);
    },

    // 标记通知为已读
    markAsRead: async (
      id: string,
      userId?: string,
    ): Promise<ApiResponse<boolean>> => {
      await delay();
      const notification = db.getNotifications().find(n => n.id === id);
      if (!notification) return wrapResponse(false, 'Notification not found');
      notification.read = true;
      if (userId) {
        console.log(
          `[Mock API] notifications.markAsRead - id: ${id}, userId: ${userId}`,
        );
      }
      return wrapResponse(true);
    },
  },

  // Badges API - 成就相关接口
  badges: {
    // 获取所有成就列表
    getAll: async (): Promise<ApiResponse<Badge[]>> => {
      await delay();
      const data = [...db.getBadges()];
      return wrapResponse(data);
    },
  },

  // Rhythm Data API - 节奏数据相关接口
  rhythm: {
    // 获取周节奏数据
    getWeek: async (userId?: string): Promise<ApiResponse<RhythmData[]>> => {
      await delay();
      if (userId) {
        console.log(`[Mock API] rhythm.getWeek - userId: ${userId}`);
      }
      return wrapResponse([...mockWeekRhythmData]);
    },

    // 获取月节奏数据
    getMonth: async (userId?: string): Promise<ApiResponse<RhythmData[]>> => {
      await delay();
      if (userId) {
        console.log(`[Mock API] rhythm.getMonth - userId: ${userId}`);
      }
      return wrapResponse([...mockMonthRhythmData]);
    },
  },
};
