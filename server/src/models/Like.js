const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define(
  'Like',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'userId',
      },
    },
    momentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'circle_moments',
        key: 'id',
      },
    },
  },
  {
    tableName: 'likes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'momentId'],
      },
      { fields: ['momentId', 'createdAt'] },
    ],
  },
);

module.exports = Like;
