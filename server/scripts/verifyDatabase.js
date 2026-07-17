require('dotenv').config();
const { QueryTypes } = require('sequelize');
const sequelize = require('../src/config/database');

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

const REQUIRED_INDEXES = [
  'plan_check_ins_plan_date_unique',
  'likes_user_moment_unique',
  'collects_user_moment_unique',
  'friendships_user_friend_unique',
  'plans_user_id_idx',
  'plans_user_sort_order_idx',
  'feedbacks_status_created_idx',
  'notifications_user_unread_created_idx',
  'circle_moments_created_at_idx',
  'comments_moment_created_idx',
  'badges_user_badge_unique',
];

const REQUIRED_COLUMNS = {
  users: ['id', 'userId', 'phone', 'avatar', 'tokenVersion'],
  notifications: ['userId', 'senderId', 'targetType', 'targetId'],
  badges: ['userId', 'badgeKey', 'unlockedAt'],
  plan_check_ins: ['planId', 'checkInDate', 'numericValue', 'note'],
  plans: ['id', 'userId', 'sortOrder'],
  user_settings: [
    'userId',
    'notificationsEnabled',
    'notificationTime',
    'dndStart',
    'dndEnd',
    'theme',
    'fontSize',
  ],
  feedbacks: ['id', 'userId', 'category', 'content', 'contact', 'status'],
};

const REQUIRED_CONSTRAINTS = [
  'users_phone_format_check',
  'users_public_id_format_check',
  'users_token_version_check',
  'plans_total_days_check',
  'plans_type_check',
  'plans_sort_order_check',
  'plan_check_ins_numeric_nonnegative',
  'plan_check_ins_single_detail',
  'plan_check_ins_note_not_blank',
  'notifications_target_type_check',
  'user_settings_notification_time_check',
  'user_settings_dnd_start_check',
  'user_settings_dnd_end_check',
  'user_settings_theme_check',
  'user_settings_font_size_check',
  'feedbacks_category_check',
  'feedbacks_content_check',
  'feedbacks_status_check',
];

const COUNTED_TABLES = REQUIRED_TABLES.filter(
  table => table !== 'plan_check_ins',
);

