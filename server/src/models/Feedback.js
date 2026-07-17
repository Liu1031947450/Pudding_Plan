const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define(
  'Feedback',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    category: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [['suggestion', 'issue', 'experience', 'other']] },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [5, 500] },
    },
    contact: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'new',
      validate: { isIn: [['new', 'reviewing', 'resolved', 'closed']] },
    },
  },
  {
    tableName: 'feedbacks',
    timestamps: true,
    indexes: [{ fields: ['status', 'createdAt'] }],
  },
);

module.exports = Feedback;
