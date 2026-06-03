const {
  User,
  CircleMoment,
  Like,
  Collect,
  Comment,
  Notification,
} = require('../models');
const { mockLocations, mockTopics } = require('../data/mockData/communityData');
const { getFileUrl } = require('../middleware/upload');
const { getIO, connectedUsers } = require('../utils/socketManager');

// 统一响应辅助函数
const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({ success, data, message, error });
};

// 辅助函数：创建通知
async function createNotification({
  userId,
  senderId,
  type,
  title,
  message,
  targetType,
  targetId,
}) {
  try {
    console.log(
      `[Notification] 尝试创建通知: Target(intID): ${userId}, Sender(intID): ${senderId}, Type: ${type}`,
    );

    if (userId === senderId) {
      console.log('[Notification] 自己对自己的作品操作，跳过推送');
      return;
    }

    const notification = await Notification.create({
      userId,
      senderId,
      type,
      title,
      message,
      targetType,
      targetId,
      read: false,
    });

    console.log(`[Notification] 数据库记录已创建: ID ${notification.id}`);

    // 获取接收通知用户的UUID
    const recipient = await User.findByPk(userId);
    if (recipient) {
      console.log(
        `[Notification] 目标用户匹配: ${recipient.username} (UUID: ${recipient.userId})`,
      );

      // 通过WebSocket推送通知
      const socketId = connectedUsers.get(recipient.userId);
      console.log(
        `[Notification] Socket 状态: ${socketId ? '在线' : '离线'} (SocketID: ${
          socketId || 'N/A'
        })`,
      );

      if (socketId) {
        const currentIO = getIO();
        if (!currentIO) {
          console.warn(
            '[Notification] WebSocket io 实例未初始化，无法实时推送',
          );
          return;
        }

        // 计算相对时间
        const now = new Date();
        const notificationTime = notification.createdAt;
        const diffMs = now - notificationTime;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeString = '刚刚';
        if (diffDays > 0) {
          timeString = `${diffDays}天前`;
        } else if (diffHours > 0) {
          timeString = `${diffHours}小时前`;
        } else if (diffMinutes > 0) {
          timeString = `${diffMinutes}分钟前`;
        }

        const payload = {
          id: String(notification.id),
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: timeString,
          read: notification.read,
          targetType: notification.targetType || null,
          targetId: notification.targetId
            ? String(notification.targetId)
            : null,
        };

        currentIO.to(socketId).emit('new_notification', payload);
        console.log(
          `[Notification] 实时消息已由 WebSocket 成功推送到用户 ${recipient.userId}`,
        );
      }
    } else {
      console.error(
        `[Notification] 严重错误: 找不到 ID 为 ${userId} 的接收用户`,
      );
    }
  } catch (error) {
    console.error('[Notification] 创建并推送通知失败:', error);
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
    isLiked: likedIds.has(parseInt(id, 10)),
    isCollected: collectedIds.has(parseInt(id, 10)),
    isFollowing: followedAuthorIds.has(authorUserId),
  };
}

