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
