const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSetting = sequelize.define(
  'UserSetting',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'users', key: 'id' },
    },
    notificationsEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notificationTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: '08:00',
    },
    dndStart: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: '22:00',
    },
    dndEnd: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: '07:00',
    },
    theme: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'system',
      validate: { isIn: [['light', 'dark', 'system']] },
    },
    fontSize: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'medium',
      validate: { isIn: [['small', 'medium', 'large']] },
    },
  },
  {
    tableName: 'user_settings',
    timestamps: true,
  },
);

module.exports = UserSetting;
