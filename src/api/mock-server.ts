import { mockPlans, mockBadges, mockNotifications, mockBuddies, mockCircles, mockCalendarData, mockHabits, mockWeekRhythmData, mockMonthRhythmData } from '../data/mockData';
import { templateDetails } from '../data/templates';
import type { Plan, Badge, Notification, Buddy, Circle, DayData, Habit, RhythmData } from '../types/domain';
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

  getPlans() { return this.plansDB; }
  getBadges() { return this.badgesDB; }
  getNotifications() { return this.notificationsDB; }
  getBuddies() { return this.buddiesDB; }
  getCircles() { return this.circlesDB; }
  getCalendar() { return this.calendarDB; }
  getHabits() { return this.habitsDB; }
}

const db = MockDatabase.getInstance();

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Server
export const mockApiServer = {
  // Plans API
  plans: {
    getAll: async (): Promise<Plan[]> => {
      await delay();
      return [...db.getPlans()];
    },

    getById: async (id: string): Promise<Plan | null> => {
      await delay();
      return db.getPlans().find(p => p.id === id) || null;
    },

    create: async (plan: Omit<Plan, 'id'>): Promise<Plan> => {
      await delay();
      const newPlan: Plan = {
        ...plan,
        id: Date.now().toString(),
      };
      db.getPlans().push(newPlan);
      console.log('Plan created:', newPlan);
      console.log('Total plans:', db.getPlans().length);
      return newPlan;
    },

    update: async (id: string, updates: Partial<Plan>): Promise<Plan | null> => {
      await delay();
      const plans = db.getPlans();
      const index = plans.findIndex(p => p.id === id);
      if (index === -1) return null;
      plans[index] = { ...plans[index], ...updates };
      return plans[index];
    },

    delete: async (id: string): Promise<boolean> => {
      await delay();
      const plans = db.getPlans();
      const index = plans.findIndex(p => p.id === id);
      if (index === -1) return false;
      plans.splice(index, 1);
      return true;
    },

    checkIn: async (id: string): Promise<Plan | null> => {
      await delay();
      const plan = db.getPlans().find(p => p.id === id);
      if (!plan) return null;

      plan.days += 1;
      plan.progress = Math.round((plan.days / plan.totalDays) * 100);
      return plan;
    },
  },

  // Templates API
  templates: {
    getAll: async (): Promise<TemplateDetail[]> => {
      await delay();
      return Object.values(templateDetails);
    },

    getById: async (id: string): Promise<TemplateDetail | null> => {
      await delay();
      return templateDetails[id] || null;
    },

    getByCategory: async (category: string): Promise<TemplateDetail[]> => {
      await delay();
      return Object.values(templateDetails).filter(t => t.category === category);
    },
  },

  // Circles API
  circles: {
    getAll: async (): Promise<Circle[]> => {
      await delay();
      return [...db.getCircles()];
    },

    getById: async (id: string): Promise<Circle | null> => {
      await delay();
      return db.getCircles().find(c => c.id === id) || null;
    },

    join: async (id: string): Promise<boolean> => {
      await delay();
      const circle = db.getCircles().find(c => c.id === id);
      return !!circle;
    },
  },

  // Buddies API
  buddies: {
    getAll: async (): Promise<Buddy[]> => {
      await delay();
      return [...db.getBuddies()];
    },
  },

  // Calendar API
  calendar: {
    getData: async (): Promise<DayData[]> => {
      await delay();
      return [...db.getCalendar()];
    },

    updateDay: async (day: number, hasActivity: boolean, activityType?: 'primary' | 'secondary' | 'tertiary'): Promise<boolean> => {
      await delay();
      const dayData = db.getCalendar().find(d => d.day === day);
      if (!dayData) return false;
      dayData.hasActivity = hasActivity;
      dayData.activityType = activityType;
      return true;
    },
  },

  // Habits API
  habits: {
    getAll: async (): Promise<Habit[]> => {
      await delay();
      return [...db.getHabits()];
    },

    toggle: async (id: string): Promise<Habit | null> => {
      await delay();
      const habit = db.getHabits().find(h => h.id === id);
      if (!habit) return null;
      habit.completed = !habit.completed;
      return habit;
    },
  },

  // Notifications API
  notifications: {
    getAll: async (): Promise<Notification[]> => {
      await delay();
      return [...db.getNotifications()];
    },

    markAsRead: async (id: string): Promise<boolean> => {
      await delay();
      const notification = db.getNotifications().find(n => n.id === id);
      if (!notification) return false;
      notification.read = true;
      return true;
    },
  },

  // Badges API
  badges: {
    getAll: async (): Promise<Badge[]> => {
      await delay();
      return [...db.getBadges()];
    },
  },

  // Rhythm Data API
  rhythm: {
    getWeek: async (): Promise<RhythmData[]> => {
      await delay();
      return [...mockWeekRhythmData];
    },

    getMonth: async (): Promise<RhythmData[]> => {
      await delay();
      return [...mockMonthRhythmData];
    },
  },
};
