'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      const tables = new Set(
        (await queryInterface.showAllTables({ transaction })).map(String),
      );

      if (!tables.has('plan_check_ins')) {
        await queryInterface.createTable(
          'plan_check_ins',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
              allowNull: false,
            },
            planId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'plans', key: 'id' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            checkInDate: {
              type: Sequelize.DATEONLY,
              allowNull: false,
            },
            numericValue: {
              type: Sequelize.DECIMAL(12, 2),
              allowNull: true,
            },
            note: {
              type: Sequelize.TEXT,
              allowNull: true,
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

      await queryInterface.sequelize.query(
        `
          INSERT INTO plan_check_ins
            ("planId", "checkInDate", "createdAt", "updatedAt")
          SELECT DISTINCT p.id, completed_date, NOW(), NOW()
          FROM plans p
          CROSS JOIN LATERAL unnest(
            COALESCE(p."completedDate", ARRAY[]::date[])
          ) AS completed_date
          ON CONFLICT DO NOTHING
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
          CREATE UNIQUE INDEX IF NOT EXISTS plan_check_ins_plan_date_unique
          ON plan_check_ins ("planId", "checkInDate")
        `,
        { transaction },
      );
      await queryInterface.sequelize.query(
        `
          CREATE INDEX IF NOT EXISTS plan_check_ins_date_idx
          ON plan_check_ins ("checkInDate")
        `,
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async transaction => {
      const tables = new Set(
        (await queryInterface.showAllTables({ transaction })).map(String),
      );
      if (!tables.has('plan_check_ins')) return;

      await queryInterface.sequelize.query(
        `
          UPDATE plans p
          SET "completedDate" = COALESCE(check_ins.dates, ARRAY[]::date[])
          FROM (
            SELECT "planId", array_agg("checkInDate" ORDER BY "checkInDate") AS dates
            FROM plan_check_ins
            GROUP BY "planId"
          ) check_ins
          WHERE p.id = check_ins."planId"
        `,
        { transaction },
      );

      await queryInterface.dropTable('plan_check_ins', { transaction });
    });
  },
};
