const express = require('express');
const { CircleMoment, Comment, ContentReport, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { ok, fail } = require('../utils/http');
const {
  canViewComment,
  canViewMoment,
  getViewerContext,
} = require('../services/communityAccess');

const router = express.Router();
const REASONS = ['spam', 'harassment', 'inappropriate', 'other'];

router.post('/', authMiddleware, async (req, res) => {
  const { targetType, targetId, reason, detail } = req.body || {};
  if (!['moment', 'comment'].includes(targetType))
    return fail(res, 400, '举报目标类型无效');
  if (!Number.isInteger(Number(targetId)) || Number(targetId) <= 0)
    return fail(res, 400, '举报目标无效');
  if (!REASONS.includes(reason)) return fail(res, 400, '举报原因无效');
  if (
    detail !== undefined &&
    (typeof detail !== 'string' || detail.length > 500)
  ) {
    return fail(res, 400, '补充说明不能超过500字');
  }
  try {
    const existing = await ContentReport.findOne({
      where: { reporterId: req.userId, targetType, targetId: Number(targetId) },
    });
    if (existing && existing.status !== 'rejected')
      return fail(res, 409, '已举报该内容');

    const target =
      targetType === 'moment'
        ? await CircleMoment.findByPk(targetId, {
            include: [{ model: User, as: 'author', attributes: ['userId'] }],
          })
        : await Comment.findByPk(targetId, {
            include: [{ model: User, as: 'user', attributes: ['userId'] }],
          });
    if (!target) return fail(res, 404, '举报目标不存在');
    const moment =
      targetType === 'moment'
        ? target
        : await CircleMoment.findByPk(target.momentId, {
            include: [{ model: User, as: 'author', attributes: ['userId'] }],
          });
    const context = await getViewerContext(req.userId);
    if (!moment || !canViewMoment(moment, context)) {
      return fail(res, 403, '该内容不可见或已被隐藏');
    }
    if (targetType === 'comment' && !canViewComment(target, context)) {
      return fail(res, 403, '该评论不可见或已被隐藏');
    }
    const owner = targetType === 'moment' ? target.author : target.user;
    if (owner?.userId === req.userId)
      return fail(res, 400, '不能举报自己的内容');
    const report = existing
      ? await existing.update({
          reason,
          detail: detail?.trim() || null,
          status: 'pending',
        })
      : await ContentReport.create({
          reporterId: req.userId,
          targetType,
          targetId: Number(targetId),
          reason,
          detail: detail?.trim() || null,
        });
    ok(res, { id: String(report.id) }, '举报已提交，该内容已为你隐藏', 201);
  } catch (error) {
    console.error('提交举报失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

module.exports = router;
