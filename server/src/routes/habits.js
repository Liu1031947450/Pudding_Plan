const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');
const { isValidDateString, toDateString } = require('../utils/checkInUtils');
const { ok, fail } = require('../utils/http');

const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const HABIT_FIELDS = [
  'title',
  'subtitle',
  'icon',
  'category',
  'weekdays',
  'reminderTime',
  'startDate',
  'isActive',
];

const validateHabit = habit => {
  if (typeof habit.title !== 'string' || !habit.title.trim())
    return '习惯标题不能为空';
  if (habit.title.trim().length > 100) return '习惯标题不能超过100字';
  if (
    !Array.isArray(habit.weekdays) ||
    habit.weekdays.length < 1 ||
    habit.weekdays.length > 7 ||
    new Set(habit.weekdays).size !== habit.weekdays.length ||
    habit.weekdays.some(day => !Number.isInteger(day) || day < 0 || day > 6)
  ) {
    return '重复星期必须是0至6之间的不重复数字';
  }
  if (habit.reminderTime && !TIME_PATTERN.test(habit.reminderTime))
    return '提醒时间格式无效';
  if (!isValidDateString(habit.startDate)) return '开始日期格式无效';
  if (typeof habit.isActive !== 'boolean') return '习惯状态格式无效';
  return null;
};

const serializeHabit = habit => {
  const data = habit.toJSON();
  delete data.checkIns;
  return { ...data, id: String(habit.id) };
};

const findOwnedHabit = async (req, res, date) => {
  const habit = await db.getHabitById(req.params.id, date);
  if (!habit) {
    fail(res, 404, '未找到习惯');
    return null;
  }
  if (String(habit.userId) !== String(req.user.id)) {
    fail(res, 403, '无权操作此习惯');
    return null;
  }
  return habit;
};

router.get('/', authMiddleware, async (req, res) => {
  const date =
    typeof req.query.date === 'string'
      ? req.query.date
      : toDateString(new Date());
  if (!isValidDateString(date)) return fail(res, 400, '日期格式无效');
  try {
    const habits = await db.getHabitsByUserId(req.userId, date);
    ok(res, habits.map(serializeHabit), '获取习惯列表成功');
  } catch (error) {
    console.error('获取习惯列表失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const payload = {
    ...Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) =>
        HABIT_FIELDS.includes(key),
      ),
    ),
    weekdays: req.body?.weekdays || [0, 1, 2, 3, 4, 5, 6],
    reminderTime: req.body?.reminderTime || null,
    startDate: req.body?.startDate || toDateString(new Date()),
    isActive: req.body?.isActive ?? true,
  };
  const error = validateHabit(payload);
  if (error) return fail(res, 400, error);
  try {
    const habit = await db.createHabit({
      ...payload,
      title: payload.title.trim(),
      userId: req.userId,
    });
    ok(res, serializeHabit(habit), '习惯创建成功', 201);
  } catch (caught) {
    console.error('创建习惯失败:', caught);
    fail(res, 500, '服务器内部错误');
  }
});

router.put('/reorder', authMiddleware, async (req, res) => {
  const habitIds = req.body?.habitIds;
  if (
    !Array.isArray(habitIds) ||
    new Set(habitIds.map(String)).size !== habitIds.length
  ) {
    return fail(res, 400, '习惯排序数据无效');
  }
  try {
    await db.reorderHabits(req.userId, habitIds);
    ok(res, true, '习惯顺序已保存');
  } catch (error) {
    fail(res, error.message.includes('排序列表') ? 400 : 500, error.message);
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const habit = await findOwnedHabit(req, res);
    if (!habit) return;
    const updates = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) =>
        HABIT_FIELDS.includes(key),
      ),
    );
    if (updates.title !== undefined) updates.title = updates.title.trim();
    const error = validateHabit({ ...habit.toJSON(), ...updates });
    if (error) return fail(res, 400, error);
    const updated = await db.updateHabit(req.params.id, updates);
    ok(res, serializeHabit(updated), '习惯已更新');
  } catch (error) {
    console.error('更新习惯失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const habit = await findOwnedHabit(req, res);
    if (!habit) return;
    await db.deleteHabit(req.params.id);
    ok(res, true, '习惯已删除');
  } catch (error) {
    console.error('删除习惯失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.put('/:id/check-ins/:date', authMiddleware, async (req, res) => {
  try {
    const habit = await findOwnedHabit(req, res, req.params.date);
    if (!habit) return;
    const updated = await db.checkInHabit(req.params.id, req.params.date);
    const achievementService = require('../services/achievementService');
    const stats = await db.getUserStatsByUserId(req.userId);
    await achievementService.checkAndUnlockAchievements(req.userId, stats);
    ok(res, serializeHabit(updated), '习惯打卡成功');
  } catch (error) {
    const status = /未来|自然日|日期格式|重复计划/.test(error.message)
      ? 400
      : /停用/.test(error.message)
      ? 409
      : 500;
    fail(res, status, status === 500 ? '服务器内部错误' : error.message);
  }
});

router.delete('/:id/check-ins/:date', authMiddleware, async (req, res) => {
  try {
    const habit = await findOwnedHabit(req, res, req.params.date);
    if (!habit) return;
    const updated = await db.deleteHabitCheckIn(req.params.id, req.params.date);
    ok(res, serializeHabit(updated), '习惯打卡已撤销');
  } catch (error) {
    const status = /未找到/.test(error.message)
      ? 404
      : /未来|自然日|日期格式/.test(error.message)
      ? 400
      : 500;
    fail(res, status, status === 500 ? '服务器内部错误' : error.message);
  }
});

router.post('/:id/toggle', authMiddleware, async (req, res) => {
  const date = toDateString(new Date());
  try {
    const habit = await findOwnedHabit(req, res, date);
    if (!habit) return;
    const updated = habit.isCompleted
      ? await db.deleteHabitCheckIn(req.params.id, date)
      : await db.checkInHabit(req.params.id, date);
    ok(
      res,
      serializeHabit(updated),
      habit.isCompleted ? '习惯打卡已撤销' : '习惯打卡成功',
    );
  } catch (error) {
    const status = /停用/.test(error.message)
      ? 409
      : /重复计划/.test(error.message)
      ? 400
      : 500;
    fail(res, status, status === 500 ? '服务器内部错误' : error.message);
  }
});

module.exports = router;
