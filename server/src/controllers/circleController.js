const {
  User,
  CircleMoment,
  Like,
  Collect,
  Comment,
  ContentReport,
  Notification,
} = require('../models');
const { getFileUrl } = require('../middleware/upload');
const {
  deleteUploadedFiles,
  isOwnedUpload,
  uploadedFilesExist,
} = require('../utils/files');
const { ok, fail } = require('../utils/http');
const { createNotification } = require('../services/notificationService');
const {
  canViewComment,
  canViewMoment,
  getViewerContext,
} = require('../services/communityAccess');
const { Op } = require('sequelize');

const authorInclude = {
  model: User,
  as: 'author',
  attributes: ['id', 'userId', 'username', 'avatar', 'goalTags'],
};

const getRelativeTime = date => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays > 0) return `${diffDays}天前`;
  if (diffHours > 0) return `${diffHours}小时前`;
  if (diffMinutes > 0) return `${diffMinutes}分钟前`;
  return '刚刚';
};

const serializeMoment = (
  moment,
  viewerId,
  likedIds = new Set(),
  collectedIds = new Set(),
  followedIds = new Set(),
) => {
  const author = moment.author || {};
  return {
    id: String(moment.id),
    title: moment.title || '',
    description: moment.description || '',
    content: moment.content || '',
    members: '1',
    type: 'waterfall',
    imageUri: moment.imageUri || null,
    images: moment.images || [],
    category: moment.category || '',
    visibility: moment.visibility,
    location: moment.location || '',
    authorUserId: author.userId || null,
    authorName: author.username || '匿名用户',
    authorAvatarUri: author.avatar || null,
    authorGoalTags: author.goalTags || [],
    likes: moment.likesCount || 0,
    commentsCount: moment.commentsCount || 0,
    comments: [],
    isLiked: likedIds.has(moment.id),
    isCollected: collectedIds.has(moment.id),
    isFollowing: followedIds.has(author.userId),
    isOwn: author.userId === viewerId,
    createdAt: moment.createdAt,
  };
};

const loadVisibleMoment = async (id, viewerId) => {
  const moment = await CircleMoment.findByPk(id, { include: [authorInclude] });
  if (!moment) return { status: 404, error: '未找到动态' };
  const context = await getViewerContext(viewerId);
  if (!canViewMoment(moment, context)) {
    return { status: 403, error: '该动态不可见或已被隐藏' };
  }
  return { moment, context };
};

