const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');

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
    res.json({ success: true, data: serialize(settings) });
  } catch (error) {
    console.error('获取用户设置失败:', error);
    res.status(500).json({ success: false, error: '获取用户设置失败' });
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
    return res.status(400).json({ success: false, error: '提醒开关格式无效' });
  }
  for (const field of ['notificationTime', 'dndStart', 'dndEnd']) {
    if (field in updates && !TIME_PATTERN.test(updates[field])) {
      return res.status(400).json({ success: false, error: '时间格式无效' });
    }
  }
  if (
    'theme' in updates &&
    !['light', 'dark', 'system'].includes(updates.theme)
  ) {
    return res.status(400).json({ success: false, error: '主题设置无效' });
  }
  if (
    'fontSize' in updates &&
    !['small', 'medium', 'large'].includes(updates.fontSize)
  ) {
    return res.status(400).json({ success: false, error: '字体设置无效' });
  }

  try {
    const settings = await db.updateUserSettingsByUserId(req.userId, updates);
    res.json({
      success: true,
      data: serialize(settings),
      message: '设置已保存',
    });
  } catch (error) {
    console.error('更新用户设置失败:', error);
    res.status(500).json({ success: false, error: '更新用户设置失败' });
  }
});

module.exports = router;
