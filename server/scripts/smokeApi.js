require('dotenv').config();
const { randomInt } = require('node:crypto');
const sequelize = require('../src/config/database');
const { User } = require('../src/models');

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3000/api';
const phone = `188${String(randomInt(0, 100_000_000)).padStart(8, '0')}`;
let token;
let createdUserId;
let intruderUserId;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    signal:
      options.signal ||
      global.AbortSignal.timeout(Number(process.env.SMOKE_TIMEOUT_MS || 10000)),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json();
  if (!response.ok || body.success === false) {
    throw new Error(
      `${options.method || 'GET'} ${path}: ${body.error || response.status}`,
    );
  }
  return body;
};

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('禁止在生产环境运行 API 冒烟测试');
  }
  if (process.env.ALLOW_DESTRUCTIVE_SMOKE !== 'true') {
    throw new Error('运行前必须显式设置 ALLOW_DESTRUCTIVE_SMOKE=true');
  }

  await sequelize.authenticate();
  const planIds = [];

  try {
    const registration = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'API 冒烟测试',
        phone,
        password: 'SmokeTest123!',
        confirmPassword: 'SmokeTest123!',
      }),
    });
    token = registration.data.token;
    createdUserId = registration.data.user.id;

    await request('/settings', {
      method: 'PUT',
      body: JSON.stringify({
        notificationsEnabled: true,
        notificationTime: '09:30',
        dndStart: '23:00',
        dndEnd: '07:00',
        theme: 'dark',
        fontSize: 'large',
      }),
    });
    const settings = await request('/settings');
    if (
      !settings.data.notificationsEnabled ||
      settings.data.notificationTime !== '09:30' ||
      settings.data.theme !== 'dark' ||
      settings.data.fontSize !== 'large'
    ) {
      throw new Error('用户设置持久化验证失败');
    }
    const feedback = await request('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        category: 'suggestion',
        content: 'API 冒烟测试反馈内容',
        contact: '',
      }),
    });
    if (feedback.data.status !== 'new') {
      throw new Error('意见反馈持久化验证失败');
    }

    const created = await request('/plans', {
      method: 'POST',
      body: JSON.stringify({
        title: '临时数值打卡计划',
        totalDays: 7,
        completedDate: [],
        type: 1,
        remindSetting: [],
        rewords: [],
        icon: 'show-chart',
      }),
    });
    const planId = created.data.id;
    planIds.push(planId);

    const ownerToken = token;
    const intruderRegistration = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: 'API 越权测试',
        phone: `188${String(randomInt(0, 100_000_000)).padStart(8, '0')}`,
        password: 'SmokeTest123!',
        confirmPassword: 'SmokeTest123!',
      }),
    });
    intruderUserId = intruderRegistration.data.user.id;
    token = intruderRegistration.data.token;
    let rejectedOwnershipAttempts = 0;
    for (const [path, method, body] of [
      [`/plans/${planId}`, 'GET'],
      [`/plans/${planId}`, 'PUT', { title: '越权修改' }],
      [`/plans/${planId}/check-in?date=2026-07-17`, 'POST', {}],
      [`/plans/${planId}`, 'DELETE'],
    ]) {
      try {
        await request(path, {
          method,
          body: body === undefined ? undefined : JSON.stringify(body),
        });
      } catch (error) {
        if (error.message.includes('无权')) rejectedOwnershipAttempts += 1;
      }
    }
    token = ownerToken;
    if (rejectedOwnershipAttempts !== 4) {
      throw new Error('计划所有权验证失败');
    }

    const date = new Date().toISOString().slice(0, 10);
    let rejectedWrongDetail = false;
    try {
      await request(`/plans/${planId}/check-in?date=${date}`, {
        method: 'POST',
        body: JSON.stringify({ note: '错误的数值计划明细' }),
      });
    } catch (error) {
      rejectedWrongDetail = error.message.includes('不接受文字记录');
    }
    if (!rejectedWrongDetail) {
      throw new Error('计划类型与打卡明细的约束验证失败');
    }

    const firstCheckIn = await request(
      `/plans/${planId}/check-in?date=${date}`,
      {
        method: 'POST',
        body: JSON.stringify({ numericValue: 12.5 }),
      },
    );
    const repeatedCheckIn = await request(
      `/plans/${planId}/check-in?date=${date}`,
      {
        method: 'POST',
        body: JSON.stringify({ numericValue: 13 }),
      },
    );

    const [plans, stats, calendar, week, month, badges] = await Promise.all([
      request('/plans'),
      request('/auth/stats'),
      request(
        `/calendar?year=${date.slice(0, 4)}&month=${Number(date.slice(5, 7))}`,
      ),
      request('/rhythm/week'),
      request('/rhythm/month'),
      request('/badges'),
    ]);
    const record = repeatedCheckIn.data.checkInRecords.find(
      item => item.date === date,
    );
    const editedPlan = await request(`/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: '临时数值打卡计划（已编辑）',
        completedDate: [date],
      }),
    });
    const recordAfterEdit = editedPlan.data.checkInRecords.find(
      item => item.date === date,
    );

    const diaryPlan = await request('/plans', {
      method: 'POST',
      body: JSON.stringify({
        title: '临时日记打卡计划',
        totalDays: 7,
        completedDate: [],
        type: 2,
        remindSetting: [],
        rewords: [],
        icon: 'edit-note',
      }),
    });
    planIds.push(diaryPlan.data.id);
    const diaryCheckIn = await request(
      `/plans/${diaryPlan.data.id}/check-in?date=${date}`,
      {
        method: 'POST',
        body: JSON.stringify({ note: '冒烟测试日记' }),
      },
    );
    const diaryRecord = diaryCheckIn.data.checkInRecords.find(
      item => item.date === date,
    );
    await request('/plans/reorder', {
      method: 'PUT',
      body: JSON.stringify({ planIds: [diaryPlan.data.id, planId] }),
    });
    const reorderedPlans = await request('/plans');

    if (
      firstCheckIn.data.completedDate.length !== 1 ||
      repeatedCheckIn.data.completedDate.length !== 1 ||
      record?.numericValue !== 13 ||
      recordAfterEdit?.numericValue !== 13 ||
      diaryRecord?.note !== '冒烟测试日记' ||
      reorderedPlans.data[0]?.id !== String(diaryPlan.data.id)
    ) {
      throw new Error('重复打卡幂等性或打卡明细持久化验证失败');
    }

    console.log({
      registration: true,
      planCount: plans.data.length,
      totalCheckIns: stats.data.totalCheckIns,
      calendarDays: calendar.data.length,
      weekPoints: week.data.length,
      monthPoints: month.data.length,
      badgeCount: badges.data.length,
      repeatedCheckIn: repeatedCheckIn.message,
      persistedNumericValue: record.numericValue,
      numericValuePreservedAfterPlanEdit: recordAfterEdit.numericValue,
      persistedDiaryNote: diaryRecord.note,
      settingsPersisted: true,
      feedbackPersisted: true,
      planOrderPersisted: true,
      ownershipIsolated: true,
    });

    await request('/auth/data', { method: 'DELETE' });
    const [clearedPlans, clearedStats, resetSettings] = await Promise.all([
      request('/plans'),
      request('/auth/stats'),
      request('/settings'),
    ]);
    if (
      clearedPlans.data.length !== 0 ||
      clearedStats.data.totalCheckIns !== 0 ||
      clearedStats.data.totalPlans !== 0 ||
      resetSettings.data.notificationsEnabled !== false ||
      resetSettings.data.theme !== 'system'
    ) {
      throw new Error('清除用户数据验证失败');
    }

    await request('/auth/logout', { method: 'POST' });
    let sessionInvalidated = false;
    try {
      await request('/auth/me');
    } catch (error) {
      sessionInvalidated = error.message.includes('认证令牌无效或已过期');
    }
    if (!sessionInvalidated) {
      throw new Error('退出登录后旧令牌仍然有效');
    }
  } finally {
    if (token) {
      for (const planId of planIds) {
        await request(`/plans/${planId}`, { method: 'DELETE' }).catch(() => {});
      }
    }
    if (createdUserId) {
      await User.destroy({ where: { userId: createdUserId } });
    }
    if (intruderUserId) {
      await User.destroy({ where: { userId: intruderUserId } });
    }
    await sequelize.close();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
