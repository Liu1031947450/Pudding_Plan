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

// 获取所有圈子
router.get('/', (req, res) => {
  try {
    sendResponse(res, true, [...db.circles], '获取圈子列表成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 根据 ID 获取单个圈子
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = db.circles.find(c => c.id === id) || null;
    sendResponse(res, true, data, '获取圈子详情成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 加入圈子
router.post('/:id/join', (req, res) => {
  try {
    const { id } = req.params;
    const circle = db.circles.find(c => c.id === id);
    sendResponse(res, true, !!circle, '加入圈子成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 创建动态 (Moment)
router.post('/', (req, res) => {
  try {
    const moment = req.body;
    const newMoment = {
      id: `m_${Date.now()}`,
      title: moment.title || '',
      description: moment.description,
      content: moment.content,
      members: moment.members || '1',
      type: 'waterfall',
      imageUri: moment.imageUri,
      images: moment.images,
      category: moment.category,
      authorName: moment.authorName || '我',
      authorAvatarUri: moment.authorAvatarUri || 'https://i.pravatar.cc/150?u=me',
      likes: 0,
      commentsCount: 0,
      comments: [],
      isLiked: false,
      isCollected: false,
    };
    db.circles.unshift(newMoment);
    sendResponse(res, true, newMoment, '发布动态成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 点赞圈子动态
router.post('/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const circle = db.circles.find(c => c.id === id);
    if (!circle) {
      return sendResponse(res, false, null, '', '未找到圈子动态');
    }
    if (!circle.isLiked) {
      circle.isLiked = true;
      circle.likes += 1;
    }
    sendResponse(res, true, true, '点赞成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 取消点赞
router.delete('/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const circle = db.circles.find(c => c.id === id);
    if (!circle) {
      return sendResponse(res, false, null, '', '未找到圈子动态');
    }
    if (circle.isLiked) {
      circle.isLiked = false;
      circle.likes = Math.max(0, circle.likes - 1);
    }
    sendResponse(res, true, true, '取消点赞成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 收藏圈子动态
router.post('/:id/collect', (req, res) => {
  try {
    const { id } = req.params;
    const circle = db.circles.find(c => c.id === id);
    if (!circle) {
      return sendResponse(res, false, null, '', '未找到圈子动态');
    }
    circle.isCollected = true;
    sendResponse(res, true, true, '收藏成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 取消收藏
router.delete('/:id/collect', (req, res) => {
  try {
    const { id } = req.params;
    const circle = db.circles.find(c => c.id === id);
    if (!circle) {
      return sendResponse(res, false, null, '', '未找到圈子动态');
    }
    circle.isCollected = false;
    sendResponse(res, true, true, '取消收藏成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 获取附近推荐地点
router.get('/locations/nearby', (req, res) => {
  try {
    sendResponse(res, true, [...db.locations], '获取附近地点成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 获取热门话题
router.get('/topics/trending', (req, res) => {
  try {
    sendResponse(res, true, [...db.topics], '获取热门话题成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

module.exports = router;
