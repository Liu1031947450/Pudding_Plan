require('dotenv').config();
const assert = require('node:assert/strict');
const { randomInt } = require('node:crypto');
const sequelize = require('../src/config/database');
const db = require('../src/data/database');
const { User } = require('../src/models');
const { toDateString } = require('../src/utils/checkInUtils');

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:3000/api';
const password = 'SmokeTest123!';
const demoPassword = 'Pudding123';
const temporaryUserIds = new Set();

const localDate = offset => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toDateString(date);
};

const request = async (
  token,
  path,
  { method = 'GET', body, expectedStatus = 200 } = {},
) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    signal: global.AbortSignal.timeout(
      Number(process.env.SMOKE_TIMEOUT_MS || 10000),
    ),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  for (const key of ['success', 'data', 'message', 'error']) {
    assert.ok(key in payload, `${method} ${path} 缺少响应字段 ${key}`);
  }
  const acceptedStatuses = Array.isArray(expectedStatus)
    ? expectedStatus
    : [expectedStatus];
  assert.ok(
    acceptedStatuses.includes(response.status),
    `${method} ${path} 预期 ${acceptedStatuses.join('/')}，实际 ${
      response.status
    }: ${payload.error || payload.message}`,
  );
  assert.equal(
    payload.success,
    response.ok,
    `${method} ${path} 的 HTTP 状态与 success 不一致`,
  );
  return payload;
};

const expectError = async (token, path, options, pattern) => {
  const payload = await request(token, path, options);
  if (pattern) assert.match(payload.error, pattern);
  return payload;
};

const register = async (label, goalTags) => {
  const phone = `189${String(randomInt(0, 100_000_000)).padStart(8, '0')}`;
  const response = await request(null, '/auth/register', {
    method: 'POST',
    expectedStatus: 201,
    body: {
      username: label,
      phone,
      password,
      confirmPassword: password,
      acceptedTerms: true,
      goalTags,
    },
  });
  temporaryUserIds.add(response.data.user.id);
  return { ...response.data, phone };
};

const login = async (phone, loginPassword) =>
  (
    await request(null, '/auth/login', {
      method: 'POST',
      body: { phone, password: loginPassword },
    })
  ).data;

const createPlan = async (token, title, type) =>
  (
    await request(token, '/plans', {
      method: 'POST',
      expectedStatus: 201,
      body: {
        title,
        totalDays: 14,
        type,
        remindSetting: [],
        rewords: [],
        icon:
          type === 0 ? 'check-circle' : type === 1 ? 'show-chart' : 'edit-note',
      },
    })
  ).data;

const createMoment = async (token, title, visibility, location = '') =>
  (
    await request(token, '/circles', {
      method: 'POST',
      expectedStatus: 201,
      body: {
        title,
        content: `${title} 的正文内容`,
        description: `${title} 摘要`,
        category: '冒烟测试',
        visibility,
        location,
        images: [],
      },
    })
  ).data;

