const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    momentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'circle_moments',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'comments',
    timestamps: true,
  },
);

module.exports = Comment;
