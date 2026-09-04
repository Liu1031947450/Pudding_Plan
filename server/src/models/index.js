const User = require('./User');
const Plan = require('./Plan');
const Habit = require('./Habit');
const Notification = require('./Notification');
const Badge = require('./Badge');
const CircleMoment = require('./CircleMoment');
const Template = require('./Template');
const Like = require('./Like');
const Collect = require('./Collect');
const Comment = require('./Comment');
const PlanCheckIn = require('./PlanCheckIn');
const HabitCheckIn = require('./HabitCheckIn');
const UserSetting = require('./UserSetting');
const Feedback = require('./Feedback');
const Follow = require('./Follow');
const BuddyRelationship = require('./BuddyRelationship');
const UserBlock = require('./UserBlock');
const ContentReport = require('./ContentReport');

// 定义关联关系
User.hasMany(Plan, { foreignKey: 'userId', as: 'plans' });
Plan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Plan.hasMany(PlanCheckIn, {
  foreignKey: 'planId',
  as: 'checkIns',
  onDelete: 'CASCADE',
});
PlanCheckIn.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

User.hasMany(Habit, { foreignKey: 'userId', as: 'habits' });
Habit.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Habit.hasMany(HabitCheckIn, {
  foreignKey: 'habitId',
  as: 'checkIns',
  onDelete: 'CASCADE',
});
HabitCheckIn.belongsTo(Habit, { foreignKey: 'habitId', as: 'habit' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Badge, { foreignKey: 'userId', as: 'badges' });
Badge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(UserSetting, { foreignKey: 'userId', as: 'settings' });
UserSetting.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(CircleMoment, { foreignKey: 'authorId', as: 'circleMoments' });
CircleMoment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// 点赞/收藏关联
User.hasMany(Like, { foreignKey: 'userId', sourceKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });

User.hasMany(Collect, {
  foreignKey: 'userId',
  sourceKey: 'userId',
  as: 'collects',
});
Collect.belongsTo(User, {
  foreignKey: 'userId',
  targetKey: 'userId',
  as: 'user',
});

CircleMoment.hasMany(Like, { foreignKey: 'momentId', as: 'likes' });
Like.belongsTo(CircleMoment, { foreignKey: 'momentId', as: 'moment' });

CircleMoment.hasMany(Collect, { foreignKey: 'momentId', as: 'collects' });
Collect.belongsTo(CircleMoment, { foreignKey: 'momentId', as: 'moment' });

// 评论关联
CircleMoment.hasMany(Comment, { foreignKey: 'momentId', as: 'comments' });
Comment.belongsTo(CircleMoment, { foreignKey: 'momentId' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

Follow.belongsTo(User, {
  foreignKey: 'userId',
  targetKey: 'userId',
  as: 'follower',
});
Follow.belongsTo(User, {
  foreignKey: 'followingId',
  targetKey: 'userId',
  as: 'following',
});
BuddyRelationship.belongsTo(User, {
  foreignKey: 'requesterId',
  targetKey: 'userId',
  as: 'requester',
});
BuddyRelationship.belongsTo(User, {
  foreignKey: 'addresseeId',
  targetKey: 'userId',
  as: 'addressee',
});
UserBlock.belongsTo(User, {
  foreignKey: 'blockedId',
  targetKey: 'userId',
  as: 'blockedUser',
});
ContentReport.belongsTo(User, {
  foreignKey: 'reporterId',
  targetKey: 'userId',
  as: 'reporter',
});

module.exports = {
  User,
  Plan,
  Habit,
  Notification,
  Badge,
  CircleMoment,
  Template,
  Like,
  Collect,
  Comment,
  PlanCheckIn,
  HabitCheckIn,
  UserSetting,
  Feedback,
  Follow,
  BuddyRelationship,
  UserBlock,
  ContentReport,
};