class CircleController {
  // 获取所有动态
  async getAllMoments(req, res) {
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
        serializeMoment(
          m,
          req.userId,
          likedIds,
          collectedIds,
          followedAuthorIds,
        ),
      );
      sendResponse(res, true, data, '获取圈子列表成功');
    } catch (error) {
      console.error('获取圈子列表失败:', error);
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 获取附近地点
  getNearbyLocations(req, res) {
    sendResponse(res, true, [...mockLocations], '获取附近地点成功');
  }

  // 获取热门话题
  getTrendingTopics(req, res) {
    sendResponse(res, true, [...mockTopics], '获取热门话题成功');
  }

  // 获取动态点赞用户列表
  async getMomentLikers(req, res) {
    try {
      const { id } = req.params;
      const likes = await Like.findAll({
        where: { momentId: parseInt(id, 10) },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['userId', 'username', 'avatar'],
          },
        ],
        limit: 20,
        order: [['createdAt', 'DESC']],
      });

      const likers = likes.map(l => ({
        id: l.user.userId,
        username: l.user.username,
        avatar: l.user.avatar,
      }));

      sendResponse(res, true, likers, '获取点赞列表成功');
    } catch (error) {
      console.error('获取点赞列表失败:', error);
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 获取动态评论列表
  async getMomentComments(req, res) {
    try {
      const { id } = req.params;
      const comments = await Comment.findAll({
        where: { momentId: parseInt(id, 10), parentId: null },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['userId', 'username', 'avatar'],
          },
          {
            model: Comment,
            as: 'replies',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['userId', 'username', 'avatar'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // 计算相对时间的函数
      function getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays > 0) {
          return `${diffDays}天前`;
        } else if (diffHours > 0) {
          return `${diffHours}小时前`;
        } else if (diffMinutes > 0) {
          return `${diffMinutes}分钟前`;
        } else {
          return '刚刚';
        }
      }

      const formattedComments = comments.map(c => ({
        id: String(c.id),
        userId: c.user.userId,
        userName: c.user.username,
        userAvatarUri: c.user.avatar,
        text: c.content,
        time: getRelativeTime(c.createdAt),
        replies: c.replies.map(r => ({
          id: String(r.id),
          userId: r.user.userId,
          userName: r.user.username,
          userAvatarUri: r.user.avatar,
          text: r.content,
          time: getRelativeTime(r.createdAt),
        })),
      }));

      sendResponse(res, true, formattedComments, '获取评论列表成功');
    } catch (error) {
      console.error('获取评论失败:', error);
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 发表评论
  async postComment(req, res) {
    console.log(
      `[Circles] 收到评论请求: MomentID=${req.params.id}, UserID=${req.userId}`,
    );
    try {
      const { id } = req.params;
      const { content, parentId } = req.body;
      const moment = await CircleMoment.findByPk(id);
      if (!moment) return sendResponse(res, false, null, '', '未找到动态');

      const currentUser = await User.findOne({ where: { userId: req.userId } });
      if (!currentUser) return sendResponse(res, false, null, '', '用户不存在');

      const comment = await Comment.create({
        momentId: parseInt(id, 10),
        userId: currentUser.id,
        content,
        parentId: parentId ? parseInt(parentId, 10) : null,
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
            message: `${
              currentUser.username
            } 回复了你的评论: "${content.substring(0, 20)}..."`,
            targetType: 'moment',
            targetId: id,
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
            message: `${
              currentUser.username
            } 评论了你的动态: "${content.substring(0, 20)}..."`,
            targetType: 'moment',
            targetId: id,
          });
        }
      }

      sendResponse(res, true, { id: comment.id }, '发表评论成功');
    } catch (error) {
      console.error('发表评论失败:', error);
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 获取用户收藏列表
  async getUserCollections(req, res) {
    try {
      console.log(`[Collections] 开始获取收藏: UserUUID=${req.userId}`);
      const collects = await Collect.findAll({
        where: { userId: req.userId },
        include: [
          {
            model: CircleMoment,
            as: 'moment',
            required: true,
            include: [
              {
                model: User,
                as: 'author',
                attributes: ['userId', 'username', 'avatar'],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      console.log(`[Collections] 找到 ${collects.length} 条原始记录`);

      const data = collects
        .map(c => {
          const m =
            c.moment ||
            c.CircleMoment ||
            c.get?.('moment') ||
            c.get?.('CircleMoment');
          if (!m) {
            console.warn(`[Collections] 记录 ${c.id} 无法获取到关联动态对象`);
            return null;
          }
          return serializeMoment(m, req.userId, new Set(), new Set([m.id]));
        })
        .filter(Boolean);

      console.log(`[Collections] 最终返回给前端的动态数: ${data.length}`);
      sendResponse(res, true, data, '获取收藏列表成功');
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 根据 ID 获取单个动态
  async getMomentById(req, res) {
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

      const likedIds = new Set(like ? [parseInt(id, 10)] : []);
      const collectedIds = new Set(collect ? [parseInt(id, 10)] : []);

      sendResponse(
        res,
        true,
        serializeMoment(moment, req.userId, likedIds, collectedIds),
        '获取圈子详情成功',
      );
    } catch (error) {
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 图片上传
  uploadImage(req, res) {
    try {
      if (!req.file)
        return sendResponse(res, false, null, '', '请选择图片上传');
      const imageUrl = getFileUrl(req, req.file.filename);
      sendResponse(res, true, imageUrl, '图片上传成功');
    } catch (error) {
      sendResponse(res, false, null, '', '图片上传失败');
    }
  }

  // 发布动态
  async createMoment(req, res) {
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

      sendResponse(
        res,
        true,
        serializeMoment(moment, req.userId),
        '发布动态成功',
      );
    } catch (error) {
      console.error('发布动态失败:', error);
      sendResponse(res, false, null, '', `发布动态失败: ${error.message}`);
    }
  }

  // 点赞
  async likeMoment(req, res) {
    console.log(
      `[Circles] 收到点赞请求: MomentID=${req.params.id}, UserID=${req.userId}`,
    );
    try {
      const { id } = req.params;
      const moment = await CircleMoment.findByPk(id);
      if (!moment) return sendResponse(res, false, null, '', '未找到动态');

      const currentUser = await User.findOne({ where: { userId: req.userId } });
      const [_like, created] = await Like.findOrCreate({
        where: { userId: req.userId, momentId: parseInt(id, 10) },
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
            message: `${currentUser.username} 点赞了你的动态: "${
              moment.title || '无标题'
            }"`,
            targetType: 'moment',
            targetId: id,
          });
        }
      }
      sendResponse(res, true, true, '点赞成功');
    } catch (error) {
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 取消点赞
  async unlikeMoment(req, res) {
    try {
      const { id } = req.params;
      const moment = await CircleMoment.findByPk(id);
      if (!moment) return sendResponse(res, false, null, '', '未找到动态');

      const deleted = await Like.destroy({
        where: { userId: req.userId, momentId: parseInt(id, 10) },
      });

      if (deleted) await moment.decrement('likesCount');
      sendResponse(res, true, true, '取消点赞成功');
    } catch (error) {
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 收藏
  async collectMoment(req, res) {
    try {
      const { id } = req.params;
      const moment = await CircleMoment.findByPk(id);
      if (!moment) return sendResponse(res, false, null, '', '未找到动态');

      await Collect.findOrCreate({
        where: { userId: req.userId, momentId: parseInt(id, 10) },
      });
      sendResponse(res, true, true, '收藏成功');
    } catch (error) {
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }

  // 取消收藏
  async uncollectMoment(req, res) {
    try {
      const { id } = req.params;
      await Collect.destroy({
        where: { userId: req.userId, momentId: parseInt(id, 10) },
      });
      sendResponse(res, true, true, '取消收藏成功');
    } catch (error) {
      sendResponse(res, false, null, '', '服务器内部错误');
    }
  }
}

module.exports = new CircleController();
