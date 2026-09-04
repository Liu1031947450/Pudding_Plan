require('dotenv').config();
const { Sequelize } = require('sequelize');

if (
  process.env.NODE_ENV === 'production' &&
  ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].some(
    key => !process.env[key],
  )
) {
  throw new Error('生产环境数据库配置不完整');
}

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'pudding_plan_demo',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
