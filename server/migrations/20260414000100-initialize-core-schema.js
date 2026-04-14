'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(11),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      bio: {
        type: Sequelize.STRING(200),
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
    });

    await queryInterface.createTable('plans', {
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
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      totalDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      completedDate: {
        type: Sequelize.ARRAY(Sequelize.DATEONLY),
        allowNull: false,
        defaultValue: [],
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      remindSetting: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      rewords: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'flag',
      },
      color: {
        type: Sequelize.STRING(20),
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
    });

    await queryInterface.createTable('habits', {
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
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      subtitle: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'check-circle',
      },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      category: {
        type: Sequelize.STRING(50),
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
    });

    await queryInterface.createTable('notifications', {
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
      type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      time: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: '刚刚',
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    });

    await queryInterface.createTable('badges', {
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
      badgeKey: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      unlocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('badges');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('habits');
    await queryInterface.dropTable('plans');
    await queryInterface.dropTable('users');
  },
};
