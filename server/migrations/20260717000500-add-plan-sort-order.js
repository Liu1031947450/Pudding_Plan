'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      const columns = await queryInterface.describeTable('plans', {
        transaction,
      });
      if (!columns.sortOrder) {
        await queryInterface.addColumn(
          'plans',
          'sortOrder',
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          { transaction },
        );
      }

      await queryInterface.sequelize.query(
        `
          WITH ranked AS (
            SELECT id, row_number() OVER (
              PARTITION BY "userId" ORDER BY "createdAt" DESC, id DESC
            ) - 1 AS position
            FROM plans
          )
          UPDATE plans
          SET "sortOrder" = ranked.position
          FROM ranked
          WHERE plans.id = ranked.id
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints
              WHERE table_schema = 'public'
                AND table_name = 'plans'
                AND constraint_name = 'plans_sort_order_check'
            ) THEN
              ALTER TABLE plans
              ADD CONSTRAINT plans_sort_order_check CHECK ("sortOrder" >= 0);
            END IF;
          END $$;
        `,
        { transaction },
      );
      await queryInterface.sequelize.query(
        'CREATE INDEX IF NOT EXISTS plans_user_sort_order_idx ON plans ("userId", "sortOrder")',
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('plans', 'sortOrder');
  },
};
