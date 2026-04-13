const express = require('express');
const router = express.Router();
const db = require('../data/database');

// 统一响应格式函数
const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({
    success,
    data,
    message,
    error
  });
};

// 验证计划数据
const validatePlanData = (plan) => {
  if (!plan.title || !plan.totalDays) {
    return { valid: false, error: '计划标题和总天数为必填项' };
  }
  if (typeof plan.totalDays !== 'number' || plan.totalDays <= 0) {
    return { valid: false, error: '总天数必须为正整数' };
  }
  return { valid: true };
};

// 获取所有计划
router.get('/', (req, res) => {
  try {
    sendResponse(res, true, db.plans, '获取计划列表成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 获取单个计划
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const plan = db.plans.find(p => p.id === id);
    if (!plan) {
      return sendResponse(res, false, null, '', '未找到计划');
    }
    sendResponse(res, true, plan, '获取计划详情成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 创建计划
router.post('/', (req, res) => {
  try {
    const plan = req.body;
    
    // 验证数据
    const validation = validatePlanData(plan);
    if (!validation.valid) {
      return sendResponse(res, false, null, '', validation.error);
    }
    
    const newPlan = {
      ...plan,
      id: Date.now().toString(),
      completedDate: plan.completedDate || [],
      currentDays: 0,
      progress: 0,
      days: 0
    };
    
    db.plans.push(newPlan);
    sendResponse(res, true, newPlan, '计划创建成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 更新计划
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const index = db.plans.findIndex(p => p.id === id);
    if (index === -1) {
      return sendResponse(res, false, null, '', '未找到计划');
    }
    
    // 验证更新数据
    if (updates.title || updates.totalDays) {
      const validation = validatePlanData({ ...db.plans[index], ...updates });
      if (!validation.valid) {
        return sendResponse(res, false, null, '', validation.error);
      }
    }
    
    db.plans[index] = { ...db.plans[index], ...updates };
    
    // 重新计算进度
    if (updates.completedDate || updates.totalDays) {
      const updatedPlan = db.plans[index];
      updatedPlan.currentDays = updatedPlan.completedDate.length;
      updatedPlan.days = updatedPlan.currentDays;
      updatedPlan.progress = Math.round((updatedPlan.currentDays / updatedPlan.totalDays) * 100);
    }
    
    sendResponse(res, true, db.plans[index], '计划更新成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 删除计划
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = db.plans.findIndex(p => p.id === id);
    if (index === -1) {
      return sendResponse(res, false, null, '', '未找到计划');
    }
    
    db.plans.splice(index, 1);
    sendResponse(res, true, true, '计划删除成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 计划打卡
router.post('/:id/check-in', (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return sendResponse(res, false, null, '', '打卡日期为必填项');
    }
    
    const plan = db.plans.find(p => p.id === id);
    if (!plan) {
      return sendResponse(res, false, null, '', '未找到计划');
    }
    
    if (!plan.completedDate.includes(date)) {
      plan.completedDate.push(date);
      plan.currentDays = plan.completedDate.length;
      plan.days = plan.currentDays;
      plan.progress = Math.round((plan.currentDays / plan.totalDays) * 100);
    }
    
    sendResponse(res, true, plan, '打卡成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

module.exports = router;
