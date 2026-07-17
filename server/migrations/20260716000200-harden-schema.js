'use strict';

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

const removeConstraintIfExists = async (
  queryInterface,
  table,
  name,
  transaction,
) => {
  if (
    await constraintExists(queryInterface.sequelize, table, name, transaction)
  ) {
    await queryInterface.removeConstraint(table, name, { transaction });
  }
};

const addConstraintIfMissing = async (
  queryInterface,
  table,
  options,
  transaction,
) => {
  if (
    !(await constraintExists(
      queryInterface.sequelize,
      table,
      options.name,
      transaction,
    ))
  ) {
    await queryInterface.addConstraint(table, {
      ...options,
      transaction,
    });
  }
};

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    await sequelize.transaction(async transaction => {
      // sequelize.sync() 曾在每次启动时重复生成 users UNIQUE 约束。
      // 先移除依赖这些约束的外键，再重建唯一的规范约束与外键。
      await removeConstraintIfExists(
        queryInterface,
        'likes',
        'likes_userId_fkey',
        transaction,
      );
      await removeConstraintIfExists(
        queryInterface,
        'collects',
        'collects_userId_fkey',
        transaction,
      );
      await removeConstraintIfExists(
        queryInterface,
        'friendships',
        'friendships_userId_fkey',
        transaction,
      );
      await removeConstraintIfExists(
        queryInterface,
        'friendships',
        'friendships_friendId_fkey',
        transaction,
      );

      const [userUniqueConstraints] = await sequelize.query(
        `
          SELECT DISTINCT tc.constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
           AND tc.constraint_schema = kcu.constraint_schema
          WHERE tc.table_schema = 'public'
            AND tc.table_name = 'users'
            AND tc.constraint_type = 'UNIQUE'
            AND kcu.column_name IN ('phone', 'userId')
        `,
        { transaction },
      );

      for (const { constraint_name: name } of userUniqueConstraints) {
        await queryInterface.removeConstraint('users', name, { transaction });
      }

      await addConstraintIfMissing(
        queryInterface,
        'users',
        {
          fields: ['phone'],
          type: 'unique',
          name: 'users_phone_unique',
        },
        transaction,
      );
      await addConstraintIfMissing(
        queryInterface,
        'users',
        {
          fields: ['userId'],
          type: 'unique',
          name: 'users_public_id_unique',
        },
        transaction,
      );

      for (const [table, column, name] of [
        ['likes', 'userId', 'likes_userId_fkey'],
        ['collects', 'userId', 'collects_userId_fkey'],
        ['friendships', 'userId', 'friendships_userId_fkey'],
        ['friendships', 'friendId', 'friendships_friendId_fkey'],
      ]) {
        await addConstraintIfMissing(
          queryInterface,
          table,
          {
            fields: [column],
            type: 'foreign key',
            name,
            references: { table: 'users', field: 'userId' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          transaction,
        );
      }

      await removeConstraintIfExists(
        queryInterface,
        'notifications',
        'notifications_senderId_fkey',
        transaction,
      );
      await addConstraintIfMissing(
        queryInterface,
        'notifications',
        {
          fields: ['senderId'],
          type: 'foreign key',
          name: 'notifications_senderId_fkey',
          references: { table: 'users', field: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        transaction,
      );

      await addConstraintIfMissing(
        queryInterface,
        'badges',
        {
          fields: ['userId', 'badgeKey'],
          type: 'unique',
          name: 'badges_user_badge_unique',
        },
        transaction,
      );

      await sequelize.query(
        'DROP INDEX IF EXISTS friendships_user_id_friend_id',
        { transaction },
      );

      const checks = [
        ['users', 'users_phone_format_check', `phone ~ '^[0-9]{11}$'`],
        [
          'users',
          'users_public_id_format_check',
          `"userId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
        ],
        ['plans', 'plans_total_days_check', '"totalDays" > 0'],
        ['plans', 'plans_type_check', 'type IN (0, 1, 2)'],
        [
          'circle_moments',
          'circle_moments_likes_count_check',
          '"likesCount" >= 0',
        ],
        [
          'circle_moments',
          'circle_moments_comments_count_check',
          '"commentsCount" >= 0',
        ],
        ['comments', 'comments_content_check', 'length(btrim(content)) > 0'],
        ['friendships', 'friendships_not_self_check', '"userId" <> "friendId"'],
        ['templates', 'templates_duration_check', 'duration > 0'],
        [
          'notifications',
          'notifications_target_type_check',
          '"targetType" IS NULL OR "targetType" IN (\'moment\', \'comment\')',
        ],
      ];

      for (const [table, name, expression] of checks) {
        if (!(await constraintExists(sequelize, table, name, transaction))) {
          await sequelize.query(
            `ALTER TABLE "${table}" ADD CONSTRAINT "${name}" CHECK (${expression})`,
            { transaction },
          );
        }
      }

      const indexes = [
        'CREATE INDEX IF NOT EXISTS plans_user_id_idx ON plans ("userId")',
        'CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits ("userId")',
        'CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications ("userId", "createdAt" DESC)',
        'CREATE INDEX IF NOT EXISTS notifications_user_unread_created_idx ON notifications ("userId", "createdAt" DESC) WHERE read = false',
        'CREATE INDEX IF NOT EXISTS notifications_sender_id_idx ON notifications ("senderId")',
        'CREATE INDEX IF NOT EXISTS circle_moments_author_created_idx ON circle_moments ("authorId", "createdAt" DESC)',
        'CREATE INDEX IF NOT EXISTS circle_moments_created_at_idx ON circle_moments ("createdAt" DESC)',
        'CREATE INDEX IF NOT EXISTS circle_moments_category_idx ON circle_moments (category)',
        'CREATE INDEX IF NOT EXISTS likes_moment_created_idx ON likes ("momentId", "createdAt" DESC)',
        'CREATE INDEX IF NOT EXISTS collects_user_created_idx ON collects ("userId", "createdAt" DESC)',
        'CREATE INDEX IF NOT EXISTS comments_moment_created_idx ON comments ("momentId", "createdAt" DESC)',
        'CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments ("parentId")',
        'CREATE INDEX IF NOT EXISTS friendships_friend_status_idx ON friendships ("friendId", status)',
        'CREATE INDEX IF NOT EXISTS templates_category_idx ON templates (category)',
        'CREATE INDEX IF NOT EXISTS templates_difficulty_idx ON templates (difficulty)',
      ];

      for (const sql of indexes) {
        await sequelize.query(sql, { transaction });
      }
    });
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async transaction => {
      for (const [table, name] of [
        ['likes', 'likes_userId_fkey'],
        ['collects', 'collects_userId_fkey'],
        ['friendships', 'friendships_userId_fkey'],
        ['friendships', 'friendships_friendId_fkey'],
        ['notifications', 'notifications_senderId_fkey'],
      ]) {
        await removeConstraintIfExists(
          queryInterface,
          table,
          name,
          transaction,
        );
      }

      for (const [table, name] of [
        ['users', 'users_phone_format_check'],
        ['users', 'users_public_id_format_check'],
        ['plans', 'plans_total_days_check'],
        ['plans', 'plans_type_check'],
        ['circle_moments', 'circle_moments_likes_count_check'],
        ['circle_moments', 'circle_moments_comments_count_check'],
        ['comments', 'comments_content_check'],
        ['friendships', 'friendships_not_self_check'],
        ['templates', 'templates_duration_check'],
        ['notifications', 'notifications_target_type_check'],
        ['badges', 'badges_user_badge_unique'],
      ]) {
        await removeConstraintIfExists(
          queryInterface,
          table,
          name,
          transaction,
        );
      }

      await removeConstraintIfExists(
        queryInterface,
        'users',
        'users_phone_unique',
        transaction,
      );
      await removeConstraintIfExists(
        queryInterface,
        'users',
        'users_public_id_unique',
        transaction,
      );
      await addConstraintIfMissing(
        queryInterface,
        'users',
        {
          fields: ['phone'],
          type: 'unique',
          name: 'users_phone_key',
        },
        transaction,
      );
      await addConstraintIfMissing(
        queryInterface,
        'users',
        {
          fields: ['userId'],
          type: 'unique',
          name: 'users_userId_key',
        },
        transaction,
      );

      for (const [table, column, name] of [
        ['likes', 'userId', 'likes_userId_fkey'],
        ['collects', 'userId', 'collects_userId_fkey'],
      ]) {
        await addConstraintIfMissing(
          queryInterface,
          table,
          {
            fields: [column],
            type: 'foreign key',
            name,
            references: { table: 'users', field: 'userId' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          transaction,
        );
      }
      await addConstraintIfMissing(
        queryInterface,
        'notifications',
        {
          fields: ['senderId'],
          type: 'foreign key',
          name: 'notifications_senderId_fkey',
          references: { table: 'users', field: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        transaction,
      );

      for (const name of [
        'plans_user_id_idx',
        'habits_user_id_idx',
        'notifications_user_created_idx',
        'notifications_user_unread_created_idx',
        'notifications_sender_id_idx',
        'circle_moments_author_created_idx',
        'circle_moments_created_at_idx',
        'circle_moments_category_idx',
        'likes_moment_created_idx',
        'collects_user_created_idx',
        'comments_moment_created_idx',
        'comments_parent_id_idx',
        'friendships_friend_status_idx',
        'templates_category_idx',
        'templates_difficulty_idx',
      ]) {
        await sequelize.query(`DROP INDEX IF EXISTS "${name}"`, {
          transaction,
        });
      }
    });
  },
};
