const express = require('express');
const { Follow, User, UserBlock } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { createNotification } = require('../services/notificationService');
const { ok, fail } = require('../utils/http');
const { Op } = require('sequelize');

const router = express.Router();

const isBlocked = async (userId, targetUserId) =>
  Boolean(
    await UserBlock.findOne({
      where: {
        [Op.or]: [
          { blockerId: userId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: userId },
        ],
      },
    }),
  );

router.post('/:id/follow', authMiddleware, async (req, res) => {
  const targetUserId = req.params.id;
  if (targetUserId === req.userId) return fail(res, 400, '不能关注自己');
  try {
    const target = await User.findOne({ where: { userId: targetUserId } });
    if (!target) return fail(res, 404, '用户不存在');
    if (await isBlocked(req.userId, targetUserId))
      return fail(res, 403, '双方存在拉黑关系');
    const [, created] = await Follow.findOrCreate({
      where: { userId: req.userId, followingId: targetUserId },
    });
    if (created) {
      await createNotification({
        userId: target.id,
        senderId: req.user.id,
        type: 'follow',
        title: '收到新的关注',
        message: `${req.user.username} 关注了你`,
        targetType: 'user',
        targetId: req.user.id,
      });
    }
    ok(res, true, created ? '关注成功' : '已经关注过了');
  } catch (error) {
    console.error('关注失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.delete('/:id/follow', authMiddleware, async (req, res) => {
  try {
    await Follow.destroy({
      where: { userId: req.userId, followingId: req.params.id },
    });
    ok(res, true, '已取消关注');
  } catch (error) {
    console.error('取消关注失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

module.exports = router;
