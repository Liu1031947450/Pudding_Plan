const sequelize = require('../config/database');
const {
  User,
  Plan,
  Habit,
  Notification,
  Badge,
  CircleMoment,
  Template,
  Friendship,
} = require('../models');
const { v4: uuidv4 } = require('uuid');
const { mockCircles, mockBuddies } = require('../data/mockData/communityData');
const { templateDetails } = require('../data/mockData/templates');
const bcrypt = require('bcrypt');

async function ensureUsersTableMigration() {
  const userTableExists = await sequelize
    .getQueryInterface()
    .showAllTables()
    .then(tables => tables.includes('users'));

  if (!userTableExists) return;

  const columns = await sequelize.getQueryInterface().describeTable('users');

  if (!columns.userId) {
    await sequelize.query('ALTER TABLE users ADD COLUMN "userId" VARCHAR(36);');

    const users = await sequelize.query(
      'SELECT id FROM users WHERE "userId" IS NULL',
      {
        type: sequelize.QueryTypes.SELECT,
      },
    );

    for (const user of users) {
      const userId = uuidv4();
      await sequelize.query(
        'UPDATE users SET "userId" = :userId WHERE id = :id',
        {
          replacements: { userId, id: user.id },
        },
      );
    }

    await sequelize.query(
      'ALTER TABLE users ALTER COLUMN "userId" SET NOT NULL;',
    );
    await sequelize.query(
      'ALTER TABLE users ADD CONSTRAINT users_userId_unique UNIQUE ("userId");',
    );
  }

  if (!columns.avatar) {
    await sequelize.query('ALTER TABLE users ADD COLUMN avatar VARCHAR(255);');
  }
  if (!columns.bio) {
    await sequelize.query('ALTER TABLE users ADD COLUMN bio VARCHAR(200);');
  }
}

async function seedTemplates() {
  const count = await Template.count();
  if (count > 0) return;

  const templatesToCreate = Object.values(templateDetails).map(item => ({
    id: String(item.id),
    title: item.title,
    subtitle: item.subtitle,
    duration: item.duration,
    icon: item.icon,
    color: item.color,
    category: item.category,
    description: item.description,
    goals: item.goals || [],
    checkpoints: item.checkpoints || [],
    tips: item.tips || [],
    difficulty: item.difficulty,
    frequency: item.frequency,
  }));

  await Template.bulkCreate(templatesToCreate);
  console.log('计划模板数据初始化成功');
}

async function seedCircleMomentsAndBuddies() {
  // 1. 初始化用户和动态
  const momentCount = await CircleMoment.count();
  if (momentCount > 0) return;

  const authorMap = new Map();

  for (const item of mockCircles) {
    if (item.type !== 'waterfall' || !item.authorName) continue;

    if (!authorMap.has(item.authorName)) {
      let author = await User.findOne({ where: { username: item.authorName } });

      if (!author) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        author = await User.create({
          username: item.authorName,
          phone: `00${String(Math.random()).slice(2, 11)}`,
          password: hashedPassword,
          avatar: item.authorAvatarUri || null,
          bio: '热爱生活的布丁计划成员',
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

  // 2. 初始化好友关系 (Buddies)
  const friendshipCount = await Friendship.count();
  if (friendshipCount > 0) return;

  // 创建一个测试机器人用户作为公共好友
  let robot = await User.findOne({ where: { username: '布丁助手' } });
  if (!robot) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    robot = await User.create({
      username: '布丁助手',
      phone: '13800000000',
      password: hashedPassword,
      avatar: 'https://i.pravatar.cc/150?u=robot',
      bio: '我是你的布丁助手，有问题随时问我。',
    });
  }

  // 将 mockBuddies 转化为真实用户并建立关系
  for (const buddy of mockBuddies) {
    let user = await User.findOne({ where: { username: buddy.name } });
    if (!user) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      user = await User.create({
        username: buddy.name,
        phone: `13${String(Math.random()).slice(2, 11)}`,
        password: hashedPassword,
        avatar: buddy.avatarUri,
        bio: buddy.goal,
      });
    }
  }

  console.log('圈子动态与好友数据初始化成功');
}

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功！');

    // 强制同步以确保新表（Template, Like, Collect, Friendship）被创建
    await sequelize.sync();
    console.log('数据库表同步成功！');

    await ensureUsersTableMigration();
    await seedTemplates();
    await seedCircleMomentsAndBuddies();

    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

module.exports = initDatabase;
