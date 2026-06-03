const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const circleController = require('../controllers/circleController');

// 获取所有动态
router.get(
  '/',
  authMiddleware,
  circleController.getAllMoments.bind(circleController),
);

// 获取附近地点
router.get(
  '/locations/nearby',
  circleController.getNearbyLocations.bind(circleController),
);

// 获取热门话题
router.get(
  '/topics/trending',
  circleController.getTrendingTopics.bind(circleController),
);

// 获取动态点赞用户列表
router.get(
  '/:id/likers',
  authMiddleware,
  circleController.getMomentLikers.bind(circleController),
);

// 获取动态评论列表
router.get(
  '/:id/comments',
  authMiddleware,
  circleController.getMomentComments.bind(circleController),
);

// 发表评论
router.post(
  '/:id/comments',
  authMiddleware,
  circleController.postComment.bind(circleController),
);

// 获取用户收藏列表
router.get(
  '/collections',
  authMiddleware,
  circleController.getUserCollections.bind(circleController),
);

// 根据 ID 获取单个动态
router.get(
  '/:id',
  authMiddleware,
  circleController.getMomentById.bind(circleController),
);

// 图片上传
router.post(
  '/upload',
  authMiddleware,
  upload.single('image'),
  circleController.uploadImage.bind(circleController),
);

// 发布动态
router.post(
  '/',
  authMiddleware,
  circleController.createMoment.bind(circleController),
);

// 点赞
router.post(
  '/:id/like',
  authMiddleware,
  circleController.likeMoment.bind(circleController),
);

// 取消点赞
router.delete(
  '/:id/like',
  authMiddleware,
  circleController.unlikeMoment.bind(circleController),
);

// 收藏
router.post(
  '/:id/collect',
  authMiddleware,
  circleController.collectMoment.bind(circleController),
);

// 取消收藏
router.delete(
  '/:id/collect',
  authMiddleware,
  circleController.uncollectMoment.bind(circleController),
);

module.exports = router;
