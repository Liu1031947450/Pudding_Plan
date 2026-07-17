const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');
const { validateCheckInDetails } = require('../utils/checkInUtils');

// 统一响应格式函数
const sendResponse = (
  res,
  statusCode,
  success,
  data,
  message = '',
  error = null,
) => {
  res.status(statusCode).json({
    success,
    data,
    message,
    error,
  });
};

// 验证计划数据
const validatePlanData = plan => {
  if (typeof plan.title !== 'string' || !plan.title.trim()) {
    return { valid: false, error: '计划标题和总天数为必填项' };
  }
  if (plan.title.length > 100) {
    return { valid: false, error: '计划标题不能超过100字' };
  }
  if (!Number.isInteger(plan.totalDays) || plan.totalDays <= 0) {
    return { valid: false, error: '总天数必须为正整数' };
  }
  if (plan.type !== undefined && ![0, 1, 2].includes(plan.type)) {
    return { valid: false, error: '计划打卡类型无效' };
  }
  return { valid: true };
};

// 计算派生字段
const calculateDerivedFields = plan => {
  const currentDays = plan.completedDate ? plan.completedDate.length : 0;
  const progress = Math.round((currentDays / plan.totalDays) * 100);
  const data = plan.toJSON();
  delete data.checkIns;
  return {
    ...data,
    id: String(plan.id),
    currentDays,
    progress,
    days: currentDays,
  };
};

// 根据 UUID userId 查找用户内部 id
async function getUserInternalId(userId) {
  const user = await db.getUserByUserId(userId);
  return user ? String(user.id) : null;
}

// 获取所有计划（需要认证）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const plans = await db.getPlansByUserId(req.userId);
    const plansWithDerived = plans.map(calculateDerivedFields);
    sendResponse(res, 200, true, plansWithDerived, '获取计划列表成功');
  } catch (error) {
    console.error('获取计划列表失败:', error);
    sendResponse(res, 500, false, null, '', '服务器内部错误');
  }
});

// 获取单个计划（需要认证）
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await db.getPlanById(id);

    if (!plan) {
      return sendResponse(res, 404, false, null, '', '未找到计划');
    }

    // 验证计划所有权：把 JWT 里的 UUID 转成内部 id 再比较
    const internalUserId = await getUserInternalId(req.userId);
    if (!internalUserId) {
      return sendResponse(res, 404, false, null, '', '当前用户不存在');
    }
    if (String(plan.userId) !== internalUserId) {
      return sendResponse(res, 403, false, null, '', '无权访问此计划');
    }

    const planWithDerived = calculateDerivedFields(plan);
    sendResponse(res, 200, true, planWithDerived, '获取计划详情成功');
  } catch (error) {
    console.error('获取计划详情失败:', error);
    sendResponse(res, 500, false, null, '', '服务器内部错误');
  }
});

// 创建计划（需要认证）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const planData = req.body;

    // 验证数据
    const validation = validatePlanData(planData);
    if (!validation.valid) {
      return sendResponse(res, 400, false, null, '', validation.error);
    }

    const internalUserId = await getUserInternalId(req.userId);
    if (!internalUserId) {
      return sendResponse(res, 404, false, null, '', '当前用户不存在');
    }

    const newPlan = await db.createPlan({
      ...planData,
      userId: req.userId,
      completedDate: [],
      type: planData.type ?? 0,
      remindSetting: planData.remindSetting || [],
      rewords: planData.rewords || [],
      icon: planData.icon || 'flag',
      color: planData.color || null,
    });

    const planWithDerived = calculateDerivedFields(newPlan);
    sendResponse(res, 201, true, planWithDerived, '计划创建成功');
  } catch (error) {
    console.error('创建计划失败:', error);
    sendResponse(res, 500, false, null, '', '服务器内部错误');
  }
});

router.put('/reorder', authMiddleware, async (req, res) => {
  const { planIds } = req.body || {};
  if (
    !Array.isArray(planIds) ||
    new Set(planIds.map(String)).size !== planIds.length
  ) {
    return sendResponse(res, 400, false, null, '', '计划排序数据无效');
  }

  try {
    await db.reorderPlans(req.userId, planIds);
    sendResponse(res, 200, true, true, '计划顺序已保存');
  } catch (error) {
    const isInvalid = error.message.includes('排序列表');
    sendResponse(
      res,
      isInvalid ? 400 : 500,
      false,
      null,
      '',
      isInvalid ? error.message : '服务器内部错误',
    );
  }
});

