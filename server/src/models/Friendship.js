const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Friendship = sequelize.define(
  'Friendship',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
    friendId: {
      type: DataTypes.STRING(36),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
      defaultValue: 'accepted', // 简化起见，当前默认直接接受
    },
  },
  {
    tableName: 'friendships',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'friendId'],
      },
    ],
  },
);

module.exports = Friendship;
