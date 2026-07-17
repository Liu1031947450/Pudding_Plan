const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Template = sequelize.define(
  'Template',
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 21,
      validate: { min: 1 },
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    goals: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    checkpoints: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    tips: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      defaultValue: 'easy',
    },
    frequency: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    tableName: 'templates',
    timestamps: true,
    indexes: [{ fields: ['category'] }, { fields: ['difficulty'] }],
  },
);

module.exports = Template;
