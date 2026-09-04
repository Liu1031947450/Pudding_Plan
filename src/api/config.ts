import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const webApiUrl = (() => {
  const location = (
    globalThis as typeof globalThis & {
      location?: { protocol: string; hostname: string };
    }
  ).location;
  if (!location) return 'http://localhost:3000/api';
  return `${location.protocol}//${location.hostname}:3000/api`;
})();
const baseUrl = configuredApiUrl || (Platform.OS === 'web' ? webApiUrl : '');

export const API_CONFIG = {
  BASE_URL: baseUrl,
  SERVER_URL: baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const API_ENDPOINTS = {
  PLANS: '/plans',
  PLAN_DETAIL: (id: string) => `/plans/${id}`,
  PLAN_CHECK_IN: (id: string) => `/plans/${id}/check-in`,
  PLAN_CHECK_IN_DATE: (id: string, date: string) =>
    `/plans/${id}/check-ins/${date}`,
  PLAN_REORDER: '/plans/reorder',
  TEMPLATES: '/templates',
  TEMPLATE_DETAIL: (id: string) => `/templates/${id}`,
  TEMPLATES_BY_CATEGORY: (category: string) =>
    `/templates/category/${category}`,
  CIRCLES: '/circles',
  CIRCLE_DETAIL: (id: string) => `/circles/${id}`,
  BUDDIES: '/buddies',
  BUDDY_RECOMMENDATIONS: '/buddies/recommendations',
  BUDDY_REQUESTS: '/buddies/requests',
  BLOCKS: '/blocks',
  REPORTS: '/reports',
  CALENDAR: '/calendar',
  CALENDAR_QUOTE: '/calendar/quote',
  HABITS: '/habits',
  HABIT_DETAIL: (id: string) => `/habits/${id}`,
  HABIT_CHECK_IN: (id: string, date: string) =>
    `/habits/${id}/check-ins/${date}`,
  HABIT_REORDER: '/habits/reorder',
  ACTIVITY_HISTORY: '/activity/history',
  NOTIFICATIONS: '/notifications',
  BADGES: '/badges',
  SETTINGS: '/settings',
  FEEDBACK: '/feedback',
  RHYTHM_WEEK: '/rhythm/week',
  RHYTHM_MONTH: '/rhythm/month',
};
