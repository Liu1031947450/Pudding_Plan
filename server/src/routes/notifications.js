const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { CircleMoment, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const {
  canViewNotification,
  getViewerContext,
} = require('../services/communityAccess');
const { ok, fail } = require('../utils/http');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    let notifications = await db.getNotificationsByUserId(req.userId);
    const momentIds = [
      ...new Set(
        notifications
          .filter(notification => notification.targetType === 'moment')
          .map(notification => notification.targetId)
          .filter(Boolean),
      ),
    ];
    const [context, moments] = await Promise.all([
      getViewerContext(req.userId),
      momentIds.length
        ? CircleMoment.findAll({
            where: { id: momentIds },
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['userId'],
              },
            ],
          })
        : [],
    ]);
    const momentsById = new Map(
      moments.map(moment => [String(moment.id), moment]),
    );
    notifications = notifications.filter(notification =>
      canViewNotification(notification, context, momentsById),
    );

    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }

    ok(res, notifications, '获取通知列表成功');
  } catch (error) {
    console.error('获取通知列表失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.markNotificationAsRead(req.userId, id);
    ok(res, true, '通知已标记为已读');
  } catch (error) {
    console.error('标记通知已读失败:', error);
    fail(
      res,
      /未找到/.test(error.message) ? 404 : 500,
      error.message || '服务器内部错误',
    );
  }
});

router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await db.markAllNotificationsAsRead(req.userId);
    ok(res, true, '所有通知已标记为已读');
  } catch (error) {
    console.error('全部标记已读失败:', error);
    fail(res, 500, error.message || '服务器内部错误');
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteNotification(req.userId, id);
    ok(res, true, '通知删除成功');
  } catch (error) {
    console.error('删除通知失败:', error);
    fail(
      res,
      /未找到/.test(error.message) ? 404 : 500,
      error.message || '服务器内部错误',
    );
  }
});

module.exports = router;
