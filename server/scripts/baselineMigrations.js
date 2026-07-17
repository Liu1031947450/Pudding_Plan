require('dotenv').config();
const { DataTypes } = require('sequelize');
const sequelize = require('../src/config/database');

const BASELINE_MIGRATION = '20260414000100-initialize-core-schema.js';
const REQUIRED_TABLES = [
  'users',
  'plans',
  'habits',
  'notifications',
  'badges',
  'templates',
  'circle_moments',
  'likes',
  'collects',
  'friendships',
  'comments',
];

const REQUIRED_COLUMNS = {
  users: ['id', 'userId', 'phone'],
  plans: ['id', 'userId', 'completedDate', 'totalDays', 'type'],
  habits: ['id', 'userId'],
  notifications: ['id', 'userId'],
  badges: ['id', 'userId', 'badgeKey'],
  templates: ['id', 'duration'],
  circle_moments: ['id', 'authorId', 'likesCount', 'commentsCount'],
  likes: ['id', 'userId', 'momentId'],
  collects: ['id', 'userId', 'momentId'],
  friendships: ['id', 'userId', 'friendId'],
  comments: ['id', 'userId', 'momentId', 'content'],
};

async function main() {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  const tables = new Set((await queryInterface.showAllTables()).map(String));
  const missing = REQUIRED_TABLES.filter(table => !tables.has(table));

  if (missing.length > 0) {
    throw new Error(
      `数据库缺少基线表，拒绝写入迁移记录: ${missing.join(', ')}`,
    );
  }

  const missingColumns = [];
  for (const [table, requiredColumns] of Object.entries(REQUIRED_COLUMNS)) {
    const columns = await queryInterface.describeTable(table);
    for (const column of requiredColumns) {
      if (!columns[column]) missingColumns.push(`${table}.${column}`);
    }
  }
  if (missingColumns.length > 0) {
    throw new Error(
      `数据库字段不足，拒绝写入迁移记录: ${missingColumns.join(', ')}`,
    );
  }

  await sequelize.transaction(async transaction => {
    if (!tables.has('SequelizeMeta')) {
      await queryInterface.createTable(
        'SequelizeMeta',
        {
          name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            unique: true,
          },
        },
        { transaction },
      );
    }

    await sequelize.query(
      'INSERT INTO "SequelizeMeta" (name) VALUES (:name) ON CONFLICT (name) DO NOTHING',
      { replacements: { name: BASELINE_MIGRATION }, transaction },
    );
  });

  console.log(`迁移基线已确认: ${BASELINE_MIGRATION}`);
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
