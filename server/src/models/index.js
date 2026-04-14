
const User = require('./User');
const Plan = require('./Plan');
const Habit = require('./Habit');
const Notification = require('./Notification');
const Badge = require('./Badge');

// 定义关联关系
User.hasMany(Plan, { foreignKey: 'userId', as: 'plans' });
Plan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Habit, { foreignKey: 'userId', as: 'habits' });
Habit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Badge, { foreignKey: 'userId', as: 'badges' });
Badge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Plan,
  Habit,
  Notification,
  Badge,
};
