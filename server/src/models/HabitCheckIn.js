const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HabitCheckIn = sequelize.define(
  'HabitCheckIn',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    habitId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'habits', key: 'id' },
    },
    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: 'habit_check_ins',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['habitId', 'checkInDate'] },
      { fields: ['checkInDate'] },
    ],
  },
);

module.exports = HabitCheckIn;