async function main() {
  await sequelize.authenticate();
  const [tables] = await sequelize.query(`
    SELECT relname AS table_name
    FROM pg_class
    WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
  `);
  const [indexes] = await sequelize.query(`
    SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
  `);
  const [columns] = await sequelize.query(`
    SELECT table_name, column_name, character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `);
  const [constraints] = await sequelize.query(`
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
  `);
  const tableNames = new Set(tables.map(row => row.table_name));
  const indexNames = new Set(indexes.map(row => row.indexname));
  const columnNames = new Set(
    columns.map(row => `${row.table_name}.${row.column_name}`),
  );
  const constraintNames = new Set(constraints.map(row => row.constraint_name));
  const missingTables = REQUIRED_TABLES.filter(name => !tableNames.has(name));
  const missingIndexes = REQUIRED_INDEXES.filter(name => !indexNames.has(name));
  const missingColumns = Object.entries(REQUIRED_COLUMNS).flatMap(
    ([table, names]) =>
      names
        .filter(name => !columnNames.has(`${table}.${name}`))
        .map(name => `${table}.${name}`),
  );
  const missingConstraints = REQUIRED_CONSTRAINTS.filter(
    name => !constraintNames.has(name),
  );

  if (
    missingTables.length ||
    missingIndexes.length ||
    missingColumns.length ||
    missingConstraints.length
  ) {
    throw new Error(
      `数据库结构不完整。缺少表: ${
        missingTables.join(', ') || '无'
      }；缺少字段: ${missingColumns.join(', ') || '无'}；缺少约束: ${
        missingConstraints.join(', ') || '无'
      }；缺少索引: ${missingIndexes.join(', ') || '无'}`,
    );
  }

  const avatarColumn = columns.find(
    row => row.table_name === 'users' && row.column_name === 'avatar',
  );
  if ((avatarColumn?.character_maximum_length || 0) < 1000) {
    throw new Error('users.avatar 长度必须至少为 1000');
  }

  const [userUniqueConstraints] = await sequelize.query(`
    SELECT array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS columns
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.constraint_schema = kcu.constraint_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'users'
      AND tc.constraint_type = 'UNIQUE'
    GROUP BY tc.constraint_name
  `);
  const parseColumns = value =>
    Array.isArray(value)
      ? value
      : String(value)
          .replace(/^\{|\}$/g, '')
          .split(',')
          .filter(Boolean);
  for (const column of ['phone', 'userId']) {
    if (
      !userUniqueConstraints.some(constraint => {
        const names = parseColumns(constraint.columns);
        return names.length === 1 && names[0] === column;
      })
    ) {
      throw new Error(`users.${column} 缺少唯一约束`);
    }
  }

  const [orphans] = await sequelize.query(`
    SELECT
      (SELECT count(*)::int FROM plans p LEFT JOIN users u ON u.id = p."userId" WHERE u.id IS NULL) AS plans,
      (SELECT count(*)::int FROM plan_check_ins c LEFT JOIN plans p ON p.id = c."planId" WHERE p.id IS NULL) AS plan_check_ins,
      (SELECT count(*)::int FROM habits h LEFT JOIN users u ON u.id = h."userId" WHERE u.id IS NULL) AS habits,
      (SELECT count(*)::int FROM notifications n LEFT JOIN users u ON u.id = n."userId" WHERE u.id IS NULL) AS notifications,
      (SELECT count(*)::int FROM notifications n LEFT JOIN users u ON u.id = n."senderId" WHERE n."senderId" IS NOT NULL AND u.id IS NULL) AS notification_senders,
      (SELECT count(*)::int FROM badges b LEFT JOIN users u ON u.id = b."userId" WHERE u.id IS NULL) AS badges,
      (SELECT count(*)::int FROM user_settings s LEFT JOIN users u ON u.id = s."userId" WHERE u.id IS NULL) AS user_settings,
      (SELECT count(*)::int FROM feedbacks f LEFT JOIN users u ON u.id = f."userId" WHERE u.id IS NULL) AS feedbacks,
      (SELECT count(*)::int FROM circle_moments m LEFT JOIN users u ON u.id = m."authorId" WHERE u.id IS NULL) AS circle_moments,
      (SELECT count(*)::int FROM likes l LEFT JOIN users u ON u."userId" = l."userId" WHERE u.id IS NULL) AS like_users,
      (SELECT count(*)::int FROM likes l LEFT JOIN circle_moments m ON m.id = l."momentId" WHERE m.id IS NULL) AS like_moments,
      (SELECT count(*)::int FROM collects c LEFT JOIN users u ON u."userId" = c."userId" WHERE u.id IS NULL) AS collect_users,
      (SELECT count(*)::int FROM collects c LEFT JOIN circle_moments m ON m.id = c."momentId" WHERE m.id IS NULL) AS collect_moments,
      (SELECT count(*)::int FROM friendships f LEFT JOIN users u ON u."userId" = f."userId" WHERE u.id IS NULL) AS friendship_users,
      (SELECT count(*)::int FROM friendships f LEFT JOIN users u ON u."userId" = f."friendId" WHERE u.id IS NULL) AS friendship_friends,
      (SELECT count(*)::int FROM comments c LEFT JOIN users u ON u.id = c."userId" WHERE u.id IS NULL) AS comment_users,
      (SELECT count(*)::int FROM comments c LEFT JOIN circle_moments m ON m.id = c."momentId" WHERE m.id IS NULL) AS comment_moments,
      (SELECT count(*)::int FROM comments c LEFT JOIN comments p ON p.id = c."parentId" WHERE c."parentId" IS NOT NULL AND p.id IS NULL) AS comment_parents
  `);
  const orphanCounts = Object.entries(orphans[0]).filter(([, count]) => count);
  if (orphanCounts.length > 0) {
    throw new Error(
      `存在孤儿记录: ${orphanCounts
        .map(([table, count]) => `${table}=${count}`)
        .join(', ')}`,
    );
  }

  const counts = await Promise.all(
    COUNTED_TABLES.map(async table => {
      const [[row]] = await sequelize.query(
        `SELECT count(*)::int AS count FROM "${table}"`,
      );
      return [table, row.count];
    }),
  );

  console.log('数据库结构验证通过');
  console.log(
    Object.fromEntries([
      ...counts,
      [
        'plan_check_ins',
        Number(
          (
            await sequelize.query(
              'SELECT count(*)::int AS count FROM plan_check_ins',
              { type: QueryTypes.SELECT, plain: true },
            )
          ).count,
        ),
      ],
    ]),
  );
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
