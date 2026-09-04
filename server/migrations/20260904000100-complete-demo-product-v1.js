'use strict';

const hasColumn = async (queryInterface, table, column, transaction) => {
  const description = await queryInterface.describeTable(table, {
    transaction,
  });
  return Boolean(description[column]);
};

const constraintExists = async (sequelize, table, name, transaction) => {
  const [rows] = await sequelize.query(
    `
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = :table
        AND constraint_name = :name
      LIMIT 1
    `,
    { replacements: { table, name }, transaction },
  );
  return rows.length > 0;
};

const addCheck = async (
  queryInterface,
  table,
  name,
  expression,
  transaction,
) => {
  if (
    !(await constraintExists(
      queryInterface.sequelize,
      table,
      name,
      transaction,
    ))
  ) {
    await queryInterface.sequelize.query(
      `ALTER TABLE "${table}" ADD CONSTRAINT "${name}" CHECK (${expression})`,
      { transaction },
    );
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async transaction => {
      if (
        !(await hasColumn(queryInterface, 'users', 'goalTags', transaction))
      ) {
        await queryInterface.addColumn(
          'users',
          'goalTags',
          {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: ['自律'],
          },
          { transaction },
        );
      }

      if (!(await hasColumn(queryInterface, 'plans', 'status', transaction))) {
        await queryInterface.addColumn(
          'plans',
          'status',
          {
            type: Sequelize.STRING(16),
            allowNull: false,
            defaultValue: 'active',
          },
          { transaction },
        );
      }

      if (
        await hasColumn(queryInterface, 'plans', 'completedDate', transaction)
      ) {
        await sequelize.query(
          `
            INSERT INTO plan_check_ins
              ("planId", "checkInDate", "createdAt", "updatedAt")
            SELECT DISTINCT p.id, completed_date, NOW(), NOW()
            FROM plans p
            CROSS JOIN LATERAL unnest(COALESCE(p."completedDate", ARRAY[]::date[])) completed_date
            ON CONFLICT ("planId", "checkInDate") DO NOTHING
          `,
          { transaction },
        );
        const [[missing]] = await sequelize.query(
          `
            SELECT COUNT(*)::int AS count
            FROM plans p
            CROSS JOIN LATERAL unnest(COALESCE(p."completedDate", ARRAY[]::date[])) completed_date
            LEFT JOIN plan_check_ins pci
              ON pci."planId" = p.id AND pci."checkInDate" = completed_date
            WHERE pci.id IS NULL
          `,
          { transaction },
        );
        if (Number(missing.count) !== 0) {
          throw new Error('plans.completedDate 迁移校验失败，拒绝删除旧字段');
        }
        await queryInterface.removeColumn('plans', 'completedDate', {
          transaction,
        });
      }

      for (const [column, definition] of [
        [
          'weekdays',
          {
            type: Sequelize.JSONB,
            allowNull: false,
            defaultValue: [0, 1, 2, 3, 4, 5, 6],
          },
        ],
        ['reminderTime', { type: Sequelize.STRING(5), allowNull: true }],
        [
          'startDate',
          {
            type: Sequelize.DATEONLY,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_DATE'),
          },
        ],
        [
          'isActive',
          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        ],
        [
          'sortOrder',
          { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        ],
      ]) {
        if (!(await hasColumn(queryInterface, 'habits', column, transaction))) {
          await queryInterface.addColumn('habits', column, definition, {
            transaction,
          });
        }
      }

      const tables = new Set(
        (await queryInterface.showAllTables({ transaction })).map(String),
      );
      if (!tables.has('habit_check_ins')) {
        await queryInterface.createTable(
          'habit_check_ins',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            habitId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'habits', key: 'id' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            checkInDate: { type: Sequelize.DATEONLY, allowNull: false },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.fn('NOW'),
            },
          },
          { transaction },
        );
      }

      if (await hasColumn(queryInterface, 'habits', 'completed', transaction)) {
        await sequelize.query(
          `
            INSERT INTO habit_check_ins
              ("habitId", "checkInDate", "createdAt", "updatedAt")
            SELECT id, ("updatedAt" AT TIME ZONE 'Asia/Shanghai')::date, NOW(), NOW()
            FROM habits
            WHERE completed = TRUE
            ON CONFLICT DO NOTHING
          `,
          { transaction },
        );
        await queryInterface.removeColumn('habits', 'completed', {
          transaction,
        });
      }

      if (
        !(await hasColumn(
          queryInterface,
          'circle_moments',
          'visibility',
          transaction,
        ))
      ) {
        await queryInterface.addColumn(
          'circle_moments',
          'visibility',
          {
            type: Sequelize.STRING(16),
            allowNull: false,
            defaultValue: 'public',
          },
          { transaction },
        );
      }
      if (
        !(await hasColumn(
          queryInterface,
          'circle_moments',
          'location',
          transaction,
        ))
      ) {
        await queryInterface.addColumn(
          'circle_moments',
          'location',
          { type: Sequelize.STRING(120), allowNull: true },
          { transaction },
        );
      }

      const createUserRelationTable = async (table, left, right) => {
        if (tables.has(table)) return;
        await queryInterface.createTable(
          table,
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            [left]: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            [right]: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.fn('NOW'),
            },
          },
          { transaction },
        );
        tables.add(table);
      };

      await createUserRelationTable('follows', 'userId', 'followingId');
      await createUserRelationTable('user_blocks', 'blockerId', 'blockedId');

      if (!tables.has('buddy_relationships')) {
        await queryInterface.createTable(
          'buddy_relationships',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            requesterId: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            addresseeId: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            status: {
              type: Sequelize.STRING(16),
              allowNull: false,
              defaultValue: 'pending',
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.fn('NOW'),
            },
          },
          { transaction },
        );
        tables.add('buddy_relationships');
      }

      if (!tables.has('content_reports')) {
        await queryInterface.createTable(
          'content_reports',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            reporterId: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            targetType: { type: Sequelize.STRING(16), allowNull: false },
            targetId: { type: Sequelize.INTEGER, allowNull: false },
            reason: { type: Sequelize.STRING(24), allowNull: false },
            detail: { type: Sequelize.STRING(500), allowNull: true },
            status: {
              type: Sequelize.STRING(16),
              allowNull: false,
              defaultValue: 'pending',
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.fn('NOW'),
            },
          },
          { transaction },
        );
        tables.add('content_reports');
      }

      if (tables.has('friendships')) {
        await sequelize.query(
          `
            INSERT INTO follows ("userId", "followingId", "createdAt", "updatedAt")
            SELECT "userId", "friendId", "createdAt", "updatedAt"
            FROM friendships WHERE status = 'accepted'
            ON CONFLICT DO NOTHING
          `,
          { transaction },
        );
        await sequelize.query(
          `
            INSERT INTO buddy_relationships
              ("requesterId", "addresseeId", status, "createdAt", "updatedAt")
            SELECT "userId", "friendId", 'pending', "createdAt", "updatedAt"
            FROM (
              SELECT DISTINCT ON (LEAST("userId", "friendId"), GREATEST("userId", "friendId"))
                "userId", "friendId", "createdAt", "updatedAt"
              FROM friendships
              WHERE status = 'pending' AND "userId" <> "friendId"
              ORDER BY
                LEAST("userId", "friendId"),
                GREATEST("userId", "friendId"),
                "createdAt"
            ) pending_relationships
            ON CONFLICT DO NOTHING
          `,
          { transaction },
        );
        await sequelize.query(
          `
            INSERT INTO user_blocks
              ("blockerId", "blockedId", "createdAt", "updatedAt")
            SELECT "userId", "friendId", "createdAt", "updatedAt"
            FROM friendships WHERE status = 'blocked'
            ON CONFLICT DO NOTHING
          `,
          { transaction },
        );
        await queryInterface.dropTable('friendships', { transaction });
        await sequelize.query('DROP TYPE IF EXISTS "enum_friendships_status"', {
          transaction,
        });
      }

      await sequelize.query(
        `UPDATE user_settings SET theme = 'light' WHERE theme <> 'light'`,
        { transaction },
      );
      if (
        await constraintExists(
          sequelize,
          'user_settings',
          'user_settings_theme_check',
          transaction,
        )
      ) {
        await queryInterface.removeConstraint(
          'user_settings',
          'user_settings_theme_check',
          { transaction },
        );
      }
      if (
        await constraintExists(
          sequelize,
          'notifications',
          'notifications_target_type_check',
          transaction,
        )
      ) {
        await queryInterface.removeConstraint(
          'notifications',
          'notifications_target_type_check',
          { transaction },
        );
      }

      for (const [table, fields, name] of [
        [
          'habit_check_ins',
          ['habitId', 'checkInDate'],
          'habit_check_ins_habit_date_unique',
        ],
        ['follows', ['userId', 'followingId'], 'follows_user_following_unique'],
        ['user_blocks', ['blockerId', 'blockedId'], 'user_blocks_pair_unique'],
        [
          'content_reports',
          ['reporterId', 'targetType', 'targetId'],
          'content_reports_reporter_target_unique',
        ],
      ]) {
        await sequelize.query(
          `CREATE UNIQUE INDEX IF NOT EXISTS "${name}" ON "${table}" (${fields
            .map(field => `"${field}"`)
            .join(', ')})`,
          { transaction },
        );
      }
      await sequelize.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS buddy_relationships_pair_unique
         ON buddy_relationships
         (LEAST("requesterId", "addresseeId"), GREATEST("requesterId", "addresseeId"))`,
        { transaction },
      );

      for (const [table, fields, name] of [
        ['habit_check_ins', ['checkInDate'], 'habit_check_ins_date_idx'],
        ['habits', ['userId', 'sortOrder'], 'habits_user_sort_order_idx'],
        [
          'follows',
          ['followingId', 'createdAt'],
          'follows_following_created_idx',
        ],
        [
          'buddy_relationships',
          ['requesterId', 'status'],
          'buddies_requester_status_idx',
        ],
        [
          'buddy_relationships',
          ['addresseeId', 'status'],
          'buddies_addressee_status_idx',
        ],
        ['user_blocks', ['blockedId'], 'user_blocks_blocked_idx'],
        [
          'content_reports',
          ['status', 'createdAt'],
          'content_reports_status_created_idx',
        ],
        [
          'circle_moments',
          ['visibility', 'createdAt'],
          'circle_moments_visibility_created_idx',
        ],
      ]) {
        await sequelize.query(
          `CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" (${fields
            .map(field => `"${field}"`)
            .join(', ')})`,
          { transaction },
        );
      }

      await addCheck(
        queryInterface,
        'users',
        'users_goal_tags_check',
        `jsonb_typeof("goalTags") = 'array' AND jsonb_array_length("goalTags") BETWEEN 1 AND 3`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'plans',
        'plans_status_check',
        `status IN ('active', 'paused', 'archived')`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'habits',
        'habits_weekdays_check',
        `jsonb_typeof(weekdays) = 'array' AND jsonb_array_length(weekdays) BETWEEN 1 AND 7`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'habits',
        'habits_reminder_time_check',
        `"reminderTime" IS NULL OR "reminderTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'habits',
        'habits_sort_order_check',
        `"sortOrder" >= 0`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'circle_moments',
        'circle_moments_visibility_check',
        `visibility IN ('public', 'buddies', 'private')`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'follows',
        'follows_not_self_check',
        `"userId" <> "followingId"`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'buddy_relationships',
        'buddy_relationships_not_self_check',
        `"requesterId" <> "addresseeId"`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'buddy_relationships',
        'buddy_relationships_status_check',
        `status IN ('pending', 'accepted')`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'user_blocks',
        'user_blocks_not_self_check',
        `"blockerId" <> "blockedId"`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'notifications',
        'notifications_target_type_check',
        `"targetType" IS NULL OR "targetType" IN ('moment', 'comment', 'user', 'buddy', 'plan', 'habit')`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'content_reports',
        'content_reports_target_type_check',
        `"targetType" IN ('moment', 'comment')`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'content_reports',
        'content_reports_reason_check',
        `reason IN ('spam', 'harassment', 'inappropriate', 'other')`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'content_reports',
        'content_reports_status_check',
        `status IN ('pending', 'rejected', 'actioned')`,
        transaction,
      );
      await addCheck(
        queryInterface,
        'user_settings',
        'user_settings_theme_check',
        `theme = 'light'`,
        transaction,
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async transaction => {
      if (
        !(await hasColumn(
          queryInterface,
          'plans',
          'completedDate',
          transaction,
        ))
      ) {
        await queryInterface.addColumn(
          'plans',
          'completedDate',
          {
            type: Sequelize.ARRAY(Sequelize.DATEONLY),
            allowNull: false,
            defaultValue: [],
          },
          { transaction },
        );
        await sequelize.query(
          `
            UPDATE plans p
            SET "completedDate" = COALESCE(records.dates, ARRAY[]::date[])
            FROM (
              SELECT "planId", array_agg("checkInDate" ORDER BY "checkInDate") dates
              FROM plan_check_ins GROUP BY "planId"
            ) records
            WHERE records."planId" = p.id
          `,
          { transaction },
        );
      }
      if (
        !(await hasColumn(queryInterface, 'habits', 'completed', transaction))
      ) {
        await queryInterface.addColumn(
          'habits',
          'completed',
          { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          { transaction },
        );
        await sequelize.query(
          `UPDATE habits SET completed = EXISTS (
             SELECT 1 FROM habit_check_ins WHERE "habitId" = habits.id
           )`,
          { transaction },
        );
      }

      for (const table of [
        'content_reports',
        'user_blocks',
        'buddy_relationships',
        'follows',
        'habit_check_ins',
      ]) {
        await queryInterface.dropTable(table, { transaction });
      }
      for (const column of [
        'weekdays',
        'reminderTime',
        'startDate',
        'isActive',
        'sortOrder',
      ]) {
        if (await hasColumn(queryInterface, 'habits', column, transaction)) {
          await queryInterface.removeColumn('habits', column, { transaction });
        }
      }
      for (const [table, column] of [
        ['users', 'goalTags'],
        ['plans', 'status'],
        ['circle_moments', 'visibility'],
        ['circle_moments', 'location'],
      ]) {
        if (await hasColumn(queryInterface, table, column, transaction)) {
          await queryInterface.removeColumn(table, column, { transaction });
        }
      }
    });
  },
};
