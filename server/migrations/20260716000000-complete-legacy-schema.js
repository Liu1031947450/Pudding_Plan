'use strict';

const tableNames = async (queryInterface, transaction) =>
  new Set(
    (await queryInterface.showAllTables({ transaction })).map(table =>
      typeof table === 'string' ? table : table.tableName,
    ),
  );

const addColumnIfMissing = async (
  queryInterface,
  table,
  column,
  definition,
  transaction,
) => {
  const columns = await queryInterface.describeTable(table, { transaction });
  if (!columns[column]) {
    await queryInterface.addColumn(table, column, definition, { transaction });
  }
};

const relationExists = async (sequelize, name, transaction) => {
  const [rows] = await sequelize.query(
    `
      SELECT 1
      FROM pg_class
      WHERE relnamespace = 'public'::regnamespace
        AND relname = :name
      LIMIT 1
    `,
    { replacements: { name }, transaction },
  );
  return rows.length > 0;
};

const addUniqueIfMissing = async (
  queryInterface,
  table,
  columns,
  name,
  transaction,
) => {
  if (!(await relationExists(queryInterface.sequelize, name, transaction))) {
    await queryInterface.addConstraint(table, {
      fields: columns,
      type: 'unique',
      name,
      transaction,
    });
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      const tables = await tableNames(queryInterface, transaction);

      if (!tables.has('templates')) {
        await queryInterface.createTable(
          'templates',
          {
            id: {
              type: Sequelize.STRING(36),
              allowNull: false,
              primaryKey: true,
            },
            title: { type: Sequelize.STRING(100), allowNull: false },
            subtitle: { type: Sequelize.STRING(150), allowNull: true },
            duration: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 21,
            },
            icon: { type: Sequelize.STRING(50), allowNull: true },
            color: { type: Sequelize.STRING(20), allowNull: true },
            category: { type: Sequelize.STRING(50), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            goals: { type: Sequelize.JSON, allowNull: true, defaultValue: [] },
            checkpoints: {
              type: Sequelize.JSON,
              allowNull: true,
              defaultValue: [],
            },
            tips: { type: Sequelize.JSON, allowNull: true, defaultValue: [] },
            difficulty: {
              type: Sequelize.ENUM('easy', 'medium', 'hard'),
              allowNull: false,
              defaultValue: 'easy',
            },
            frequency: { type: Sequelize.STRING(50), allowNull: true },
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

      if (!tables.has('circle_moments')) {
        await queryInterface.createTable(
          'circle_moments',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            authorId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'users', key: 'id' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            title: { type: Sequelize.STRING(200), allowNull: true },
            description: { type: Sequelize.TEXT, allowNull: true },
            content: { type: Sequelize.TEXT, allowNull: true },
            category: { type: Sequelize.STRING(50), allowNull: true },
            imageUri: { type: Sequelize.STRING(500), allowNull: true },
            images: { type: Sequelize.JSON, allowNull: true, defaultValue: [] },
            likesCount: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 0,
            },
            commentsCount: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: 0,
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
      }

      if (!tables.has('likes')) {
        await queryInterface.createTable(
          'likes',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            userId: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            momentId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'circle_moments', key: 'id' },
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
      }

      if (!tables.has('collects')) {
        await queryInterface.createTable(
          'collects',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            userId: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            momentId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'circle_moments', key: 'id' },
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
      }

      if (!tables.has('friendships')) {
        await queryInterface.createTable(
          'friendships',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            userId: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            friendId: {
              type: Sequelize.STRING(36),
              allowNull: false,
              references: { model: 'users', key: 'userId' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            status: {
              type: Sequelize.ENUM('pending', 'accepted', 'blocked'),
              allowNull: false,
              defaultValue: 'accepted',
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
      }

      if (!tables.has('comments')) {
        await queryInterface.createTable(
          'comments',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            momentId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'circle_moments', key: 'id' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            userId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'users', key: 'id' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            parentId: {
              type: Sequelize.INTEGER,
              allowNull: true,
              references: { model: 'comments', key: 'id' },
              onUpdate: 'CASCADE',
              onDelete: 'SET NULL',
            },
            content: { type: Sequelize.TEXT, allowNull: false },
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

      await addColumnIfMissing(
        queryInterface,
        'notifications',
        'senderId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        transaction,
      );
      await addColumnIfMissing(
        queryInterface,
        'notifications',
        'targetType',
        { type: Sequelize.STRING(20), allowNull: true },
        transaction,
      );
      await addColumnIfMissing(
        queryInterface,
        'notifications',
        'targetId',
        { type: Sequelize.INTEGER, allowNull: true },
        transaction,
      );
      await addColumnIfMissing(
        queryInterface,
        'badges',
        'unlockedAt',
        { type: Sequelize.DATE, allowNull: true },
        transaction,
      );

      await queryInterface.changeColumn(
        'users',
        'avatar',
        { type: Sequelize.STRING(1000), allowNull: true },
        { transaction },
      );
      for (const column of ['title', 'description', 'icon', 'color']) {
        await queryInterface.changeColumn(
          'badges',
          column,
          {
            type: Sequelize.STRING(
              column === 'description'
                ? 255
                : column === 'title'
                ? 100
                : column === 'icon'
                ? 50
                : 20,
            ),
            allowNull: true,
          },
          { transaction },
        );
      }

      await addUniqueIfMissing(
        queryInterface,
        'likes',
        ['userId', 'momentId'],
        'likes_user_moment_unique',
        transaction,
      );
      await addUniqueIfMissing(
        queryInterface,
        'collects',
        ['userId', 'momentId'],
        'collects_user_moment_unique',
        transaction,
      );
      await addUniqueIfMissing(
        queryInterface,
        'friendships',
        ['userId', 'friendId'],
        'friendships_user_friend_unique',
        transaction,
      );
    });
  },

  async down() {
    // 该迁移接管了历史上由 sequelize.sync() 创建的表。回滚删除这些表或字段
    // 无法区分旧数据与迁移后数据，因此刻意保持非破坏性。
  },
};
