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
    tableName: 'collects',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'momentId'],
      },
      { fields: ['userId', 'createdAt'] },
    ],
  },
);

module.exports = Collect;
