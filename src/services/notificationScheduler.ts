import { Platform } from 'react-native';

/**
 * 通知调度服务
 * 负责将计划提醒同步为系统本地定时通知
 * 
 * 注意：在 Expo Go 中 expo-notifications 不可用，
 * 所有方法会静默降级（打印警告但不报错）
 */

let Notifications: typeof import('expo-notifications') | null = null;

try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('[Notification] expo-notifications 不可用，提醒功能将被禁用');
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

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('[Notification] 无通知权限，跳过提醒同步');
    return;
  }

  // 1. 先取消该计划的所有旧通知
  await cancelPlanReminders(planId);

  // 2. 为每个启用的提醒创建新的定时通知
  for (const reminder of reminders) {
    if (!reminder.enabled) continue;

    const { hour, minute } = parseTime(reminder.time);
    const identifier = makeNotificationId(
      planId,
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    );

    try {
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: '🔔 布丁计划 · 打卡提醒',
          body: `该完成「${planTitle}」了！坚持就是胜利💪`,
          sound: 'default',
          data: { planId, type: 'plan_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: Platform.OS === 'android' ? 'plan-reminders' : undefined,
        },
      });

      console.log(
        `[Notification] 已注册提醒: ${planTitle} → ${hour}:${minute.toString().padStart(2, '0')} (id: ${identifier})`,
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
    const toCancel = scheduled.filter(
      n => n.identifier.startsWith(`plan_${planId}_reminder_`),
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
