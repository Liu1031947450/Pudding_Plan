const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Habit = sequelize.define(
  'Habit',
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
    subtitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'check-circle',
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    category: {
      type: DataTypes.STRING(50),
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
    tableName: 'habits',
    timestamps: true,
    indexes: [{ fields: ['userId'] }],
  },
);

module.exports = Habit;
