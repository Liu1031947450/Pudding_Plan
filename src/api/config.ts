// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3000/api'
    : 'https://api.puddingplan.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Plans
  PLANS: '/plans',
  PLAN_DETAIL: (id: string) => `/plans/${id}`,
  PLAN_CHECK_IN: (id: string) => `/plans/${id}/check-in`,

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
  HABITS: '/habits',
  HABIT_TOGGLE: (id: string) => `/habits/${id}/toggle`,

  // Notifications & Badges
  NOTIFICATIONS: '/notifications',
  BADGES: '/badges',

  // Rhythm Data
  RHYTHM_WEEK: '/rhythm/week',
  RHYTHM_MONTH: '/rhythm/month',
};
