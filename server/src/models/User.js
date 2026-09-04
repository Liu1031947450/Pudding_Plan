const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(36),
      unique: true,
      allowNull: false,
      defaultValue: () => uuidv4(),
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(11),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    bio: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    goalTags: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: ['自律'],
      validate: {
        isValidGoalTags(value) {
          if (
            !Array.isArray(value) ||
            value.length < 1 ||
            value.length > 3 ||
            value.some(
              tag =>
                typeof tag !== 'string' ||
                !tag.trim() ||
                tag.trim().length > 20,
            )
          ) {
            throw new Error('目标标签需为1至3个非空标签');
          }
        },
      },
    },
    tokenVersion: {
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
    tableName: 'users',
    timestamps: true,
  },
);

module.exports = User;
