const sequelize = require('../config/database');
const { Template } = require('../models');
const { templateDetails } = require('../data/templates');

const REQUIRED_TABLES = [
  'users',
  'plans',
  'plan_check_ins',
  'habits',
  'habit_check_ins',
  'notifications',
  'badges',
  'templates',
  'circle_moments',
  'likes',
  'collects',
  'comments',
  'user_settings',
  'feedbacks',
  'follows',
  'buddy_relationships',
  'user_blocks',
  'content_reports',
];

const verifySchema = async () => {
  const tables = new Set(
    (await sequelize.getQueryInterface().showAllTables()).map(String),
  );
  const missing = REQUIRED_TABLES.filter(table => !tables.has(table));
  if (missing.length) {
    throw new Error(
      `数据库结构未迁移完成，缺少表: ${missing.join(
        ', ',
      )}。请先执行 npm run db:migrate`,
    );
  }
};

const seedTemplates = async () => {
  for (const item of Object.values(templateDetails)) {
    await Template.findOrCreate({
      where: { id: String(item.id) },
      defaults: {
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
      },
    });
  }
};

const initDatabase = async () => {
  await sequelize.authenticate();
  await verifySchema();
  await seedTemplates();
  console.log(`数据库 ${sequelize.getDatabaseName()} 连接成功`);
  return true;
};

module.exports = initDatabase;
