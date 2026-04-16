const express = require('express');
const router = express.Router();
const db = require('../data/database');
const achievementService = require('../services/achievementService');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log(`[Badges] 用户 ${req.userId} 正在请求成就列表...`);
    
    // 获取用户实时统计数据
    let stats = null;
    try {
      stats = await db.getUserStatsByUserId(req.userId);
    } catch (e) {
      console.warn(`[Badges] 无法获取用户 ${req.userId} 的统计数据:`, e.message);
    }
    
    // 获取标准化的成就列表（自动合并解锁记录）
    // 即使 stats 为 null，achievementService 现在也会使用兜底数据
    const items = await achievementService.getUserAchievements(req.userId, stats);
    
    console.log(`[Badges] 成功返回 ${items.length} 项成就给用户 ${req.userId}`);
    
    res.json({
      success: true,
      data: items,
      message: 'success',
    });
  } catch (error) {
    console.error('[Badges] 获取成就路由严重错误:', error);
    res.status(500).json({
      success: false,
      error: '获取成就失败',
      details: error.message
    });
  }
});

module.exports = router;
