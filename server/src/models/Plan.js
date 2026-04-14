const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  completedDate: {
    type: DataTypes.ARRAY(DataTypes.DATEONLY),
    defaultValue: []
  },
  type: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isIn: [[0, 1, 2]]
    }
  },
  remindSetting: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  rewords: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'flag'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true
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
  tableName: 'plans',
  timestamps: true
});

module.exports = Plan;
