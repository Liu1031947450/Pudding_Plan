// API Configuration
const devApiUrl =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.101:3000/api';
const devServerUrl = devApiUrl.endsWith('/api')
  ? devApiUrl.slice(0, -4)
  : devApiUrl;

export const API_CONFIG = {
  BASE_URL: __DEV__ ? devApiUrl : 'https://api.puddingplan.com',
  SERVER_URL: __DEV__ ? devServerUrl : 'https://api.puddingplan.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Plans
  PLANS: '/plans',
  PLAN_DETAIL: (id: string) => `/plans/${id}`,
  PLAN_CHECK_IN: (id: string) => `/plans/${id}/check-in`,
  PLAN_REORDER: '/plans/reorder',

  // Templates
  TEMPLATES: '/templates',
  TEMPLATE_DETAIL: (id: string) => `/templates/${id}`,
  TEMPLATES_BY_CATEGORY: (category: string) =>
    `/templates/category/${category}`,

  // Circles
  CIRCLES: '/circles',
  CIRCLE_DETAIL: (id: string) => `/circles/${id}`,
  CIRCLE_JOIN: (id: string) => `/circles/${id}/join`,
  BUDDIES: '/buddies',

  // Calendar & Habits
  CALENDAR: '/calendar',
  CALENDAR_QUOTE: '/calendar/quote',
  HABITS: '/habits',
  HABIT_TOGGLE: (id: string) => `/habits/${id}/toggle`,

  // Notifications & Badges
  NOTIFICATIONS: '/notifications',
  BADGES: '/badges',

  // User settings
  SETTINGS: '/settings',
  FEEDBACK: '/feedback',

  // Rhythm Data
  RHYTHM_WEEK: '/rhythm/week',
  RHYTHM_MONTH: '/rhythm/month',
};
