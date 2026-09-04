const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');
const { ok, fail } = require('../utils/http');

router.get('/week', authMiddleware, async (req, res) => {
  try {
    const data = await db.getWeekRhythmDataByUserId(req.userId);
    ok(res, data, '获取周节奏成功');
  } catch (error) {
    console.error('获取周节奏失败:', error);
    fail(res, 500, '获取周节奏失败');
  }
});

router.get('/month', authMiddleware, async (req, res) => {
  try {
    const data = await db.getMonthRhythmDataByUserId(req.userId);
    ok(res, data, '获取月节奏成功');
  } catch (error) {
    console.error('获取月节奏失败:', error);
    fail(res, 500, '获取月节奏失败');
  }
});

module.exports = router;
