const {
  BuddyRelationship,
  ContentReport,
  Follow,
  UserBlock,
} = require('../models');
const { Op } = require('sequelize');

const getViewerContext = async viewerId => {
  const [blocks, buddies, follows, reports] = await Promise.all([
    UserBlock.findAll({
      where: { [Op.or]: [{ blockerId: viewerId }, { blockedId: viewerId }] },
    }),
    BuddyRelationship.findAll({
      where: {
        status: 'accepted',
        [Op.or]: [{ requesterId: viewerId }, { addresseeId: viewerId }],
      },
    }),
    Follow.findAll({ where: { userId: viewerId } }),
    ContentReport.findAll({
      where: { reporterId: viewerId, status: { [Op.ne]: 'rejected' } },
    }),
  ]);
  const blockedIds = new Set(
    blocks.map(block =>
      block.blockerId === viewerId ? block.blockedId : block.blockerId,
    ),
  );
  const buddyIds = new Set(
    buddies.map(relationship =>
      relationship.requesterId === viewerId
        ? relationship.addresseeId
        : relationship.requesterId,
    ),
  );
  return {
    viewerId,
    blockedIds,
    buddyIds,
    followedIds: new Set(follows.map(follow => follow.followingId)),
    reportedMomentIds: new Set(
      reports
        .filter(report => report.targetType === 'moment')
        .map(report => report.targetId),
    ),
    reportedCommentIds: new Set(
      reports
        .filter(report => report.targetType === 'comment')
        .map(report => report.targetId),
    ),
  };
};

const canViewMoment = (moment, context) => {
  const authorId = moment.author?.userId;
  if (!authorId) return false;
  if (authorId === context.viewerId) return true;
  if (context.blockedIds.has(authorId)) return false;
  if (context.reportedMomentIds.has(moment.id)) return false;
  if (moment.visibility === 'private') return false;
  if (moment.visibility === 'buddies') return context.buddyIds.has(authorId);
  return true;
};

const canViewComment = (comment, context) => {
  const authorId = comment.user?.userId;
  return Boolean(
    authorId &&
      !context.blockedIds.has(authorId) &&
      !context.reportedCommentIds.has(comment.id),
  );
};

const canViewNotification = (notification, context, momentsById) => {
  if (
    notification.sender?.userId &&
    context.blockedIds.has(notification.sender.userId)
  ) {
    return false;
  }
  if (notification.targetType !== 'moment') return true;
  const moment = momentsById.get(String(notification.targetId));
  return Boolean(moment && canViewMoment(moment, context));
};

module.exports = {
  canViewComment,
  canViewMoment,
  canViewNotification,
  getViewerContext,
};
