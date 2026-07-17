const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Badge = sequelize.define(
  'Badge',
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
    badgeKey: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    unlocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    unlockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'badges',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'badgeKey'] }],
  },
);

module.exports = Badge;
