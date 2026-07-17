const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanCheckIn = sequelize.define(
  'PlanCheckIn',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plans',
        key: 'id',
      },
    },
    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    numericValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      validate: { min: 0 },
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'plan_check_ins',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['planId', 'checkInDate'] },
      { fields: ['checkInDate'] },
    ],
  },
);

module.exports = PlanCheckIn;
