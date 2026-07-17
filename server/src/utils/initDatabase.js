const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { User, CircleMoment, Template } = require('../models');
const { mockCircles, mockBuddies } = require('../data/mockData/communityData');
const { templateDetails } = require('../data/mockData/templates');

const REQUIRED_TABLES = [
  'users',
  'plans',
  'plan_check_ins',
  'habits',
  'notifications',
  'badges',
  'templates',
  'circle_moments',
  'likes',
  'collects',
  'friendships',
  'comments',
  'user_settings',
  'feedbacks',
];

async function verifySchema() {
  const tables = new Set(
    (await sequelize.getQueryInterface().showAllTables()).map(String),
  );
  const missing = REQUIRED_TABLES.filter(table => !tables.has(table));
  if (missing.length > 0) {
    throw new Error(
      `数据库结构未迁移完成，缺少表: ${missing.join(
        ', ',
      )}。请先执行 npm run db:migrate`,
    );
  }
}

async function seedTemplates() {
  if ((await Template.count()) > 0) return;

  await Template.bulkCreate(
    Object.values(templateDetails).map(item => ({
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
    })),
  );
  console.log('计划模板数据初始化成功');
}

async function seedDemoCommunityData() {
  if (process.env.SEED_DEMO_DATA !== 'true') return;

  const hashedPassword = await bcrypt.hash('123456', 10);
  const authors = new Map();
  const demoPeople = [
    ...mockCircles
      .filter(item => item.type === 'waterfall' && item.authorName)
      .map(item => ({
        name: item.authorName,
        avatar: item.authorAvatarUri,
        bio: '热爱生活的布丁计划成员',
      })),
    ...mockBuddies.map(item => ({
      name: item.name,
      avatar: item.avatarUri,
      bio: item.goal,
    })),
  ];

  for (const [index, person] of demoPeople.entries()) {
    if (authors.has(person.name)) continue;
    const [user] = await User.findOrCreate({
      where: { username: person.name },
      defaults: {
        phone: `199${String(index).padStart(8, '0')}`,
        password: hashedPassword,
        avatar: person.avatar || null,
        bio: person.bio || null,
      },
    });
    authors.set(person.name, user);
  }

  if ((await CircleMoment.count()) === 0) {
    await CircleMoment.bulkCreate(
      mockCircles
        .filter(item => item.type === 'waterfall' && item.authorName)
        .map(item => ({
          authorId: authors.get(item.authorName).id,
          title: item.title || '',
          description: item.description || '',
          content: item.content || '',
          category: item.category || '',
          imageUri: item.imageUri || null,
          images: item.images || [],
          likesCount: item.likes || 0,
          commentsCount: item.commentsCount || 0,
        })),
    );
  }

  console.log('演示圈子数据初始化成功');
}

async function initDatabase() {
  await sequelize.authenticate();
  console.log('数据库连接成功！');

  await verifySchema();
  await seedTemplates();
  await seedDemoCommunityData();
  return true;
}

module.exports = initDatabase;
