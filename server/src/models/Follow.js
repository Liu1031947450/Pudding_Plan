const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define(
  'Follow',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: { model: 'users', key: 'userId' },
    },
    followingId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: { model: 'users', key: 'userId' },
    },
  },
  {
    tableName: 'follows',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'followingId'] },
      { fields: ['followingId', 'createdAt'] },
    ],
  },
);

module.exports = Follow;
