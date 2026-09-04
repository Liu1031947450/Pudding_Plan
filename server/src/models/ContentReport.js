const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContentReport = sequelize.define(
  'ContentReport',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    reporterId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: { model: 'users', key: 'userId' },
    },
    targetType: {
      type: DataTypes.STRING(16),
      allowNull: false,
      validate: { isIn: [['moment', 'comment']] },
    },
    targetId: { type: DataTypes.INTEGER, allowNull: false },
    reason: {
      type: DataTypes.STRING(24),
      allowNull: false,
      validate: { isIn: [['spam', 'harassment', 'inappropriate', 'other']] },
    },
    detail: { type: DataTypes.STRING(500), allowNull: true },
    status: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'pending',
      validate: { isIn: [['pending', 'rejected', 'actioned']] },
    },
  },
  {
    tableName: 'content_reports',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['reporterId', 'targetType', 'targetId'] },
      { fields: ['status', 'createdAt'] },
    ],
  },
);

module.exports = ContentReport;
