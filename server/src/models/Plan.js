const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define(
  'Plan',
  {
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
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    totalDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'active',
      validate: { isIn: [['active', 'paused', 'archived']] },
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isIn: [[0, 1, 2]],
      },
    },
    remindSetting: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    rewords: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: 'flag',
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'plans',
    timestamps: true,
    indexes: [{ fields: ['userId'] }, { fields: ['userId', 'sortOrder'] }],
  },
);

module.exports = Plan;
