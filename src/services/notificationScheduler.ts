import { Platform } from 'react-native';
import { plansApi } from '../api/plans';
import { habitsApi } from '../api/calendar';
import type { Habit, Plan, UserSettings } from '../types/domain';

/**
 * 通知调度服务
 * 负责将计划提醒同步为系统本地定时通知
 *
 * 注意：在 Expo Go 中 expo-notifications 不可用，
 * 所有方法会静默降级（打印警告但不报错）
 */

let Notifications: typeof import('expo-notifications') | null = null;
let activeSettings: UserSettings | null = null;

if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch {
    console.warn('[Notification] expo-notifications 不可用，提醒功能将被禁用');
  }
}

// ─── 权限管理 ───

/**
 * 请求通知权限
 * @returns 是否已获得权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notification] 用户拒绝了通知权限');
      return false;
    }

    // Android 需要设置通知渠道
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('plan-reminders', {
        name: '计划提醒',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    return true;
  } catch (err) {
    console.warn('[Notification] 请求权限失败:', err);
    return false;
  }
}

// ─── 标识符生成 ───

function makeNotificationId(planId: string, time: string): string {
  return `plan_${planId}_reminder_${time.replace(':', '')}`;
}

const makeHabitNotificationId = (habitId: string, weekday: number) =>
  `habit_${habitId}_weekday_${weekday}`;

// ─── 核心调度 ───

interface ReminderInput {
  time: Date | string;
  enabled: boolean;
  label?: string;
}

function parseTime(time: Date | string): { hour: number; minute: number } {
  if (typeof time === 'string') {
    const [h, m] = time.split(':').map(Number);
    return { hour: h || 0, minute: m || 0 };
  }
  return { hour: time.getHours(), minute: time.getMinutes() };
}

const toMinutes = (time: string) => {
  const { hour, minute } = parseTime(time);
  return hour * 60 + minute;
};

export const isTimeInDndRange = (time: string, start: string, end: string) => {
  const value = toMinutes(time);
  const startValue = toMinutes(start);
  const endValue = toMinutes(end);
  if (startValue === endValue) return false;
  return startValue < endValue
    ? value >= startValue && value < endValue
    : value >= startValue || value < endValue;
};

const resolveNotificationTime = (time: string, settings: UserSettings) =>
  isTimeInDndRange(time, settings.dndStart, settings.dndEnd)
    ? settings.dndEnd
    : time;

const scheduleReminder = async (
  identifier: string,
  title: string,
  body: string,
  time: string,
  data: Record<string, string>,
) => {
  if (!Notifications) return;
  const { hour, minute } = parseTime(time);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, sound: 'default', data },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? 'plan-reminders' : undefined,
    },
  });
};

const schedulePlan = async (plan: Plan, settings: UserSettings) => {
  if ((plan.status || 'active') !== 'active') return;
  for (const reminder of plan.remindSetting || []) {
    if (!reminder.status) continue;
    const time = resolveNotificationTime(reminder.time, settings);
    await scheduleReminder(
      makeNotificationId(plan.id, reminder.time),
      '🔔 布丁计划 · 打卡提醒',
      `该完成「${plan.title}」了！坚持就是胜利💪`,
      time,
      { planId: plan.id, type: 'plan_reminder' },
    );
  }
};

const scheduleHabit = async (habit: Habit, settings: UserSettings) => {
  if (!Notifications || !habit.isActive || !habit.reminderTime) return;
  const time = resolveNotificationTime(habit.reminderTime, settings);
  const { hour, minute } = parseTime(time);
  for (const weekday of habit.weekdays) {
    await Notifications.scheduleNotificationAsync({
      identifier: makeHabitNotificationId(habit.id, weekday),
      content: {
        title: '🍮 布丁计划 · 习惯提醒',
        body: `别忘了「${habit.title}」，完成今天的小目标。`,
        sound: 'default',
        data: { habitId: habit.id, type: 'habit_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: weekday + 1,
        hour,
        minute,
        channelId: Platform.OS === 'android' ? 'plan-reminders' : undefined,
      },
    });
  }
};

export const shouldPresentNotification = (now = new Date()) => {
  if (!activeSettings?.notificationsEnabled) return false;
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes(),
  ).padStart(2, '0')}`;
  return !isTimeInDndRange(
    time,
    activeSettings.dndStart,
    activeSettings.dndEnd,
  );
};

export async function syncNotificationSettings(
  settings: UserSettings,
): Promise<void> {
  activeSettings = settings;
  await cancelAllReminders();
  if (!settings.notificationsEnabled || !Notifications) return;
  if (!(await requestNotificationPermission())) return;

  const dailyTime = resolveNotificationTime(
    settings.notificationTime,
    settings,
  );
  await scheduleReminder(
    'pudding_daily_reminder',
    '🍮 布丁计划 · 每日提醒',
    '开启今日治愈时刻，完成你的计划吧。',
    dailyTime,
    { type: 'daily_reminder' },
  );

  const [plansResponse, habitsResponse] = await Promise.all([
    plansApi.getAll(),
    habitsApi.getAll(),
  ]);
  for (const plan of plansResponse.data || []) {
    await schedulePlan(plan, settings);
  }
  for (const habit of habitsResponse.data || []) {
    await scheduleHabit(habit, settings);
  }
}

/**
 * 为某个计划同步所有提醒到系统通知
 */
export async function syncPlanReminders(
  planId: string,
  planTitle: string,
  reminders: ReminderInput[],
): Promise<void> {
  if (!Notifications) {
    console.warn('[Notification] 模块不可用，跳过提醒同步');
    return;
  }

  await cancelPlanReminders(planId);
  if (!activeSettings?.notificationsEnabled) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('[Notification] 无通知权限，跳过提醒同步');
    return;
  }

  // 为每个启用的提醒创建新的定时通知
  for (const reminder of reminders) {
    if (!reminder.enabled) continue;

    const originalTime =
      typeof reminder.time === 'string'
        ? reminder.time
        : `${String(reminder.time.getHours()).padStart(2, '0')}:${String(
            reminder.time.getMinutes(),
          ).padStart(2, '0')}`;
    const scheduledTime = resolveNotificationTime(originalTime, activeSettings);

    try {
      await scheduleReminder(
        makeNotificationId(planId, originalTime),
        '🔔 布丁计划 · 打卡提醒',
        `该完成「${planTitle}」了！坚持就是胜利💪`,
        scheduledTime,
        { planId, type: 'plan_reminder' },
      );
    } catch (err) {
      console.error(`[Notification] 注册提醒失败:`, err);
    }
  }
}

/**
 * 取消某个计划下所有已注册的定时通知
 */
export async function cancelPlanReminders(planId: string): Promise<void> {
  if (!Notifications) return;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter(n =>
      n.identifier.startsWith(`plan_${planId}_reminder_`),
    );

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      );
      console.log(`[Notification] 已取消通知: ${notification.identifier}`);
    }
  } catch (err) {
    console.error('[Notification] 取消通知失败:', err);
  }
}

/**
 * 取消所有已注册的定时通知
 */
export async function cancelAllReminders(): Promise<void> {
  if (!Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notification] 已取消所有定时通知');
  } catch (err) {
    console.error('[Notification] 取消全部通知失败:', err);
  }
}
