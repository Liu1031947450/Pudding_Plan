const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BuddyRelationship = sequelize.define(
  'BuddyRelationship',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    requesterId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: { model: 'users', key: 'userId' },
    },
    addresseeId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: { model: 'users', key: 'userId' },
    },
    status: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'pending',
      validate: { isIn: [['pending', 'accepted']] },
    },
  },
  {
    tableName: 'buddy_relationships',
    timestamps: true,
    indexes: [
      { fields: ['requesterId', 'status'] },
      { fields: ['addresseeId', 'status'] },
    ],
  },
);

module.exports = BuddyRelationship;
