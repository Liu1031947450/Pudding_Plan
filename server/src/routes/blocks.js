const express = require('express');
const { Op } = require('sequelize');
const {
  BuddyRelationship,
  Follow,
  Notification,
  User,
  UserBlock,
} = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { ok, fail } = require('../utils/http');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const blocks = await UserBlock.findAll({
      where: { blockerId: req.userId },
      include: [
        {
          model: User,
          as: 'blockedUser',
          attributes: ['userId', 'username', 'avatar', 'bio', 'goalTags'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    ok(
      res,
      blocks.map(block => ({
        id: String(block.id),
        user: block.blockedUser,
        createdAt: block.createdAt,
      })),
      '获取黑名单成功',
    );
  } catch (error) {
    console.error('获取黑名单失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const targetUserId = req.body?.userId;
  if (!targetUserId || targetUserId === req.userId)
    return fail(res, 400, '拉黑目标无效');
  try {
    const target = await User.findOne({ where: { userId: targetUserId } });
    if (!target) return fail(res, 404, '用户不存在');
    await User.sequelize.transaction(async transaction => {
      await UserBlock.findOrCreate({
        where: { blockerId: req.userId, blockedId: targetUserId },
        transaction,
      });
      await Follow.destroy({
        where: {
          [Op.or]: [
            { userId: req.userId, followingId: targetUserId },
            { userId: targetUserId, followingId: req.userId },
          ],
        },
        transaction,
      });
      await BuddyRelationship.destroy({
        where: {
          [Op.or]: [
            { requesterId: req.userId, addresseeId: targetUserId },
            { requesterId: targetUserId, addresseeId: req.userId },
          ],
        },
        transaction,
      });
      await Notification.destroy({
        where: {
          [Op.or]: [
            { userId: req.user.id, senderId: target.id },
            { userId: target.id, senderId: req.user.id },
          ],
        },
        transaction,
      });
    });
    ok(res, true, '已加入黑名单');
  } catch (error) {
    console.error('拉黑用户失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const deleted = await UserBlock.destroy({
      where: { blockerId: req.userId, blockedId: req.params.userId },
    });
    if (!deleted) return fail(res, 404, '该用户不在黑名单中');
    ok(res, true, '已移出黑名单');
  } catch (error) {
    console.error('取消拉黑失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

module.exports = router;