const cleanupTemporaryUsers = async () => {
  for (const userId of temporaryUserIds) {
    const user = await User.findOne({ where: { userId } });
    if (!user) continue;
    await db.clearUserDataByUserId(userId).catch(() => {});
    await user.destroy().catch(() => {});
  }
};

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('禁止在生产环境运行 API 冒烟测试');
  }
  if (sequelize.getDatabaseName() !== 'pudding_plan_demo') {
    throw new Error('安全保护：API 冒烟测试仅允许操作 pudding_plan_demo');
  }

  await sequelize.authenticate();
  try {
    await expectError(
      null,
      '/auth/register',
      {
        method: 'POST',
        expectedStatus: 400,
        body: {
          username: '未同意协议',
          phone: `188${String(randomInt(0, 100_000_000)).padStart(8, '0')}`,
          password,
          confirmPassword: password,
          acceptedTerms: false,
        },
      },
      /协议和隐私政策/,
    );

    const owner = await register('冒烟用户甲', ['自律', '阅读']);
    const partner = await register('冒烟用户乙', ['自律', '运动']);
    const outsider = await login('13800000003', demoPassword);
    let ownerToken = owner.token;
    const partnerToken = partner.token;
    const outsiderToken = outsider.token;

    await request(ownerToken, '/auth/me');
    await request(ownerToken, '/auth/me', {
      method: 'PUT',
      body: {
        username: '冒烟用户甲（已更新）',
        bio: '验证资料与目标标签持久化。',
        goalTags: ['自律', '阅读', '早睡'],
      },
    });
    await request(ownerToken, '/settings', {
      method: 'PUT',
      body: {
        notificationsEnabled: true,
        notificationTime: '09:30',
        dndStart: '23:00',
        dndEnd: '07:00',
        theme: 'light',
        fontSize: 'large',
      },
    });
    const settings = await request(ownerToken, '/settings');
    assert.equal(settings.data.notificationTime, '09:30');
    assert.equal(settings.data.theme, 'light');
    assert.equal(settings.data.fontSize, 'large');
    await expectError(
      ownerToken,
      '/settings',
      { method: 'PUT', expectedStatus: 400, body: { theme: 'dark' } },
      /浅色主题/,
    );
    await request(ownerToken, '/feedback', {
      method: 'POST',
      expectedStatus: 201,
      body: { category: 'suggestion', content: 'API 冒烟测试反馈内容' },
    });

    const today = localDate(0);
    const pastSixDays = localDate(-6);
    const tooOld = localDate(-7);
    const future = localDate(1);
    const stampPlan = await createPlan(ownerToken, '冒烟盖章计划', 0);
    const numericPlan = await createPlan(ownerToken, '冒烟数值计划', 1);
    const diaryPlan = await createPlan(ownerToken, '冒烟日记计划', 2);

    await request(ownerToken, `/plans/${stampPlan.id}/check-in?date=${today}`, {
      method: 'POST',
      body: {},
    });
    await request(ownerToken, `/plans/${stampPlan.id}/check-ins/${today}`, {
      method: 'DELETE',
    });
    await request(ownerToken, `/plans/${stampPlan.id}/check-in?date=${today}`, {
      method: 'POST',
      body: {},
    });
    await request(
      ownerToken,
      `/plans/${numericPlan.id}/check-in?date=${today}`,
      {
        method: 'POST',
        body: { numericValue: 12.5 },
      },
    );
    const updatedNumeric = await request(
      ownerToken,
      `/plans/${numericPlan.id}/check-in?date=${today}`,
      { method: 'POST', body: { numericValue: 13 } },
    );
    assert.equal(
      updatedNumeric.data.checkInRecords.find(record => record.date === today)
        .numericValue,
      13,
    );
    await request(
      ownerToken,
      `/plans/${diaryPlan.id}/check-in?date=${pastSixDays}`,
      {
        method: 'POST',
        body: { note: '过去第六个自然日仍允许补签' },
      },
    );
    await expectError(
      ownerToken,
      `/plans/${stampPlan.id}/check-in?date=${future}`,
      { method: 'POST', expectedStatus: 400, body: {} },
      /未来/,
    );
    await expectError(
      ownerToken,
      `/plans/${stampPlan.id}/check-in?date=${tooOld}`,
      { method: 'POST', expectedStatus: 400, body: {} },
      /过去6个自然日/,
    );

    await request(ownerToken, `/plans/${stampPlan.id}`, {
      method: 'PUT',
      body: { status: 'paused' },
    });
    await expectError(
      ownerToken,
      `/plans/${stampPlan.id}/check-in?date=${today}`,
      { method: 'POST', expectedStatus: 409, body: {} },
      /暂停或归档/,
    );
    await request(ownerToken, `/plans/${stampPlan.id}`, {
      method: 'PUT',
      body: { status: 'archived' },
    });
    await expectError(
      ownerToken,
      `/plans/${stampPlan.id}/check-in?date=${today}`,
      { method: 'POST', expectedStatus: 409, body: {} },
      /暂停或归档/,
    );
    await request(ownerToken, `/plans/${stampPlan.id}`, {
      method: 'PUT',
      body: { status: 'active' },
    });
    await expectError(
      ownerToken,
      `/plans/${numericPlan.id}`,
      { method: 'PUT', expectedStatus: 409, body: { type: 0 } },
      /不能更换打卡类型/,
    );
    await request(ownerToken, '/plans/reorder', {
      method: 'PUT',
      body: { planIds: [diaryPlan.id, numericPlan.id, stampPlan.id] },
    });
    const orderedPlans = await request(ownerToken, '/plans');
    assert.deepEqual(
      orderedPlans.data.map(plan => plan.id),
      [diaryPlan.id, numericPlan.id, stampPlan.id],
    );

    for (const [path, method, body] of [
      [`/plans/${stampPlan.id}`, 'GET'],
      [`/plans/${stampPlan.id}`, 'PUT', { title: '越权修改' }],
      [`/plans/${stampPlan.id}/check-in?date=${today}`, 'POST', {}],
      [`/plans/${stampPlan.id}`, 'DELETE'],
    ]) {
      await expectError(
        partnerToken,
        path,
        { method, expectedStatus: 403, body },
        /无权/,
      );
    }

    const habitOne = (
      await request(ownerToken, '/habits', {
        method: 'POST',
        expectedStatus: 201,
        body: {
          title: '冒烟每日习惯',
          subtitle: '每天完成',
          icon: 'task-alt',
          category: '自律',
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          reminderTime: '08:30',
          startDate: pastSixDays,
          isActive: true,
        },
      })
    ).data;
    const habitTwo = (
      await request(ownerToken, '/habits', {
        method: 'POST',
        expectedStatus: 201,
        body: {
          title: '冒烟排序习惯',
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          startDate: pastSixDays,
          isActive: true,
        },
      })
    ).data;
    await request(ownerToken, `/habits/${habitOne.id}/check-ins/${today}`, {
      method: 'PUT',
    });
    await request(
      ownerToken,
      `/habits/${habitOne.id}/check-ins/${pastSixDays}`,
      { method: 'PUT' },
    );
    await expectError(
      ownerToken,
      `/habits/${habitOne.id}/check-ins/${future}`,
      { method: 'PUT', expectedStatus: 400 },
      /未来/,
    );
    await expectError(
      ownerToken,
      `/habits/${habitOne.id}/check-ins/${tooOld}`,
      { method: 'PUT', expectedStatus: 400 },
      /过去6个自然日/,
    );
    await request(ownerToken, `/habits/${habitOne.id}`, {
      method: 'PUT',
      body: { title: '冒烟每日习惯（已编辑）', reminderTime: '07:45' },
    });
    await request(ownerToken, `/habits/${habitOne.id}`, {
      method: 'PUT',
      body: { isActive: false },
    });
    await expectError(
      ownerToken,
      `/habits/${habitOne.id}/check-ins/${localDate(-1)}`,
      { method: 'PUT', expectedStatus: 409 },
      /停用/,
    );
    await request(ownerToken, `/habits/${habitOne.id}`, {
      method: 'PUT',
      body: { isActive: true },
    });
    await request(ownerToken, '/habits/reorder', {
      method: 'PUT',
      body: { habitIds: [habitTwo.id, habitOne.id] },
    });
    const habits = await request(ownerToken, `/habits?date=${today}`);
    assert.deepEqual(
      habits.data.map(habit => habit.id),
      [habitTwo.id, habitOne.id],
    );
    assert.equal('completed' in habits.data[1], false);
    await expectError(
      partnerToken,
      `/habits/${habitOne.id}/check-ins/${today}`,
      { method: 'PUT', expectedStatus: 403 },
      /无权/,
    );
    await request(ownerToken, `/habits/${habitTwo.id}`, { method: 'DELETE' });

    const [history, calendar, week, month, stats, badges, templates, quote] =
      await Promise.all([
        request(ownerToken, '/activity/history'),
        request(
          ownerToken,
          `/calendar?year=${today.slice(0, 4)}&month=${Number(
            today.slice(5, 7),
          )}`,
        ),
        request(ownerToken, '/rhythm/week'),
        request(ownerToken, '/rhythm/month'),
        request(ownerToken, '/auth/stats'),
        request(ownerToken, '/badges'),
        request(null, '/templates'),
        request(null, '/calendar/quote'),
      ]);
    assert.ok(history.data.some(record => record.type === 'plan'));
    assert.ok(history.data.some(record => record.type === 'habit'));
    assert.ok(
      calendar.data.find(day => day.date === today)?.activityCount >= 3,
    );
    assert.equal(week.data.length, 7);
    assert.ok(month.data.length >= 28);
    assert.ok(stats.data.totalCheckIns >= 5);
    assert.ok(badges.data.length > 0);
    assert.ok(templates.data.length > 0);
    assert.ok(quote.data.text);

    await request(ownerToken, `/users/${partner.user.id}/follow`, {
      method: 'POST',
    });
    const followNotifications = await request(partnerToken, '/notifications');
    assert.ok(followNotifications.data.some(item => item.type === 'follow'));

    const canceledRequest = await request(ownerToken, '/buddies/requests', {
      method: 'POST',
      expectedStatus: 201,
      body: { userId: outsider.user.id },
    });
    await request(ownerToken, `/buddies/requests/${canceledRequest.data.id}`, {
      method: 'DELETE',
    });
    const rejectedRequest = await request(outsiderToken, '/buddies/requests', {
      method: 'POST',
      expectedStatus: 201,
      body: { userId: owner.user.id },
    });
    await request(ownerToken, `/buddies/${rejectedRequest.data.id}/reject`, {
      method: 'POST',
    });
    const buddyRequest = await request(ownerToken, '/buddies/requests', {
      method: 'POST',
      expectedStatus: 201,
      body: { userId: partner.user.id },
    });
    await request(partnerToken, `/buddies/${buddyRequest.data.id}/accept`, {
      method: 'POST',
    });
    await request(
      ownerToken,
      `/buddies/${buddyRequest.data.id}/encouragement`,
      {
        method: 'POST',
      },
    );
    await expectError(
      ownerToken,
      `/buddies/${buddyRequest.data.id}/encouragement`,
      { method: 'POST', expectedStatus: 429 },
      /每天只能/,
    );

    const publicMoment = await createMoment(
      ownerToken,
      '冒烟公开动态',
      'public',
      '冒烟测试地点',
    );
    const buddyMoment = await createMoment(
      ownerToken,
      '冒烟搭子动态',
      'buddies',
    );
    const privateMoment = await createMoment(
      ownerToken,
      '冒烟私密动态',
      'private',
    );
    const partnerMoments = await request(partnerToken, '/circles');
    assert.ok(partnerMoments.data.some(item => item.id === publicMoment.id));
    assert.ok(partnerMoments.data.some(item => item.id === buddyMoment.id));
    assert.equal(
      partnerMoments.data.some(item => item.id === privateMoment.id),
      false,
    );
    const outsiderMoments = await request(outsiderToken, '/circles');
    assert.ok(outsiderMoments.data.some(item => item.id === publicMoment.id));
    assert.equal(
      outsiderMoments.data.some(item => item.id === buddyMoment.id),
      false,
    );
    await expectError(
      outsiderToken,
      `/circles/${buddyMoment.id}`,
      { expectedStatus: 403 },
      /不可见/,
    );
    await expectError(
      outsiderToken,
      `/circles/${privateMoment.id}/collect`,
      { method: 'POST', expectedStatus: 403 },
      /不可见/,
    );
    await expectError(
      outsiderToken,
      `/circles/${publicMoment.id}`,
      { method: 'DELETE', expectedStatus: 403 },
      /自己的动态/,
    );

    const removableComment = await request(
      partnerToken,
      `/circles/${publicMoment.id}/comments`,
      { method: 'POST', expectedStatus: 201, body: { content: '待删除评论' } },
    );
    await expectError(
      outsiderToken,
      `/circles/${publicMoment.id}/comments/${removableComment.data.id}`,
      { method: 'DELETE', expectedStatus: 403 },
      /自己的评论/,
    );
    await request(
      partnerToken,
      `/circles/${publicMoment.id}/comments/${removableComment.data.id}`,
      { method: 'DELETE' },
    );

    const buddyComment = await request(
      partnerToken,
      `/circles/${buddyMoment.id}/comments`,
      {
        method: 'POST',
        expectedStatus: 201,
        body: { content: '搭子可见评论' },
      },
    );
    await request(ownerToken, `/circles/${buddyMoment.id}/comments`, {
      method: 'POST',
      expectedStatus: 201,
      body: { content: '给搭子的回复', parentId: buddyComment.data.id },
    });
    const notificationsBeforeUnbuddy = await request(
      partnerToken,
      '/notifications',
    );
    assert.ok(
      notificationsBeforeUnbuddy.data.some(
        item => item.type === 'reply' && item.targetId === buddyMoment.id,
      ),
    );
    await request(ownerToken, `/buddies/${buddyRequest.data.id}`, {
      method: 'DELETE',
    });
    const notificationsAfterUnbuddy = await request(
      partnerToken,
      '/notifications',
    );
    assert.equal(
      notificationsAfterUnbuddy.data.some(
        item => item.type === 'reply' && item.targetId === buddyMoment.id,
      ),
      false,
    );

    await request(outsiderToken, `/circles/${publicMoment.id}/collect`, {
      method: 'POST',
    });
    await request(outsiderToken, '/reports', {
      method: 'POST',
      expectedStatus: 201,
      body: {
        targetType: 'moment',
        targetId: publicMoment.id,
        reason: 'spam',
      },
    });
    await expectError(
      outsiderToken,
      `/circles/${publicMoment.id}`,
      { expectedStatus: 403 },
      /不可见/,
    );
    const hiddenCollections = await request(
      outsiderToken,
      '/circles/collections',
    );
    assert.equal(
      hiddenCollections.data.some(item => item.id === publicMoment.id),
      false,
    );

    const partnerMoment = await createMoment(
      partnerToken,
      '搭子方公开动态',
      'public',
    );
    const secondBuddyRequest = await request(
      partnerToken,
      '/buddies/requests',
      {
        method: 'POST',
        expectedStatus: 201,
        body: { userId: owner.user.id },
      },
    );
    await request(ownerToken, `/buddies/${secondBuddyRequest.data.id}/accept`, {
      method: 'POST',
    });
    await request(partnerToken, '/blocks', {
      method: 'POST',
      body: { userId: owner.user.id },
    });
    const blocks = await request(partnerToken, '/blocks');
    assert.ok(blocks.data.some(item => item.user.userId === owner.user.id));
    await expectError(
      partnerToken,
      `/circles/${publicMoment.id}`,
      { expectedStatus: 403 },
      /不可见/,
    );
    await expectError(
      ownerToken,
      `/circles/${partnerMoment.id}`,
      { expectedStatus: 403 },
      /不可见/,
    );
    await expectError(
      partnerToken,
      `/users/${owner.user.id}/follow`,
      { method: 'POST', expectedStatus: 403 },
      /拉黑关系/,
    );
    await request(partnerToken, `/blocks/${owner.user.id}`, {
      method: 'DELETE',
    });
    const visibleAfterUnblock = await request(partnerToken, '/circles');
    assert.ok(
      visibleAfterUnblock.data.some(item => item.id === publicMoment.id),
    );
    assert.equal(
      visibleAfterUnblock.data.some(item => item.id === buddyMoment.id),
      false,
    );
    await request(ownerToken, `/circles/${privateMoment.id}`, {
      method: 'DELETE',
    });
    await request(partnerToken, `/circles/${partnerMoment.id}`, {
      method: 'DELETE',
    });

    const oldOwnerToken = ownerToken;
    const passwordChange = await request(ownerToken, '/auth/password', {
      method: 'PUT',
      body: {
        currentPassword: password,
        newPassword: 'SmokeChanged123!',
        confirmPassword: 'SmokeChanged123!',
      },
    });
    ownerToken = passwordChange.data.token;
    await expectError(
      oldOwnerToken,
      '/auth/me',
      { expectedStatus: 401 },
      /认证令牌/,
    );

    await request(ownerToken, '/auth/data', { method: 'DELETE' });
    const [clearedPlans, clearedHabits, clearedStats, resetSettings] =
      await Promise.all([
        request(ownerToken, '/plans'),
        request(ownerToken, '/habits'),
        request(ownerToken, '/auth/stats'),
        request(ownerToken, '/settings'),
      ]);
    assert.equal(clearedPlans.data.length, 0);
    assert.equal(clearedHabits.data.length, 0);
    assert.equal(clearedStats.data.totalCheckIns, 0);
    assert.equal(resetSettings.data.notificationsEnabled, false);
    assert.equal(resetSettings.data.theme, 'light');

    await request(ownerToken, '/auth/account', {
      method: 'DELETE',
      body: { password: 'SmokeChanged123!' },
    });
    temporaryUserIds.delete(owner.user.id);
    await expectError(
      ownerToken,
      '/auth/me',
      { expectedStatus: 401 },
      /认证令牌/,
    );
    await request(partnerToken, '/auth/account', {
      method: 'DELETE',
      body: { password },
    });
    temporaryUserIds.delete(partner.user.id);

    assert.equal(
      await User.count({
        where: { userId: [owner.user.id, partner.user.id] },
      }),
      0,
    );

    console.log({
      database: sequelize.getDatabaseName(),
      localDate: today,
      responseContract: true,
      planTypes: 3,
      planStatusTransitions: true,
      checkInWindow: true,
      habitsCrudAndHistory: true,
      crossUserIsolation: true,
      followsAndBuddyLifecycle: true,
      encouragementRateLimit: true,
      visibilityAndNotificationFiltering: true,
      reportsAndBlocks: true,
      clearDataAndAccountDeletion: true,
    });
  } finally {
    await cleanupTemporaryUsers();
    await sequelize.close();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
