const express = require('express');
const router = express.Router();
const db = require('../data/database');

// 统一响应格式函数
const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({
    success,
    data,
    message,
    error
  });
};

// 获取通知列表
router.get('/', (req, res) => {
  try {
    const { unreadOnly } = req.query;
    
    let notifications = [...db.notifications];
    
    // 过滤未读通知
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }
    
    // 这里可以根据 userId 过滤通知
    // 目前返回所有通知
    
    sendResponse(res, true, notifications, '获取通知列表成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 标记通知为已读
router.patch('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = db.notifications.find(n => n.id === id);
    if (!notification) {
      return sendResponse(res, false, null, '', '未找到通知');
    }
    
    notification.read = true;
    sendResponse(res, true, true, '通知已标记为已读');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 标记所有通知为已读
router.patch('/read-all', (req, res) => {
  try {
    db.notifications.forEach(notification => {
      notification.read = true;
    });
    
    sendResponse(res, true, true, '所有通知已标记为已读');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 删除通知
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const index = db.notifications.findIndex(n => n.id === id);
    if (index === -1) {
      return sendResponse(res, false, null, '', '未找到通知');
    }
    
    db.notifications.splice(index, 1);
    sendResponse(res, true, true, '通知删除成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

module.exports = router;
