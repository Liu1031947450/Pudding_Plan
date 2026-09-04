const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');
const { ok, fail } = require('../utils/http');

const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const fields = [
  'notificationsEnabled',
  'notificationTime',
  'dndStart',
  'dndEnd',
  'theme',
  'fontSize',
];

const serialize = settings => {
  const data = settings.toJSON();
  delete data.userId;
  delete data.createdAt;
  delete data.updatedAt;
  return data;
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const settings = await db.getUserSettingsByUserId(req.userId);
    ok(res, serialize(settings), '获取设置成功');
  } catch (error) {
    console.error('获取用户设置失败:', error);
    fail(res, 500, '获取用户设置失败');
  }
});

router.put('/', authMiddleware, async (req, res) => {
  const updates = Object.fromEntries(
    Object.entries(req.body || {}).filter(([key]) => fields.includes(key)),
  );

  if (
    'notificationsEnabled' in updates &&
    typeof updates.notificationsEnabled !== 'boolean'
  ) {
    return fail(res, 400, '提醒开关格式无效');
  }
  for (const field of ['notificationTime', 'dndStart', 'dndEnd']) {
    if (field in updates && !TIME_PATTERN.test(updates[field])) {
      return fail(res, 400, '时间格式无效');
    }
  }
  if ('theme' in updates && updates.theme !== 'light') {
    return fail(res, 400, '当前版本仅支持浅色主题');
  }
  if (
    'fontSize' in updates &&
    !['small', 'medium', 'large'].includes(updates.fontSize)
  ) {
    return fail(res, 400, '字体设置无效');
  }

  try {
    const settings = await db.updateUserSettingsByUserId(req.userId, updates);
    ok(res, serialize(settings), '设置已保存');
  } catch (error) {
    console.error('更新用户设置失败:', error);
    fail(res, 500, '更新用户设置失败');
  }
});

module.exports = router;
