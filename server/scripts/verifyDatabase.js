require('dotenv').config();
const sequelize = require('../src/config/database');
const { QueryTypes } = require('sequelize');

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

const REQUIRED_COLUMNS = {
  users: ['userId', 'phone', 'avatar', 'goalTags', 'tokenVersion'],
  plans: ['userId', 'status', 'sortOrder'],
  plan_check_ins: ['planId', 'checkInDate', 'numericValue', 'note'],
  habits: [
    'userId',
    'weekdays',
    'reminderTime',
    'startDate',
    'isActive',
    'sortOrder',
  ],
  habit_check_ins: ['habitId', 'checkInDate'],
  circle_moments: ['authorId', 'visibility', 'location', 'images'],
  follows: ['userId', 'followingId'],
  buddy_relationships: ['requesterId', 'addresseeId', 'status'],
  user_blocks: ['blockerId', 'blockedId'],
  content_reports: ['reporterId', 'targetType', 'targetId', 'reason', 'status'],
};

const REQUIRED_INDEXES = [
  'plan_check_ins_plan_date_unique',
  'habit_check_ins_habit_date_unique',
  'plans_user_sort_order_idx',
  'habits_user_sort_order_idx',
  'likes_user_moment_unique',
  'collects_user_moment_unique',
  'follows_user_following_unique',
  'buddy_relationships_pair_unique',
  'user_blocks_pair_unique',
  'content_reports_reporter_target_unique',
];

const REQUIRED_CONSTRAINTS = [
  'users_goal_tags_check',
  'plans_status_check',
  'plan_check_ins_numeric_nonnegative',
  'plan_check_ins_single_detail',
  'plan_check_ins_note_not_blank',
  'habits_weekdays_check',
  'habits_reminder_time_check',
  'habits_sort_order_check',
  'circle_moments_visibility_check',
  'follows_not_self_check',
  'buddy_relationships_not_self_check',
  'buddy_relationships_status_check',
  'user_blocks_not_self_check',
  'content_reports_target_type_check',
  'content_reports_reason_check',
  'content_reports_status_check',
  'user_settings_theme_check',
];

async function main() {
  await sequelize.authenticate();
  const [tables, columns, indexes, constraints] = await Promise.all([
    sequelize.query(
      `SELECT relname AS table_name FROM pg_class
       WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'`,
      { type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT table_name, column_name FROM information_schema.columns
       WHERE table_schema = 'public'`,
      { type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`,
      { type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT constraint_name FROM information_schema.table_constraints
       WHERE table_schema = 'public'`,
      { type: QueryTypes.SELECT },
    ),
  ]);
  const tableNames = new Set(tables.map(row => row.table_name));
  const columnNames = new Set(
    columns.map(row => `${row.table_name}.${row.column_name}`),
  );
  const indexNames = new Set(indexes.map(row => row.indexname));
  const constraintNames = new Set(constraints.map(row => row.constraint_name));
  const missingTables = REQUIRED_TABLES.filter(name => !tableNames.has(name));
  const missingColumns = Object.entries(REQUIRED_COLUMNS).flatMap(
    ([table, names]) =>
      names
        .filter(name => !columnNames.has(`${table}.${name}`))
        .map(name => `${table}.${name}`),
  );
  const missingIndexes = REQUIRED_INDEXES.filter(name => !indexNames.has(name));
  const missingConstraints = REQUIRED_CONSTRAINTS.filter(
    name => !constraintNames.has(name),
  );
  const forbidden = [
    tableNames.has('friendships') ? 'friendships table' : null,
    columnNames.has('plans.completedDate') ? 'plans.completedDate' : null,
    columnNames.has('habits.completed') ? 'habits.completed' : null,
  ].filter(Boolean);
  if (
    missingTables.length ||
    missingColumns.length ||
    missingIndexes.length ||
    missingConstraints.length ||
    forbidden.length
  ) {
    throw new Error(
      `数据库结构不完整。缺少表: ${
        missingTables.join(', ') || '无'
      }；缺少字段: ${missingColumns.join(', ') || '无'}；缺少索引: ${
        missingIndexes.join(', ') || '无'
      }；缺少约束: ${missingConstraints.join(', ') || '无'}；仍存在旧结构: ${
        forbidden.join(', ') || '无'
      }`,
    );
  }

  const [orphans] = await sequelize.query(
    `SELECT
       (SELECT count(*)::int FROM plans x LEFT JOIN users u ON u.id = x."userId" WHERE u.id IS NULL) plans,
       (SELECT count(*)::int FROM plan_check_ins x LEFT JOIN plans p ON p.id = x."planId" WHERE p.id IS NULL) plan_check_ins,
       (SELECT count(*)::int FROM habits x LEFT JOIN users u ON u.id = x."userId" WHERE u.id IS NULL) habits,
       (SELECT count(*)::int FROM habit_check_ins x LEFT JOIN habits h ON h.id = x."habitId" WHERE h.id IS NULL) habit_check_ins,
       (SELECT count(*)::int FROM circle_moments x LEFT JOIN users u ON u.id = x."authorId" WHERE u.id IS NULL) moments,
       (SELECT count(*)::int FROM comments x LEFT JOIN circle_moments m ON m.id = x."momentId" LEFT JOIN users u ON u.id = x."userId" WHERE m.id IS NULL OR u.id IS NULL) comments,
       (SELECT count(*)::int FROM follows x LEFT JOIN users a ON a."userId" = x."userId" LEFT JOIN users b ON b."userId" = x."followingId" WHERE a.id IS NULL OR b.id IS NULL) follows,
       (SELECT count(*)::int FROM buddy_relationships x LEFT JOIN users a ON a."userId" = x."requesterId" LEFT JOIN users b ON b."userId" = x."addresseeId" WHERE a.id IS NULL OR b.id IS NULL) buddies,
       (SELECT count(*)::int FROM user_blocks x LEFT JOIN users a ON a."userId" = x."blockerId" LEFT JOIN users b ON b."userId" = x."blockedId" WHERE a.id IS NULL OR b.id IS NULL) blocks,
       (SELECT count(*)::int FROM content_reports x LEFT JOIN users u ON u."userId" = x."reporterId" WHERE u.id IS NULL) reports`,
    { type: QueryTypes.SELECT },
  );
  const orphanEntries = Object.entries(orphans).filter(
    ([, count]) => Number(count) > 0,
  );
  if (orphanEntries.length) {
    throw new Error(
      `存在外键孤儿记录: ${orphanEntries
        .map(([name, count]) => `${name}=${count}`)
        .join(', ')}`,
    );
  }

  const [invalid] = await sequelize.query(
    `SELECT
       (SELECT count(*)::int FROM users WHERE jsonb_array_length("goalTags") NOT BETWEEN 1 AND 3) goal_tags,
       (SELECT count(*)::int FROM habits WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements_text(weekdays) value
         WHERE value::int < 0 OR value::int > 6
       )) weekdays,
       (SELECT count(*)::int FROM buddy_relationships WHERE "requesterId" = "addresseeId") self_buddies`,
    { type: QueryTypes.SELECT },
  );
  const invalidEntries = Object.entries(invalid).filter(
    ([, count]) => Number(count) > 0,
  );
  if (invalidEntries.length) {
    throw new Error(
      `存在无效业务数据: ${invalidEntries
        .map(([name, count]) => `${name}=${count}`)
        .join(', ')}`,
    );
  }

  console.log({
    database: sequelize.getDatabaseName(),
    tables: REQUIRED_TABLES.length,
    schema: 'ok',
    orphanRows: 0,
    legacyFieldsRemoved: true,
  });
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
