const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBlock = sequelize.define(
  'UserBlock',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    blockerId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: { model: 'users', key: 'userId' },
    },
    blockedId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: { model: 'users', key: 'userId' },
    },
  },
  {
    tableName: 'user_blocks',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['blockerId', 'blockedId'] },
      { fields: ['blockedId'] },
    ],
  },
);

module.exports = UserBlock;
