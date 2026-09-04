const express = require('express');
const { Op } = require('sequelize');
const {
  BuddyRelationship,
  Notification,
  User,
  UserBlock,
} = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { createNotification } = require('../services/notificationService');
const { ok, fail } = require('../utils/http');

const router = express.Router();
const userAttributes = [
  'id',
  'userId',
  'username',
  'avatar',
  'bio',
  'goalTags',
];

const serializeUser = user => ({
  userId: user.userId,
  username: user.username,
  avatar: user.avatar,
  bio: user.bio,
  goalTags: user.goalTags || [],
});

const relationshipWhere = userId => ({
  [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
});

const serializeRelationship = (relationship, viewerId) => {
  const other =
    relationship.requesterId === viewerId
      ? relationship.addressee
      : relationship.requester;
  return {
    id: String(relationship.id),
    status: relationship.status,
    direction: relationship.requesterId === viewerId ? 'outgoing' : 'incoming',
    user: serializeUser(other),
    createdAt: relationship.createdAt,
  };
};

const findRelationship = id =>
  BuddyRelationship.findByPk(id, {
    include: [
      { model: User, as: 'requester', attributes: userAttributes },
      { model: User, as: 'addressee', attributes: userAttributes },
    ],
  });

router.get('/', authMiddleware, async (req, res) => {
  try {
    const relationships = await BuddyRelationship.findAll({
      where: { status: 'accepted', ...relationshipWhere(req.userId) },
      include: [
        { model: User, as: 'requester', attributes: userAttributes },
        { model: User, as: 'addressee', attributes: userAttributes },
      ],
      order: [['updatedAt', 'DESC']],
    });
    ok(
      res,
      relationships.map(item => serializeRelationship(item, req.userId)),
      '获取搭子列表成功',
    );
  } catch (error) {
    console.error('获取搭子列表失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const [users, relationships, blocks] = await Promise.all([
      User.findAll({
        where: { userId: { [Op.ne]: req.userId } },
        attributes: userAttributes,
      }),
      BuddyRelationship.findAll({ where: relationshipWhere(req.userId) }),
      UserBlock.findAll({
        where: {
          [Op.or]: [{ blockerId: req.userId }, { blockedId: req.userId }],
        },
      }),
    ]);
    const excluded = new Set(
      relationships.map(item =>
        item.requesterId === req.userId ? item.addresseeId : item.requesterId,
      ),
    );
    for (const block of blocks) {
      excluded.add(
        block.blockerId === req.userId ? block.blockedId : block.blockerId,
      );
    }
    const ownTags = new Set(req.user.goalTags || []);
    const data = users
      .filter(user => !excluded.has(user.userId))
      .map(user => ({
        id: user.userId,
        name: user.username,
        goal: user.bio || '一起完成今天的小目标',
        avatarUri: user.avatar,
        goalTags: user.goalTags || [],
        matchCount: (user.goalTags || []).filter(tag => ownTags.has(tag))
          .length,
      }))
      .sort(
        (a, b) =>
          b.matchCount - a.matchCount || a.name.localeCompare(b.name, 'zh-CN'),
      );
    ok(res, data.slice(0, 20), '获取搭子推荐成功');
  } catch (error) {
    console.error('获取搭子推荐失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const relationships = await BuddyRelationship.findAll({
      where: relationshipWhere(req.userId),
      include: [
        { model: User, as: 'requester', attributes: userAttributes },
        { model: User, as: 'addressee', attributes: userAttributes },
      ],
      order: [['createdAt', 'DESC']],
    });
    const serialized = relationships.map(item =>
      serializeRelationship(item, req.userId),
    );
    ok(
      res,
      {
        incoming: serialized.filter(
          item => item.status === 'pending' && item.direction === 'incoming',
        ),
        outgoing: serialized.filter(
          item => item.status === 'pending' && item.direction === 'outgoing',
        ),
        buddies: serialized.filter(item => item.status === 'accepted'),
      },
      '获取搭子中心数据成功',
    );
  } catch (error) {
    console.error('获取搭子请求失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.post('/requests', authMiddleware, async (req, res) => {
  const targetUserId = req.body?.userId;
  if (!targetUserId || targetUserId === req.userId)
    return fail(res, 400, '搭子请求目标无效');
  try {
    const [target, blocked, existing] = await Promise.all([
      User.findOne({ where: { userId: targetUserId } }),
      UserBlock.findOne({
        where: {
          [Op.or]: [
            { blockerId: req.userId, blockedId: targetUserId },
            { blockerId: targetUserId, blockedId: req.userId },
          ],
        },
      }),
      BuddyRelationship.findOne({
        where: {
          [Op.or]: [
            { requesterId: req.userId, addresseeId: targetUserId },
            { requesterId: targetUserId, addresseeId: req.userId },
          ],
        },
      }),
    ]);
    if (!target) return fail(res, 404, '用户不存在');
    if (blocked) return fail(res, 403, '双方存在拉黑关系');
    if (existing) return fail(res, 409, '搭子关系或请求已存在');
    const relationship = await BuddyRelationship.create({
      requesterId: req.userId,
      addresseeId: targetUserId,
      status: 'pending',
    });
    await createNotification({
      userId: target.id,
      senderId: req.user.id,
      type: 'buddy_request',
      title: '新的搭子请求',
      message: `${req.user.username} 想和你成为成长搭子`,
      targetType: 'buddy',
      targetId: relationship.id,
    });
    ok(res, { id: String(relationship.id) }, '搭子请求已发送', 201);
  } catch (error) {
    console.error('发送搭子请求失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.post('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const relationship = await findRelationship(req.params.id);
    if (!relationship) return fail(res, 404, '搭子请求不存在');
    if (relationship.addresseeId !== req.userId)
      return fail(res, 403, '无权接受此请求');
    if (relationship.status !== 'pending')
      return fail(res, 409, '该请求已处理');
    await relationship.update({ status: 'accepted' });
    const requester = relationship.requester;
    await createNotification({
      userId: requester.id,
      senderId: req.user.id,
      type: 'buddy_accepted',
      title: '搭子请求已接受',
      message: `${req.user.username} 已成为你的成长搭子`,
      targetType: 'buddy',
      targetId: relationship.id,
    });
    ok(res, serializeRelationship(relationship, req.userId), '已成为搭子');
  } catch (error) {
    console.error('接受搭子请求失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.post('/:id/reject', authMiddleware, async (req, res) => {
  try {
    const relationship = await BuddyRelationship.findByPk(req.params.id);
    if (!relationship) return fail(res, 404, '搭子请求不存在');
    if (
      relationship.addresseeId !== req.userId ||
      relationship.status !== 'pending'
    ) {
      return fail(res, 403, '无权拒绝此请求');
    }
    await relationship.destroy();
    ok(res, true, '已拒绝搭子请求');
  } catch (error) {
    console.error('拒绝搭子请求失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.delete('/requests/:id', authMiddleware, async (req, res) => {
  try {
    const relationship = await BuddyRelationship.findByPk(req.params.id);
    if (!relationship) return fail(res, 404, '搭子请求不存在');
    if (
      relationship.requesterId !== req.userId ||
      relationship.status !== 'pending'
    ) {
      return fail(res, 403, '无权取消此请求');
    }
    await relationship.destroy();
    ok(res, true, '搭子请求已取消');
  } catch (error) {
    console.error('取消搭子请求失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.post('/:id/encouragement', authMiddleware, async (req, res) => {
  try {
    const relationship = await findRelationship(req.params.id);
    if (!relationship) return fail(res, 404, '搭子关系不存在');
    if (
      relationship.status !== 'accepted' ||
      ![relationship.requesterId, relationship.addresseeId].includes(req.userId)
    ) {
      return fail(res, 403, '无权向该用户发送鼓励');
    }
    const recipient =
      relationship.requesterId === req.userId
        ? relationship.addressee
        : relationship.requester;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await Notification.findOne({
      where: {
        userId: recipient.id,
        senderId: req.user.id,
        type: 'buddy_encouragement',
        targetType: 'buddy',
        targetId: relationship.id,
        createdAt: { [Op.gte]: since },
      },
    });
    if (recent) return fail(res, 429, '每天只能给同一位搭子发送一次鼓励');
    await createNotification({
      userId: recipient.id,
      senderId: req.user.id,
      type: 'buddy_encouragement',
      title: '搭子为你加油',
      message: `${req.user.username} 给你送来一份鼓励：今天也一起坚持吧！`,
      targetType: 'buddy',
      targetId: relationship.id,
    });
    ok(res, true, '鼓励已送达');
  } catch (error) {
    console.error('发送鼓励失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const relationship = await BuddyRelationship.findByPk(req.params.id);
    if (!relationship) return fail(res, 404, '搭子关系不存在');
    if (
      relationship.status !== 'accepted' ||
      ![relationship.requesterId, relationship.addresseeId].includes(req.userId)
    ) {
      return fail(res, 403, '无权解除此搭子关系');
    }
    await relationship.destroy();
    ok(res, true, '搭子关系已解除');
  } catch (error) {
    console.error('解除搭子关系失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

module.exports = router;
