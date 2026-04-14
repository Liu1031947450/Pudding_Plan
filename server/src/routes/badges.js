const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const badges = await db.getBadgesByUserId(req.userId);
    res.json({
      success: true,
      data: badges,
      message: 'success'
    });
  } catch (error) {
    console.error('获取徽章失败:', error);
    res.status(500).json({
      success: false,
      error: '获取徽章失败'
    });
  }
});

module.exports = router;
