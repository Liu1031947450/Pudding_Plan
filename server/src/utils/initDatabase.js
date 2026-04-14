const sequelize = require('../config/database');
const { User, Plan, Habit, Notification, Badge } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function ensureUsersTableMigration() {
  const userTableExists = await sequelize.getQueryInterface().showAllTables()
    .then(tables => tables.includes('users'));

  if (!userTableExists) {
    return;
  }

  const columns = await sequelize.getQueryInterface().describeTable('users');

  if (!columns.userId) {
    await sequelize.query('ALTER TABLE users ADD COLUMN "userId" VARCHAR(36);');

    const users = await sequelize.query('SELECT id FROM users WHERE "userId" IS NULL', {
      type: sequelize.QueryTypes.SELECT,
    });

    for (const user of users) {
      const userId = uuidv4();
      await sequelize.query('UPDATE users SET "userId" = :userId WHERE id = :id', {
        replacements: { userId, id: user.id },
      });
    }

    await sequelize.query('ALTER TABLE users ALTER COLUMN "userId" SET NOT NULL;');
    await sequelize.query('ALTER TABLE users ADD CONSTRAINT users_userId_unique UNIQUE ("userId");');
  }

  if (!columns.avatar) {
    await sequelize.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255);');
  }
  if (!columns.bio) {
    await sequelize.query('ALTER TABLE users ADD COLUMN bio VARCHAR(200);');
  }
}

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功！');

    await ensureUsersTableMigration();

    await sequelize.sync();
    console.log('数据库表同步成功！');

    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

module.exports = initDatabase;
