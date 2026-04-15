const express = require('express');
const router = express.Router();
const {
  mockLocations,
  mockTopics,
} = require('../data/mockData/communityData');
const { authMiddleware } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');
const { User, CircleMoment, Like, Collect, Comment, Notification } = require('../models');

const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({ success, data, message, error });
};

// 辅助函数：创建通知
async function createNotification({ userId, senderId, type, title, message, targetType, targetId }) {
  try {
    if (userId === senderId) return; // 自己操作不通知自己
    await Notification.create({
      userId,
      senderId,
      type,
      title,
      message,
      targetType,
      targetId,
      read: false
    });
  } catch (error) {
    console.error('创建通知失败:', error);
  }
}

// 序列化动态为前端结构
function serializeMoment(
  moment,
  userId,
  likedIds = new Set(),
  collectedIds = new Set(),
  followedAuthorIds = new Set(),
) {
  const author = moment.author || {};
  const id = String(moment.id);
  const authorUserId = author.userId || null;

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
    authorUserId,
    authorName: author.username || '匿名用户',
    authorAvatarUri: author.avatar || null,
    likes: moment.likesCount || 0,
    commentsCount: moment.commentsCount || 0,
    comments: [], // 在详情接口中填充
    isLiked: likedIds.has(parseInt(id)),
    isCollected: collectedIds.has(parseInt(id)),
    isFollowing: followedAuthorIds.has(authorUserId),
  };
}

// 获取所有动态
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { Friendship } = require('../models');
    const [moments, likes, collects, friendships] = await Promise.all([
      CircleMoment.findAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['userId', 'username', 'avatar'],
          },
        ],
        order: [['createdAt', 'DESC']],
      }),
      Like.findAll({ where: { userId: req.userId } }),
      Collect.findAll({ where: { userId: req.userId } }),
      Friendship.findAll({ where: { userId: req.userId } }),
    ]);

    const likedIds = new Set(likes.map(l => l.momentId));
    const collectedIds = new Set(collects.map(c => c.momentId));
    const followedAuthorIds = new Set(friendships.map(f => f.friendId));

    const data = moments.map(m =>
      serializeMoment(m, req.userId, likedIds, collectedIds, followedAuthorIds),
    );
    sendResponse(res, true, data, '获取圈子列表成功');
  } catch (error) {
    console.error('获取圈子列表失败:', error);
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 获取附近地点
router.get('/locations/nearby', (req, res) => {
  sendResponse(res, true, [...mockLocations], '获取附近地点成功');
});

// 获取热门话题
router.get('/topics/trending', (req, res) => {
  sendResponse(res, true, [...mockTopics], '获取热门话题成功');
});

// 获取动态点赞用户列表
router.get('/:id/likers', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const likes = await Like.findAll({
      where: { momentId: parseInt(id) },
      include: [{
        model: User,
        as: 'user',
        attributes: ['userId', 'username', 'avatar']
      }],
      limit: 20,
      order: [['createdAt', 'DESC']]
    });

    const likers = likes.map(l => ({
      id: l.user.userId,
      username: l.user.username,
      avatar: l.user.avatar
    }));

    sendResponse(res, true, likers, '获取点赞列表成功');
  } catch (error) {
    console.error('获取点赞列表失败:', error);
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 获取动态评论列表
router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.findAll({
      where: { momentId: parseInt(id), parentId: null },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'username', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [{
            model: User,
            as: 'user',
            attributes: ['userId', 'username', 'avatar']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedComments = comments.map(c => ({
      id: String(c.id),
      userId: c.user.userId,
      userName: c.user.username,
      userAvatarUri: c.user.avatar,
      text: c.content,
      time: '刚刚',
      replies: c.replies.map(r => ({
        id: String(r.id),
        userId: r.user.userId,
        userName: r.user.username,
        userAvatarUri: r.user.avatar,
        text: r.content,
        time: '刚刚'
      }))
    }));

    sendResponse(res, true, formattedComments, '获取评论列表成功');
  } catch (error) {
    console.error('获取评论失败:', error);
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 发布评论
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    const moment = await CircleMoment.findByPk(id);
    if (!moment) return sendResponse(res, false, null, '', '未找到动态');

    const currentUser = await User.findOne({ where: { userId: req.userId } });
    if (!currentUser) return sendResponse(res, false, null, '', '用户不存在');

    const comment = await Comment.create({
      momentId: parseInt(id),
      userId: currentUser.id,
      content,
      parentId: parentId ? parseInt(parentId) : null
    });

    await moment.increment('commentsCount');

    // 创建通知
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (parentComment) {
        await createNotification({
          userId: parentComment.userId,
          senderId: currentUser.id,
          type: 'reply',
          title: '收到新的回复',
          message: `${currentUser.username} 回复了你的评论: "${content.substring(0, 20)}..."`,
          targetType: 'moment',
          targetId: id
        });
      }
    } else {
      const author = await User.findByPk(moment.authorId);
      if (author) {
        await createNotification({
          userId: author.id,
          senderId: currentUser.id,
          type: 'comment',
          title: '收到新的评论',
          message: `${currentUser.username} 评论了你的动态: "${content.substring(0, 20)}..."`,
          targetType: 'moment',
          targetId: id
        });
      }
    }

    sendResponse(res, true, { id: comment.id }, '发表评论成功');
  } catch (error) {
    console.error('发表评论失败:', error);
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 根据 ID 获取单个动态
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [moment, like, collect] = await Promise.all([
      CircleMoment.findByPk(id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['userId', 'username', 'avatar'],
          },
        ],
      }),
      Like.findOne({ where: { userId: req.userId, momentId: id } }),
      Collect.findOne({ where: { userId: req.userId, momentId: id } }),
    ]);

    if (!moment) {
      return sendResponse(res, true, null, '未找到动态');
    }

    const likedIds = new Set(like ? [parseInt(id)] : []);
    const collectedIds = new Set(collect ? [parseInt(id)] : []);

    sendResponse(
      res,
      true,
      serializeMoment(moment, req.userId, likedIds, collectedIds),
      '获取圈子详情成功',
    );
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 图片上传
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return sendResponse(res, false, null, '', '请选择图片上传');
    const imageUrl = getFileUrl(req, req.file.filename);
    sendResponse(res, true, imageUrl, '图片上传成功');
  } catch (error) {
    sendResponse(res, false, null, '', '图片上传失败');
  }
});

