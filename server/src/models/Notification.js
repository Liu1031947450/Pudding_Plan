const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '刚刚',
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification;
