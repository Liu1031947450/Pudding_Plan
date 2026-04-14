const sequelize = require('../config/database');
const { User, Plan, Habit } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function initDatabase() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功！');

    // 先同步 User 表（不使用 alter，避免冲突）
    const userTableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('users'));

    if (userTableExists) {
      // 检查 userId 列是否存在
      const columns = await sequelize.getQueryInterface().describeTable('users');

      if (!columns.userId) {
        // 添加 userId 列（允许 NULL）
        await sequelize.query('ALTER TABLE users ADD COLUMN "userId" VARCHAR(36);');
        console.log('添加 userId 列成功');

        // 为现有用户生成 UUID
        const users = await sequelize.query('SELECT id FROM users WHERE "userId" IS NULL', {
          type: sequelize.QueryTypes.SELECT
        });

        for (const user of users) {
          const userId = uuidv4();
          await sequelize.query('UPDATE users SET "userId" = :userId WHERE id = :id', {
            replacements: { userId, id: user.id }
          });
        }
        console.log(`为 ${users.length} 个现有用户生成了 UUID`);

        // 设置 userId 为 NOT NULL 和 UNIQUE
        await sequelize.query('ALTER TABLE users ALTER COLUMN "userId" SET NOT NULL;');
        await sequelize.query('ALTER TABLE users ADD CONSTRAINT users_userId_unique UNIQUE ("userId");');
        console.log('设置 userId 约束成功');
      }

      // 检查并添加 avatar 和 bio 列
      if (!columns.avatar) {
        await sequelize.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255);');
        console.log('添加 avatar 列成功');
      }
      if (!columns.bio) {
        await sequelize.query('ALTER TABLE users ADD COLUMN bio VARCHAR(200);');
        console.log('添加 bio 列成功');
      }
    }

    // 同步所有表结构
    await User.sync({ alter: true });
    await Plan.sync({ alter: true });
    await Habit.sync({ alter: true });
    console.log('数据库表同步成功！');

    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

module.exports = initDatabase;
