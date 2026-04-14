const express = require('express');
const router = express.Router();
const { mockCircles, mockLocations, mockTopics } = require('../data/mockData/communityData');
const { authMiddleware } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');
const { User, CircleMoment } = require('../models');

// 用户点赞/收藏状态（按用户存储，内存）
const userLikes = new Map();
const userCollects = new Map();

const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({ success, data, message, error });
};

// 序列化动态为前端结构
function serializeMoment(moment, userId) {
  const author = moment.author || {};
  const id = String(moment.id);
  const userLikeSet = userLikes.get(userId) || new Set();
  const userCollectSet = userCollects.get(userId) || new Set();

  return {
    id,
    title: moment.title || '',
    description: moment.description || '',
    content: moment.content || '',
    members: '1',
    type: 'waterfall',
    imageUri: moment.imageUri || null,
    images: moment.images || [],
    category: moment.category || '',
    authorUserId: author.userId || null,
    authorName: author.username || '匿名用户',
    authorAvatarUri: author.avatar || null,
    likes: moment.likes || 0,
    commentsCount: moment.commentsCount || 0,
    comments: [],
    isLiked: userLikeSet.has(id),
    isCollected: userCollectSet.has(id),
  };
}

// 获取所有动态（从数据库读取）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const moments = await CircleMoment.findAll({
      include: [{ model: User, as: 'author', attributes: ['userId', 'username', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });

    const data = moments.map(m => serializeMoment(m, req.userId));
    sendResponse(res, true, data, '获取圈子列表成功');
  } catch (error) {
    console.error('获取圈子列表失败:', error);
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 获取附近推荐地点
router.get('/locations/nearby', (req, res) => {
  try {
    sendResponse(res, true, [...mockLocations], '获取附近地点成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 获取热门话题
router.get('/topics/trending', (req, res) => {
  try {
    sendResponse(res, true, [...mockTopics], '获取热门话题成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 根据 ID 获取单个动态
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const moment = await CircleMoment.findByPk(id, {
      include: [{ model: User, as: 'author', attributes: ['userId', 'username', 'avatar'] }],
    });

    if (!moment) {
      return sendResponse(res, true, null, '获取圈子详情成功');
    }

    sendResponse(res, true, serializeMoment(moment, req.userId), '获取圈子详情成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 图片上传接口
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return sendResponse(res, false, null, '', '请选择图片上传');
    }
    const imageUrl = getFileUrl(req, req.file.filename);
    sendResponse(res, true, imageUrl, '图片上传成功');
  } catch (error) {
    console.error('图片上传失败:', error);
    sendResponse(res, false, null, '', '图片上传失败');
  }
});

// 加入圈子（保留兼容）
router.post('/:id/join', (req, res) => {
  sendResponse(res, true, true, '加入圈子成功');
});

// 创建动态（写入数据库）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const author = await User.findOne({
      where: { userId: req.userId },
      attributes: ['id', 'userId', 'username', 'avatar'],
    });

    if (!author) {
      return sendResponse(res, false, null, '', '当前用户不存在');
    }

    const moment = await CircleMoment.create({
      authorId: author.id,
      title: body.title || '',
      description: body.description || '',
      content: body.content || '',
      category: body.category || '',
      imageUri: (body.images && body.images[0]) || body.imageUri || null,
      images: body.images || [],
      likes: 0,
      commentsCount: 0,
    });

    moment.author = author;
    sendResponse(res, true, serializeMoment(moment, req.userId), '发布动态成功');
  } catch (error) {
    console.error('发布动态失败:', error);
    sendResponse(res, false, null, '', '发布动态失败');
  }
});

// 点赞
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const moment = await CircleMoment.findByPk(id);
    if (!moment) return sendResponse(res, false, null, '', '未找到动态');

    const likedSet = userLikes.get(req.userId) || new Set();
    if (!likedSet.has(id)) {
      likedSet.add(id);
      userLikes.set(req.userId, likedSet);
      await moment.increment('likes');
    }
    sendResponse(res, true, true, '点赞成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 取消点赞
router.delete('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const moment = await CircleMoment.findByPk(id);
    if (!moment) return sendResponse(res, false, null, '', '未找到动态');

    const likedSet = userLikes.get(req.userId) || new Set();
    if (likedSet.has(id)) {
      likedSet.delete(id);
      userLikes.set(req.userId, likedSet);
      await moment.decrement('likes');
    }
    sendResponse(res, true, true, '取消点赞成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 收藏
router.post('/:id/collect', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const collectedSet = userCollects.get(req.userId) || new Set();
    collectedSet.add(id);
    userCollects.set(req.userId, collectedSet);
    sendResponse(res, true, true, '收藏成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 取消收藏
router.delete('/:id/collect', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const collectedSet = userCollects.get(req.userId) || new Set();
    collectedSet.delete(id);
    userCollects.set(req.userId, collectedSet);
    sendResponse(res, true, true, '取消收藏成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

module.exports = router;
