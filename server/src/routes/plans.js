const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');
const { validateCheckInDetails } = require('../utils/checkInUtils');
const { ok, fail } = require('../utils/http');

const PLAN_FIELDS = [
  'title',
  'totalDays',
  'type',
  'remindSetting',
  'rewords',
  'icon',
  'color',
  'status',
];

const validatePlanData = plan => {
  if (typeof plan.title !== 'string' || !plan.title.trim()) {
    return '计划标题不能为空';
  }
  if (plan.title.trim().length > 100) return '计划标题不能超过100字';
  if (!Number.isInteger(plan.totalDays) || plan.totalDays <= 0) {
    return '总天数必须为正整数';
  }
  if (plan.type !== undefined && ![0, 1, 2].includes(plan.type)) {
    return '计划打卡类型无效';
  }
  if (
    plan.status !== undefined &&
    !['active', 'paused', 'archived'].includes(plan.status)
  ) {
    return '计划状态无效';
  }
  return null;
};

const serializePlan = plan => {
  const data = plan.toJSON();
  delete data.checkIns;
  const currentDays = data.completedDate?.length || 0;
  return {
    ...data,
    id: String(plan.id),
    currentDays,
    progress: Math.min(100, Math.round((currentDays / plan.totalDays) * 100)),
    days: currentDays,
  };
};

const findOwnedPlan = async (req, res) => {
  const plan = await db.getPlanById(req.params.id);
  if (!plan) {
    fail(res, 404, '未找到计划');
    return null;
  }
  if (String(plan.userId) !== String(req.user.id)) {
    fail(res, 403, '无权访问此计划');
    return null;
  }
  return plan;
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const plans = await db.getPlansByUserId(req.userId);
    ok(res, plans.map(serializePlan), '获取计划列表成功');
  } catch (error) {
    console.error('获取计划列表失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await findOwnedPlan(req, res);
    if (!plan) return;
    ok(res, serializePlan(plan), '获取计划详情成功');
  } catch (error) {
    console.error('获取计划详情失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const error = validatePlanData(req.body || {});
  if (error) return fail(res, 400, error);
  try {
    const plan = await db.createPlan({
      ...Object.fromEntries(
        Object.entries(req.body).filter(([key]) => PLAN_FIELDS.includes(key)),
      ),
      title: req.body.title.trim(),
      userId: req.userId,
      type: req.body.type ?? 0,
      remindSetting: req.body.remindSetting || [],
      rewords: req.body.rewords || [],
      icon: req.body.icon || 'flag',
      color: req.body.color || null,
    });
    ok(res, serializePlan(plan), '计划创建成功', 201);
  } catch (caught) {
    console.error('创建计划失败:', caught);
    fail(res, 500, '服务器内部错误');
  }
});

router.put('/reorder', authMiddleware, async (req, res) => {
  const planIds = req.body?.planIds;
  if (
    !Array.isArray(planIds) ||
    new Set(planIds.map(String)).size !== planIds.length
  ) {
    return fail(res, 400, '计划排序数据无效');
  }
  try {
    await db.reorderPlans(req.userId, planIds);
    ok(res, true, '计划顺序已保存');
  } catch (error) {
    fail(res, error.message.includes('排序列表') ? 400 : 500, error.message);
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await findOwnedPlan(req, res);
    if (!plan) return;
    const updates = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) =>
        PLAN_FIELDS.includes(key),
      ),
    );
    if (updates.title !== undefined) updates.title = updates.title.trim();
    if (
      updates.title !== undefined ||
      updates.totalDays !== undefined ||
      updates.type !== undefined ||
      updates.status !== undefined
    ) {
      const error = validatePlanData({ ...plan.toJSON(), ...updates });
      if (error) return fail(res, 400, error);
    }
    if (
      updates.type !== undefined &&
      updates.type !== plan.type &&
      plan.checkIns.length > 0
    ) {
      return fail(res, 409, '已有打卡记录的计划不能更换打卡类型');
    }
    const updated = await db.updatePlan(req.params.id, updates);
    ok(res, serializePlan(updated), '计划更新成功');
  } catch (error) {
    console.error('更新计划失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await findOwnedPlan(req, res);
    if (!plan) return;
    await db.deletePlan(req.params.id);
    ok(res, true, '计划删除成功');
  } catch (error) {
    console.error('删除计划失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.post('/:id/check-in', authMiddleware, async (req, res) => {
  const { date } = req.query;
  if (typeof date !== 'string') return fail(res, 400, '打卡日期为必填项');
  const { numericValue, note } = req.body || {};
  if (
    numericValue !== undefined &&
    (numericValue === null ||
      (typeof numericValue === 'string' && !numericValue.trim()) ||
      !Number.isFinite(Number(numericValue)) ||
      Number(numericValue) < 0 ||
      Number(numericValue) > 9999999999.99)
  ) {
    return fail(res, 400, '数值记录必须为有效的非负数');
  }
  if (note !== undefined && (typeof note !== 'string' || note.length > 5000)) {
    return fail(res, 400, '文字记录格式无效或超过5000字');
  }
  try {
    const plan = await findOwnedPlan(req, res);
    if (!plan) return;
    const detailError = validateCheckInDetails(plan.type, {
      numericValue,
      note,
    });
    if (detailError) return fail(res, 400, detailError);
    const result = await db.checkInPlan(req.params.id, date, {
      numericValue:
        numericValue === undefined ? undefined : Number(numericValue),
      note,
    });
    if (result.created) {
      const achievementService = require('../services/achievementService');
      const stats = await db.getUserStatsByUserId(req.userId);
      await achievementService.checkAndUnlockAchievements(req.userId, stats);
    }
    ok(
      res,
      serializePlan(result.plan),
      result.created ? '打卡成功' : '打卡记录已更新',
    );
  } catch (error) {
    const isDate = /日期|未来|自然日/.test(error.message);
    const isState = /暂停|归档/.test(error.message);
    fail(
      res,
      isDate ? 400 : isState ? 409 : 500,
      isDate || isState ? error.message : '服务器内部错误',
    );
  }
});

router.delete('/:id/check-ins/:date', authMiddleware, async (req, res) => {
  try {
    const plan = await findOwnedPlan(req, res);
    if (!plan) return;
    const updated = await db.deletePlanCheckIn(req.params.id, req.params.date);
    ok(res, serializePlan(updated), '打卡记录已撤销');
  } catch (error) {
    const status = /未找到/.test(error.message)
      ? 404
      : /日期|未来|自然日/.test(error.message)
      ? 400
      : 500;
    fail(res, status, status === 500 ? '服务器内部错误' : error.message);
  }
});

module.exports = router;
