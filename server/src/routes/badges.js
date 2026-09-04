const express = require('express');
const router = express.Router();
const db = require('../data/database');
const achievementService = require('../services/achievementService');
const { authMiddleware } = require('../middleware/auth');
const { ok, fail } = require('../utils/http');

router.get('/', authMiddleware, async (req, res) => {
  try {
    let stats = null;
    try {
      stats = await db.getUserStatsByUserId(req.userId);
    } catch (e) {
      console.warn(
        `[Badges] 无法获取用户 ${req.userId} 的统计数据:`,
        e.message,
      );
    }

    const items = await achievementService.getUserAchievements(
      req.userId,
      stats,
    );
    ok(res, items, '获取成就列表成功');
  } catch (error) {
    console.error('获取成就失败:', error);
    fail(res, 500, '获取成就失败');
  }
});

module.exports = router;
