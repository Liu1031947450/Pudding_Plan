const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');

router.get('/week', authMiddleware, async (req, res) => {
  try {
    const data = await db.getWeekRhythmDataByUserId(req.userId);
    res.json({
      success: true,
      data,
      message: 'success'
    });
  } catch (error) {
    console.error('获取周节奏失败:', error);
    res.status(500).json({
      success: false,
      error: '获取周节奏失败'
    });
  }
});

router.get('/month', authMiddleware, async (req, res) => {
  try {
    const data = await db.getMonthRhythmDataByUserId(req.userId);
    res.json({
      success: true,
      data,
      message: 'success'
    });
  } catch (error) {
    console.error('获取月节奏失败:', error);
    res.status(500).json({
      success: false,
      error: '获取月节奏失败'
    });
  }
});

module.exports = router;
