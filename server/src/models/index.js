const User = require('./User');
const Plan = require('./Plan');
const Habit = require('./Habit');
const Notification = require('./Notification');
const Badge = require('./Badge');
const CircleMoment = require('./CircleMoment');
const Template = require('./Template');
const Like = require('./Like');
const Collect = require('./Collect');
const Friendship = require('./Friendship');

// 定义关联关系
User.hasMany(Plan, { foreignKey: 'userId', as: 'plans' });
Plan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Habit, { foreignKey: 'userId', as: 'habits' });
Habit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Badge, { foreignKey: 'userId', as: 'badges' });
Badge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(CircleMoment, { foreignKey: 'authorId', as: 'circleMoments' });
CircleMoment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// 点赞/收藏关联
User.hasMany(Like, { foreignKey: 'userId', sourceKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId' });

User.hasMany(Collect, {
  foreignKey: 'userId',
  sourceKey: 'userId',
  as: 'collects',
});
Collect.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId' });

CircleMoment.hasMany(Like, { foreignKey: 'momentId', as: 'likes' });
Like.belongsTo(CircleMoment, { foreignKey: 'momentId' });

CircleMoment.hasMany(Collect, { foreignKey: 'momentId', as: 'collects' });
Collect.belongsTo(CircleMoment, { foreignKey: 'momentId' });

// 好友关联
User.belongsToMany(User, {
  through: Friendship,
  as: 'friends',
  foreignKey: 'userId',
  otherKey: 'friendId',
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
  Friendship,
};