// 发布动态
router.post('/', authMiddleware, async (req, res) => {
  try {
    const body = req.body;
    const author = await User.findOne({
      where: { userId: req.userId },
      attributes: ['id', 'userId', 'username', 'avatar'],
    });

    if (!author) return sendResponse(res, false, null, '', '当前用户不存在');

    const moment = await CircleMoment.create({
      authorId: author.id,
      title: body.title || '',
      description: body.description || '',
      content: body.content || '',
      category: body.category || '',
      imageUri: (body.images && body.images[0]) || body.imageUri || null,
      images: body.images || [],
      likesCount: 0,
      commentsCount: 0,
    });

    sendResponse(res, true, serializeMoment(moment, req.userId), '发布动态成功');
  } catch (error) {
    console.error('发布动态失败:', error);
    sendResponse(res, false, null, '', `发布动态失败: ${error.message}`);
  }
});

// 点赞
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const moment = await CircleMoment.findByPk(id);
    if (!moment) return sendResponse(res, false, null, '', '未找到动态');

    const currentUser = await User.findOne({ where: { userId: req.userId } });
    const [like, created] = await Like.findOrCreate({
      where: { userId: req.userId, momentId: parseInt(id) },
    });

    if (created) {
      await moment.increment('likesCount');
      // 触发通知
      const author = await User.findByPk(moment.authorId);
      if (author && currentUser) {
        await createNotification({
          userId: author.id,
          senderId: currentUser.id,
          type: 'like',
          title: '动态获得点赞',
          message: `${currentUser.username} 点赞了你的动态: "${moment.title || '无标题'}"`,
          targetType: 'moment',
          targetId: id
        });
      }
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

    const deleted = await Like.destroy({
      where: { userId: req.userId, momentId: parseInt(id) },
    });

    if (deleted) await moment.decrement('likesCount');
    sendResponse(res, true, true, '取消点赞成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 收藏
router.post('/:id/collect', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const moment = await CircleMoment.findByPk(id);
    if (!moment) return sendResponse(res, false, null, '', '未找到动态');

    await Collect.findOrCreate({
      where: { userId: req.userId, momentId: parseInt(id) },
    });
    sendResponse(res, true, true, '收藏成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 取消收藏
router.delete('/:id/collect', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await Collect.destroy({
      where: { userId: req.userId, momentId: parseInt(id) },
    });
    sendResponse(res, true, true, '取消收藏成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

module.exports = router;
