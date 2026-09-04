const express = require('express');
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');
const { ok, fail } = require('../utils/http');

const router = express.Router();

router.get('/history', authMiddleware, async (req, res) => {
  const requestedLimit = Number(req.query.limit || 100);
  if (
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1 ||
    requestedLimit > 200
  ) {
    return fail(res, 400, 'limit 必须是1至200之间的整数');
  }
  try {
    ok(
      res,
      await db.getActivityHistoryByUserId(req.userId, requestedLimit),
      '获取活动记录成功',
    );
  } catch (error) {
    console.error('获取活动记录失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

module.exports = router;
