const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CircleMoment = sequelize.define('CircleMoment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  imageUri: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  likes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'circle_moments',
  timestamps: true
});

module.exports = CircleMoment;
