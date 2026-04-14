const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Collect = sequelize.define(
  'Collect',
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
    momentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'collects',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'momentId'],
      },
    ],
  },
);

module.exports = Collect;
