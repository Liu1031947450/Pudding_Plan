const sequelize = require('../config/database');
const { User, Plan, Habit, Notification, Badge, CircleMoment } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { mockCircles } = require('../data/mockData/communityData');

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

async function seedCircleMoments() {
  const count = await CircleMoment.count();
  if (count > 0) {
    return;
  }

  const bcrypt = require('bcrypt');
  const authorMap = new Map();

  for (const item of mockCircles) {
    if (item.type !== 'waterfall' || !item.authorName) continue;

    if (!authorMap.has(item.authorName)) {
      let author = await User.findOne({ where: { username: item.authorName } });

      if (!author) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        author = await User.create({
          username: item.authorName,
          phone: `00${String(authorMap.size).padStart(9, '0')}`,
          password: hashedPassword,
          avatar: item.authorAvatarUri || null,
        });
      }

      authorMap.set(item.authorName, author);
    }
  }

  const momentsToCreate = mockCircles
    .filter(item => item.type === 'waterfall' && item.authorName)
    .map(item => ({
      authorId: authorMap.get(item.authorName).id,
      title: item.title || '',
      description: item.description || '',
      content: item.content || '',
      category: item.category || '',
      imageUri: item.imageUri || null,
      images: item.images || [],
      likes: item.likes || 0,
      commentsCount: item.commentsCount || 0,
    }));

  if (momentsToCreate.length > 0) {
    await CircleMoment.bulkCreate(momentsToCreate);
  }
}

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功！');

    await ensureUsersTableMigration();

    await sequelize.sync();
    console.log('数据库表同步成功！');

    await seedCircleMoments();

    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

module.exports = initDatabase;
