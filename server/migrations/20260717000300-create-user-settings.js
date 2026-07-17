'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async transaction => {
      const tables = new Set(
        (await queryInterface.showAllTables({ transaction })).map(String),
      );
      if (!tables.has('user_settings')) {
        await queryInterface.createTable(
          'user_settings',
          {
            userId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              primaryKey: true,
              references: { model: 'users', key: 'id' },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            notificationsEnabled: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
            notificationTime: {
              type: Sequelize.STRING(5),
              allowNull: false,
              defaultValue: '08:00',
            },
            dndStart: {
              type: Sequelize.STRING(5),
              allowNull: false,
              defaultValue: '22:00',
            },
            dndEnd: {
              type: Sequelize.STRING(5),
              allowNull: false,
              defaultValue: '07:00',
            },
            theme: {
              type: Sequelize.STRING(10),
              allowNull: false,
              defaultValue: 'system',
            },
            fontSize: {
              type: Sequelize.STRING(10),
              allowNull: false,
              defaultValue: 'medium',
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

      for (const [name, expression] of [
        [
          'user_settings_notification_time_check',
          '"notificationTime" ~ \'^([01][0-9]|2[0-3]):[0-5][0-9]$\'',
        ],
        [
          'user_settings_dnd_start_check',
          '"dndStart" ~ \'^([01][0-9]|2[0-3]):[0-5][0-9]$\'',
        ],
        [
          'user_settings_dnd_end_check',
          '"dndEnd" ~ \'^([01][0-9]|2[0-3]):[0-5][0-9]$\'',
        ],
        ['user_settings_theme_check', "theme IN ('light', 'dark', 'system')"],
        [
          'user_settings_font_size_check',
          "\"fontSize\" IN ('small', 'medium', 'large')",
        ],
      ]) {
        await queryInterface.sequelize.query(
          `
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE table_schema = 'public'
                  AND table_name = 'user_settings'
                  AND constraint_name = '${name}'
              ) THEN
                ALTER TABLE user_settings
                ADD CONSTRAINT "${name}" CHECK (${expression});
              END IF;
            END $$;
          `,
          { transaction },
        );
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_settings');
  },
};
