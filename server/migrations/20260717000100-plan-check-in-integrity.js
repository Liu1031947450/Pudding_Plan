'use strict';

const constraintExists = async (sequelize, name, transaction) => {
  const [rows] = await sequelize.query(
    `
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = 'plan_check_ins'
        AND constraint_name = :name
      LIMIT 1
    `,
    { replacements: { name }, transaction },
  );
  return rows.length > 0;
};

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async transaction => {
      for (const [name, expression] of [
        ['plan_check_ins_numeric_nonnegative', '"numericValue" >= 0'],
        [
          'plan_check_ins_single_detail',
          '"numericValue" IS NULL OR note IS NULL',
        ],
        [
          'plan_check_ins_note_not_blank',
          'note IS NULL OR (length(btrim(note)) > 0 AND length(note) <= 5000)',
        ],
      ]) {
        if (!(await constraintExists(sequelize, name, transaction))) {
          await sequelize.query(
            `ALTER TABLE plan_check_ins ADD CONSTRAINT "${name}" CHECK (${expression})`,
            { transaction },
          );
        }
      }
    });
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    await sequelize.transaction(async transaction => {
      for (const name of [
        'plan_check_ins_numeric_nonnegative',
        'plan_check_ins_single_detail',
        'plan_check_ins_note_not_blank',
      ]) {
        if (await constraintExists(sequelize, name, transaction)) {
          await queryInterface.removeConstraint('plan_check_ins', name, {
            transaction,
          });
        }
      }
    });
  },
};
