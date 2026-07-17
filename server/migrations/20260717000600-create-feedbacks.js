'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.createTable(
        'feedbacks',
        {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          category: {
            type: Sequelize.STRING(20),
            allowNull: false,
          },
          content: { type: Sequelize.TEXT, allowNull: false },
          contact: { type: Sequelize.STRING(100), allowNull: true },
          status: {
            type: Sequelize.STRING(20),
            allowNull: false,
            defaultValue: 'new',
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

      for (const [name, expression] of [
        [
          'feedbacks_category_check',
          "category IN ('suggestion', 'issue', 'experience', 'other')",
        ],
        ['feedbacks_content_check', 'length(btrim(content)) BETWEEN 5 AND 500'],
        [
          'feedbacks_status_check',
          "status IN ('new', 'reviewing', 'resolved', 'closed')",
        ],
      ]) {
        await queryInterface.sequelize.query(
          `ALTER TABLE feedbacks ADD CONSTRAINT "${name}" CHECK (${expression})`,
          { transaction },
        );
      }
      await queryInterface.sequelize.query(
        'CREATE INDEX feedbacks_status_created_idx ON feedbacks (status, "createdAt" DESC)',
        { transaction },
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('feedbacks');
  },
};
