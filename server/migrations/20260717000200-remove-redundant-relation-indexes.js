'use strict';

const parseColumns = value =>
  Array.isArray(value)
    ? value
    : String(value)
        .replace(/^\{|\}$/g, '')
        .split(',')
        .filter(Boolean);

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async transaction => {
      for (const target of [
        {
          table: 'likes',
          columns: ['userId', 'momentId'],
          keep: 'likes_user_moment_unique',
        },
        {
          table: 'collects',
          columns: ['userId', 'momentId'],
          keep: 'collects_user_moment_unique',
        },
        {
          table: 'friendships',
          columns: ['userId', 'friendId'],
          keep: 'friendships_user_friend_unique',
        },
      ]) {
        const [indexes] = await sequelize.query(
          `
            SELECT
              index_class.relname AS index_name,
              constraint_data.conname AS constraint_name,
              array_agg(attribute_data.attname ORDER BY key_data.ordinality) AS columns
            FROM pg_index index_data
            JOIN pg_class table_class ON table_class.oid = index_data.indrelid
            JOIN pg_class index_class ON index_class.oid = index_data.indexrelid
            JOIN LATERAL unnest(index_data.indkey)
              WITH ORDINALITY AS key_data(attnum, ordinality) ON true
            JOIN pg_attribute attribute_data
              ON attribute_data.attrelid = table_class.oid
             AND attribute_data.attnum = key_data.attnum
            LEFT JOIN pg_constraint constraint_data
              ON constraint_data.conindid = index_class.oid
            WHERE table_class.relnamespace = 'public'::regnamespace
              AND table_class.relname = :table
              AND index_data.indisunique
              AND NOT index_data.indisprimary
            GROUP BY index_class.relname, constraint_data.conname
          `,
          { replacements: { table: target.table }, transaction },
        );

        for (const index of indexes) {
          const columns = parseColumns(index.columns);
          if (
            index.index_name === target.keep ||
            columns.length !== target.columns.length ||
            !target.columns.every((column, i) => columns[i] === column)
          ) {
            continue;
          }

          if (index.constraint_name) {
            await queryInterface.removeConstraint(
              target.table,
              index.constraint_name,
              { transaction },
            );
          } else {
            await queryInterface.removeIndex(target.table, index.index_name, {
              transaction,
            });
          }
        }
      }
    });
  },

  async down() {
    // 删除的是同列重复索引，不在回滚时恢复冗余结构。
  },
};