// 更新计划（需要认证）
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) =>
        [
          'title',
          'totalDays',
          'type',
          'remindSetting',
          'rewords',
          'icon',
          'color',
        ].includes(key),
      ),
    );

    const plan = await db.getPlanById(id);
    if (!plan) {
      return sendResponse(res, 404, false, null, '', '未找到计划');
    }

    const internalUserId = await getUserInternalId(req.userId);
    if (!internalUserId) {
      return sendResponse(res, 404, false, null, '', '当前用户不存在');
    }
    if (String(plan.userId) !== internalUserId) {
      return sendResponse(res, 403, false, null, '', '无权修改此计划');
    }

    // 验证更新数据
    if (
      updates.title !== undefined ||
      updates.totalDays !== undefined ||
      updates.type !== undefined
    ) {
      const validation = validatePlanData({ ...plan.toJSON(), ...updates });
      if (!validation.valid) {
        return sendResponse(res, 400, false, null, '', validation.error);
      }
    }
    if (
      updates.type !== undefined &&
      updates.type !== plan.type &&
      plan.completedDate.length > 0
    ) {
      return sendResponse(
        res,
        400,
        false,
        null,
        '',
        '已有打卡记录的计划不能更换打卡类型',
      );
    }

    const updatedPlan = await db.updatePlan(id, updates);
    const planWithDerived = calculateDerivedFields(updatedPlan);

    sendResponse(res, 200, true, planWithDerived, '计划更新成功');
  } catch (error) {
    console.error('更新计划失败:', error);
    sendResponse(res, 500, false, null, '', '服务器内部错误');
  }
});

// 删除计划（需要认证）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await db.getPlanById(id);
    if (!plan) {
      return sendResponse(res, 404, false, null, '', '未找到计划');
    }

    const internalUserId = await getUserInternalId(req.userId);
    if (!internalUserId) {
      return sendResponse(res, 404, false, null, '', '当前用户不存在');
    }
    if (String(plan.userId) !== internalUserId) {
      return sendResponse(res, 403, false, null, '', '无权删除此计划');
    }

    await db.deletePlan(id);
    sendResponse(res, 200, true, true, '计划删除成功');
  } catch (error) {
    console.error('删除计划失败:', error);
    sendResponse(res, 500, false, null, '', '服务器内部错误');
  }
});

// 计划打卡（需要认证）
router.post('/:id/check-in', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const { numericValue, note } = req.body || {};

    if (!date || typeof date !== 'string') {
      return sendResponse(res, 400, false, null, '', '打卡日期为必填项');
    }
    if (
      numericValue !== undefined &&
      (numericValue === null ||
        (typeof numericValue === 'string' && numericValue.trim() === '') ||
        !Number.isFinite(Number(numericValue)) ||
        Number(numericValue) < 0 ||
        Number(numericValue) > 9999999999.99)
    ) {
      return sendResponse(
        res,
        400,
        false,
        null,
        '',
        '数值记录必须为有效的非负数',
      );
    }
    if (note !== undefined && typeof note !== 'string') {
      return sendResponse(res, 400, false, null, '', '文字记录格式无效');
    }
    if (typeof note === 'string' && note.length > 5000) {
      return sendResponse(res, 400, false, null, '', '文字记录不能超过5000字');
    }

    const plan = await db.getPlanById(id);
    if (!plan) {
      return sendResponse(res, 404, false, null, '', '未找到计划');
    }

    const internalUserId = await getUserInternalId(req.userId);
    if (!internalUserId) {
      return sendResponse(res, 404, false, null, '', '当前用户不存在');
    }
    if (String(plan.userId) !== internalUserId) {
      return sendResponse(res, 403, false, null, '', '无权操作此计划');
    }

    const detailError = validateCheckInDetails(plan.type, {
      numericValue,
      note,
    });
    if (detailError) {
      return sendResponse(res, 400, false, null, '', detailError);
    }

    const result = await db.checkInPlan(id, date, {
      numericValue:
        numericValue === undefined ? undefined : Number(numericValue),
      note,
    });
    if (result.created) {
      // 实时触发成就检查
      const achievementService = require('../services/achievementService');
      const stats = await db.getUserStatsByUserId(req.userId);
      const newlyUnlocked = await achievementService.checkAndUnlockAchievements(
        req.userId,
        stats,
      );

      if (newlyUnlocked.length > 0) {
        console.log(
          `[Achievement] 用户 ${req.userId} 新解锁成就: ${newlyUnlocked.join(
            ', ',
          )}`,
        );
        // 这里后续可以集成 Socket.io 推送提醒
      }
    }

    const planWithDerived = calculateDerivedFields(result.plan);
    const updatedDetails = numericValue !== undefined || note !== undefined;
    sendResponse(
      res,
      200,
      true,
      planWithDerived,
      result.created
        ? '打卡成功'
        : updatedDetails
        ? '打卡记录已更新'
        : '今日已打卡',
    );
  } catch (error) {
    console.error('打卡失败:', error);
    const statusCode = error.message === '打卡日期格式无效' ? 400 : 500;
    sendResponse(
      res,
      statusCode,
      false,
      null,
      '',
      statusCode === 400 ? error.message : '服务器内部错误',
    );
  }
});

module.exports = router;
