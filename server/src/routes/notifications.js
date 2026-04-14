const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');

const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({
    success,
    data,
    message,
    error,
  });
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    let notifications = await db.getNotificationsByUserId(req.userId);

    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }

    sendResponse(res, true, notifications, '获取通知列表成功');
  } catch (error) {
    console.error('获取通知列表失败:', error);
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.markNotificationAsRead(req.userId, id);
    sendResponse(res, true, true, '通知已标记为已读');
  } catch (error) {
    console.error('标记通知已读失败:', error);
    sendResponse(res, false, null, '', error.message || '服务器内部错误');
  }
});

router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await db.markAllNotificationsAsRead(req.userId);
    sendResponse(res, true, true, '所有通知已标记为已读');
  } catch (error) {
    console.error('全部标记已读失败:', error);
    sendResponse(res, false, null, '', error.message || '服务器内部错误');
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteNotification(req.userId, id);
    sendResponse(res, true, true, '通知删除成功');
  } catch (error) {
    console.error('删除通知失败:', error);
    sendResponse(res, false, null, '', error.message || '服务器内部错误');
  }
});

module.exports = router;
