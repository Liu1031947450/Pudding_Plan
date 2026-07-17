'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      const columns = await queryInterface.describeTable('users', {
        transaction,
      });
      if (!columns.tokenVersion) {
        await queryInterface.addColumn(
          'users',
          'tokenVersion',
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
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints
              WHERE table_schema = 'public'
                AND table_name = 'users'
                AND constraint_name = 'users_token_version_check'
            ) THEN
              ALTER TABLE users
              ADD CONSTRAINT users_token_version_check CHECK ("tokenVersion" >= 0);
            END IF;
          END $$;
        `,
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'tokenVersion');
  },
};