class CircleController {
  async getAllMoments(req, res) {
    try {
      const [moments, likes, collects, context] = await Promise.all([
        CircleMoment.findAll({
          include: [authorInclude],
          order: [['createdAt', 'DESC']],
        }),
        Like.findAll({ where: { userId: req.userId } }),
        Collect.findAll({ where: { userId: req.userId } }),
        getViewerContext(req.userId),
      ]);
      const likedIds = new Set(likes.map(item => item.momentId));
      const collectedIds = new Set(collects.map(item => item.momentId));
      ok(
        res,
        moments
          .filter(moment => canViewMoment(moment, context))
          .map(moment =>
            serializeMoment(
              moment,
              req.userId,
              likedIds,
              collectedIds,
              context.followedIds,
            ),
          ),
        '获取圈子列表成功',
      );
    } catch (error) {
      console.error('获取圈子列表失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async getNearbyLocations(req, res) {
    try {
      const [moments, context] = await Promise.all([
        CircleMoment.findAll({
          where: { location: { [Op.ne]: null } },
          attributes: ['id', 'location', 'visibility'],
          include: [authorInclude],
          order: [['updatedAt', 'DESC']],
          limit: 30,
        }),
        getViewerContext(req.userId),
      ]);
      const names = [
        ...new Set(
          moments
            .filter(moment => canViewMoment(moment, context))
            .map(item => item.location)
            .filter(Boolean),
        ),
      ];
      ok(
        res,
        names.map((name, index) => ({
          id: `history-${index}`,
          name,
          sub: '来自社区动态',
        })),
        '获取地点历史成功',
      );
    } catch (error) {
      console.error('获取地点历史失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async getTrendingTopics(req, res) {
    try {
      const [moments, context] = await Promise.all([
        CircleMoment.findAll({
          attributes: ['id', 'category', 'visibility'],
          include: [authorInclude],
        }),
        getViewerContext(req.userId),
      ]);
      const counts = moments
        .filter(moment => canViewMoment(moment, context))
        .reduce((result, moment) => {
          const topic = String(moment.category || '')
            .trim()
            .replace(/^#+/, '');
          if (topic) result.set(topic, (result.get(topic) || 0) + 1);
          return result;
        }, new Map());
      const topics = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => topic);
      ok(
        res,
        [...new Set([...topics, '学习', '运动', '早睡'])].slice(0, 12),
        '获取热门话题成功',
      );
    } catch (error) {
      console.error('获取热门话题失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async getMomentLikers(req, res) {
    try {
      const visible = await loadVisibleMoment(req.params.id, req.userId);
      if (!visible.moment) return fail(res, visible.status, visible.error);
      const likes = await Like.findAll({
        where: { momentId: visible.moment.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['userId', 'username', 'avatar'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 20,
      });
      ok(
        res,
        likes
          .filter(
            item =>
              item.user && !visible.context.blockedIds.has(item.user.userId),
          )
          .map(item => ({
            id: item.user.userId,
            username: item.user.username,
            avatar: item.user.avatar,
          })),
        '获取点赞列表成功',
      );
    } catch (error) {
      console.error('获取点赞列表失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async getMomentComments(req, res) {
    try {
      const visible = await loadVisibleMoment(req.params.id, req.userId);
      if (!visible.moment) return fail(res, visible.status, visible.error);
      const comments = await Comment.findAll({
        where: { momentId: visible.moment.id, parentId: null },
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
      ok(
        res,
        comments
          .filter(comment => canViewComment(comment, visible.context))
          .map(comment => ({
            id: String(comment.id),
            userId: comment.user.userId,
            userName: comment.user.username,
            userAvatarUri: comment.user.avatar,
            text: comment.content,
            time: getRelativeTime(comment.createdAt),
            isOwn: comment.user.userId === req.userId,
            replies: comment.replies
              .filter(reply => canViewComment(reply, visible.context))
              .map(reply => ({
                id: String(reply.id),
                userId: reply.user.userId,
                userName: reply.user.username,
                userAvatarUri: reply.user.avatar,
                text: reply.content,
                time: getRelativeTime(reply.createdAt),
                isOwn: reply.user.userId === req.userId,
              })),
          })),
        '获取评论列表成功',
      );
    } catch (error) {
      console.error('获取评论失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async postComment(req, res) {
    const content =
      typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content || content.length > 1000)
      return fail(res, 400, '评论需为1至1000个字符');
    try {
      const visible = await loadVisibleMoment(req.params.id, req.userId);
      if (!visible.moment) return fail(res, visible.status, visible.error);
      const currentUser = req.user;
      let parent = null;
      if (req.body.parentId) {
        parent = await Comment.findOne({
          where: { id: req.body.parentId, momentId: visible.moment.id },
        });
        if (!parent) return fail(res, 404, '未找到被回复的评论');
      }
      const comment = await Comment.create({
        momentId: visible.moment.id,
        userId: currentUser.id,
        content,
        parentId: parent?.id || null,
      });
      await visible.moment.increment('commentsCount');
      const recipientId = parent?.userId || visible.moment.authorId;
      await createNotification({
        userId: recipientId,
        senderId: currentUser.id,
        type: parent ? 'reply' : 'comment',
        title: parent ? '收到新的回复' : '收到新的评论',
        message: `${currentUser.username}${
          parent ? ' 回复了你的评论' : ' 评论了你的动态'
        }：${content.slice(0, 30)}`,
        targetType: 'moment',
        targetId: visible.moment.id,
      });
      ok(res, { id: String(comment.id) }, '发表评论成功', 201);
    } catch (error) {
      console.error('发表评论失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async deleteComment(req, res) {
    try {
      const comment = await Comment.findOne({
        where: { id: req.params.commentId, momentId: req.params.id },
      });
      if (!comment) return fail(res, 404, '未找到评论');
      if (comment.userId !== req.user.id)
        return fail(res, 403, '只能删除自己的评论');
      const momentId = comment.momentId;
      await ContentReport.destroy({
        where: { targetType: 'comment', targetId: comment.id },
      });
      await comment.destroy();
      const moment = await CircleMoment.findByPk(momentId);
      if (moment) {
        const commentsCount = await Comment.count({ where: { momentId } });
        await moment.update({ commentsCount });
      }
      ok(res, { removed: 1 }, '评论已删除');
    } catch (error) {
      console.error('删除评论失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async getUserCollections(req, res) {
    try {
      const [collects, context] = await Promise.all([
        Collect.findAll({
          where: { userId: req.userId },
          include: [
            {
              model: CircleMoment,
              as: 'moment',
              required: true,
              include: [authorInclude],
            },
          ],
          order: [['createdAt', 'DESC']],
        }),
        getViewerContext(req.userId),
      ]);
      ok(
        res,
        collects
          .filter(item => item.moment && canViewMoment(item.moment, context))
          .map(item =>
            serializeMoment(
              item.moment,
              req.userId,
              new Set(),
              new Set([item.moment.id]),
              context.followedIds,
            ),
          ),
        '获取收藏列表成功',
      );
    } catch (error) {
      console.error('获取收藏列表失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async getMomentById(req, res) {
    try {
      const visible = await loadVisibleMoment(req.params.id, req.userId);
      if (!visible.moment) return fail(res, visible.status, visible.error);
      const [like, collect] = await Promise.all([
        Like.findOne({
          where: { userId: req.userId, momentId: visible.moment.id },
        }),
        Collect.findOne({
          where: { userId: req.userId, momentId: visible.moment.id },
        }),
      ]);
      ok(
        res,
        serializeMoment(
          visible.moment,
          req.userId,
          new Set(like ? [visible.moment.id] : []),
          new Set(collect ? [visible.moment.id] : []),
          visible.context.followedIds,
        ),
        '获取圈子详情成功',
      );
    } catch (error) {
      console.error('获取动态详情失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  uploadImage(req, res) {
    if (!req.file) return fail(res, 400, '请选择图片上传');
    ok(res, getFileUrl(req, req.file.filename), '图片上传成功', 201);
  }

  async deleteUploads(req, res) {
    const images = Array.isArray(req.body?.images) ? req.body.images : [];
    if (
      images.length > 4 ||
      images.some(image => !isOwnedUpload(image, req.userId))
    ) {
      return fail(res, 400, '待清理图片地址无效');
    }
    try {
      const moments = await CircleMoment.findAll({
        where: { authorId: req.user.id },
        attributes: ['imageUri', 'images'],
      });
      const publishedImages = new Set(
        moments.flatMap(moment => [moment.imageUri, ...(moment.images || [])]),
      );
      if (images.some(image => publishedImages.has(image))) {
        return fail(res, 409, '已发布图片不能通过清理接口删除');
      }
      await deleteUploadedFiles(images);
      ok(res, true, '未发布图片已清理');
    } catch (error) {
      console.error('清理未发布图片失败:', error);
      fail(res, 500, '清理图片失败');
    }
  }

  async createMoment(req, res) {
    const images = Array.isArray(req.body?.images) ? req.body.images : [];
    const ownedImages = images.filter(image =>
      isOwnedUpload(image, req.userId),
    );
    const reject = async (status, message) => {
      await deleteUploadedFiles(ownedImages).catch(() => {});
      return fail(res, status, message);
    };
    const content =
      typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    const title =
      typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const visibility = req.body?.visibility || 'public';
    if (!title && !content && images.length === 0) {
      return reject(400, '动态内容不能为空');
    }
    if (images.length > 4 || new Set(images).size !== images.length) {
      return reject(400, '动态最多上传4张不重复图片');
    }
    if (ownedImages.length !== images.length) {
      return reject(403, '动态图片不属于当前用户');
    }
    if (!['public', 'buddies', 'private'].includes(visibility)) {
      return reject(400, '动态可见性无效');
    }
    if (title.length > 200 || content.length > 10000) {
      return reject(400, '动态内容过长');
    }
    const location =
      typeof req.body?.location === 'string' ? req.body.location.trim() : '';
    if (location.length > 120) return reject(400, '地点不能超过120字');
    try {
      if (!(await uploadedFilesExist(images))) {
        return reject(400, '动态图片不存在或已失效');
      }
      const moment = await CircleMoment.create({
        authorId: req.user.id,
        title,
        description: req.body?.description || content.slice(0, 60),
        content,
        category: String(req.body?.category || '')
          .trim()
          .slice(0, 50),
        visibility,
        location: location || null,
        imageUri: images[0] || null,
        images,
        likesCount: 0,
        commentsCount: 0,
      });
      moment.author = req.user;
      ok(res, serializeMoment(moment, req.userId), '发布动态成功', 201);
    } catch (error) {
      console.error('发布动态失败:', error);
      await deleteUploadedFiles(ownedImages).catch(() => {});
      fail(res, 500, '发布动态失败');
    }
  }

  async deleteMoment(req, res) {
    try {
      const moment = await CircleMoment.findByPk(req.params.id);
      if (!moment) return fail(res, 404, '未找到动态');
      if (moment.authorId !== req.user.id)
        return fail(res, 403, '只能删除自己的动态');
      const images = [...(moment.images || []), moment.imageUri].filter(
        Boolean,
      );
      const comments = await Comment.findAll({
        where: { momentId: moment.id },
        attributes: ['id'],
      });
      await ContentReport.destroy({
        where: {
          [Op.or]: [
            { targetType: 'moment', targetId: moment.id },
            ...(comments.length
              ? [
                  {
                    targetType: 'comment',
                    targetId: { [Op.in]: comments.map(comment => comment.id) },
                  },
                ]
              : []),
          ],
        },
      });
      await Notification.destroy({
        where: { targetType: 'moment', targetId: moment.id },
      });
      await moment.destroy();
      await deleteUploadedFiles(images);
      ok(res, true, '动态已删除');
    } catch (error) {
      console.error('删除动态失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async likeMoment(req, res) {
    try {
      const visible = await loadVisibleMoment(req.params.id, req.userId);
      if (!visible.moment) return fail(res, visible.status, visible.error);
      const [, created] = await Like.findOrCreate({
        where: { userId: req.userId, momentId: visible.moment.id },
      });
      if (created) {
        await visible.moment.increment('likesCount');
        await createNotification({
          userId: visible.moment.authorId,
          senderId: req.user.id,
          type: 'like',
          title: '动态获得点赞',
          message: `${req.user.username} 点赞了你的动态`,
          targetType: 'moment',
          targetId: visible.moment.id,
        });
      }
      ok(res, true, created ? '点赞成功' : '已经点赞过了');
    } catch (error) {
      console.error('点赞失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async unlikeMoment(req, res) {
    try {
      const visible = await loadVisibleMoment(req.params.id, req.userId);
      if (!visible.moment) return fail(res, visible.status, visible.error);
      const deleted = await Like.destroy({
        where: { userId: req.userId, momentId: visible.moment.id },
      });
      if (deleted) await visible.moment.decrement('likesCount');
      ok(res, true, '取消点赞成功');
    } catch (error) {
      console.error('取消点赞失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async collectMoment(req, res) {
    try {
      const visible = await loadVisibleMoment(req.params.id, req.userId);
      if (!visible.moment) return fail(res, visible.status, visible.error);
      await Collect.findOrCreate({
        where: { userId: req.userId, momentId: visible.moment.id },
      });
      ok(res, true, '收藏成功');
    } catch (error) {
      console.error('收藏失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }

  async uncollectMoment(req, res) {
    try {
      await Collect.destroy({
        where: { userId: req.userId, momentId: req.params.id },
      });
      ok(res, true, '取消收藏成功');
    } catch (error) {
      console.error('取消收藏失败:', error);
      fail(res, 500, '服务器内部错误');
    }
  }
}

module.exports = new CircleController();
