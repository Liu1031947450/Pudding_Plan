require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../src/config/database');
const {
  User,
  Plan,
  PlanCheckIn,
  Habit,
  HabitCheckIn,
  CircleMoment,
  Comment,
  Follow,
  BuddyRelationship,
  Notification,
  UserSetting,
  Template,
} = require('../src/models');
const { templateDetails } = require('../src/data/templates');
const { toDateString } = require('../src/utils/checkInUtils');

const DEMO_PASSWORD = 'Pudding123';
const addDays = amount => {
  const date = new Date();
  date.setDate(date.getDate() + amount);
  return toDateString(date);
};

async function main() {
  if (sequelize.getDatabaseName() !== 'pudding_plan_demo') {
    throw new Error('安全保护：demo:seed 仅允许写入 pudding_plan_demo');
  }
  await sequelize.authenticate();
  await sequelize.transaction(async transaction => {
    await sequelize.query(
      `TRUNCATE TABLE users, templates RESTART IDENTITY CASCADE`,
      { transaction },
    );
    await Template.bulkCreate(
      Object.values(templateDetails).map(item => ({
        id: String(item.id),
        title: item.title,
        subtitle: item.subtitle,
        duration: item.duration,
        icon: item.icon,
        color: item.color,
        category: item.category,
        description: item.description,
        goals: item.goals || [],
        checkpoints: item.checkpoints || [],
        tips: item.tips || [],
        difficulty: item.difficulty,
        frequency: item.frequency,
      })),
      { transaction },
    );
    const password = await bcrypt.hash(DEMO_PASSWORD, 10);
    const [pudding, dawn, truffle] = await User.bulkCreate(
      [
        {
          userId: '00000000-0000-4000-8000-000000000001',
          username: '小布丁',
          phone: '13800000001',
          password,
          bio: '把大目标拆成今天能完成的一小步。',
          goalTags: ['自律', '阅读', '早睡'],
        },
        {
          userId: '00000000-0000-4000-8000-000000000002',
          username: '晨光',
          phone: '13800000002',
          password,
          bio: '正在坚持晨跑与规律作息。',
          goalTags: ['运动', '早睡', '自律'],
        },
        {
          userId: '00000000-0000-4000-8000-000000000003',
          username: '松露',
          phone: '13800000003',
          password,
          bio: '用阅读和记录保持稳定成长。',
          goalTags: ['阅读', '学习', '记录'],
        },
      ],
      { transaction, returning: true },
    );
    await UserSetting.bulkCreate(
      [pudding, dawn, truffle].map(user => ({
        userId: user.id,
        theme: 'light',
      })),
      { transaction },
    );

    const [reading, running, archived] = await Plan.bulkCreate(
      [
        {
          userId: pudding.id,
          title: '每天阅读 20 分钟',
          totalDays: 30,
          type: 1,
          status: 'active',
          remindSetting: [{ time: '21:00', status: true }],
          rewords: [],
          icon: 'menu-book',
          color: '#F2C94C',
          sortOrder: 0,
        },
        {
          userId: pudding.id,
          title: '晚间复盘',
          totalDays: 21,
          type: 2,
          status: 'paused',
          remindSetting: [{ time: '22:00', status: true }],
          rewords: [],
          icon: 'edit-note',
          color: '#8ECDF5',
          sortOrder: 1,
        },
        {
          userId: pudding.id,
          title: '七天早起挑战',
          totalDays: 7,
          type: 0,
          status: 'archived',
          remindSetting: [],
          rewords: [],
          icon: 'wb-sunny',
          color: '#FF9D8A',
          sortOrder: 2,
        },
      ],
      { transaction, returning: true },
    );
    await PlanCheckIn.bulkCreate(
      [
        { planId: reading.id, checkInDate: addDays(-2), numericValue: 25 },
        { planId: reading.id, checkInDate: addDays(-1), numericValue: 30 },
        { planId: reading.id, checkInDate: addDays(0), numericValue: 20 },
        {
          planId: running.id,
          checkInDate: addDays(-3),
          note: '完成了睡前复盘。',
        },
        { planId: archived.id, checkInDate: addDays(-6) },
      ],
      { transaction },
    );

    const [water, stretch] = await Habit.bulkCreate(
      [
        {
          userId: pudding.id,
          title: '喝水 8 杯',
          subtitle: '照顾好身体的基础',
          icon: 'water-drop',
          category: '健康',
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          reminderTime: '10:00',
          startDate: addDays(-30),
          isActive: true,
          sortOrder: 0,
        },
        {
          userId: pudding.id,
          title: '拉伸 10 分钟',
          subtitle: '工作日舒展一下',
          icon: 'self-improvement',
          category: '运动',
          weekdays: [1, 2, 3, 4, 5],
          reminderTime: null,
          startDate: addDays(-30),
          isActive: true,
          sortOrder: 1,
        },
      ],
      { transaction, returning: true },
    );
    await HabitCheckIn.bulkCreate(
      [
        { habitId: water.id, checkInDate: addDays(-1) },
        { habitId: water.id, checkInDate: addDays(0) },
        { habitId: stretch.id, checkInDate: addDays(-1) },
      ],
      { transaction },
    );

    await Follow.bulkCreate(
      [
        { userId: pudding.userId, followingId: dawn.userId },
        { userId: dawn.userId, followingId: pudding.userId },
      ],
      { transaction },
    );
    const buddy = await BuddyRelationship.create(
      {
        requesterId: pudding.userId,
        addresseeId: dawn.userId,
        status: 'accepted',
      },
      { transaction },
    );
    const pendingBuddy = await BuddyRelationship.create(
      {
        requesterId: truffle.userId,
        addresseeId: pudding.userId,
        status: 'pending',
      },
      { transaction },
    );

    const [publicMoment] = await CircleMoment.bulkCreate(
      [
        {
          authorId: dawn.id,
          title: '晨跑后的第一束光',
          description: '今天也完成了自己的约定。',
          content: '慢一点没关系，持续行动就已经很好。',
          category: '运动',
          visibility: 'public',
          location: '城市公园',
          images: [],
        },
        {
          authorId: dawn.id,
          title: '给搭子的周末计划',
          description: '仅搭子可见的周末安排。',
          content: '周末一起完成一次长距离散步。',
          category: '自律',
          visibility: 'buddies',
          images: [],
        },
        {
          authorId: truffle.id,
          title: '私密阅读摘记',
          content: '这条内容只对作者本人可见。',
          category: '阅读',
          visibility: 'private',
          images: [],
        },
      ],
      { transaction, returning: true },
    );
    await Comment.create(
      {
        momentId: publicMoment.id,
        userId: pudding.id,
        content: '今天也一起加油！',
      },
      { transaction },
    );
    await publicMoment.update({ commentsCount: 1 }, { transaction });
    await Notification.bulkCreate(
      [
        {
          userId: pudding.id,
          senderId: truffle.id,
          type: 'buddy_request',
          title: '新的搭子请求',
          message: '松露想和你成为成长搭子',
          targetType: 'buddy',
          targetId: pendingBuddy.id,
        },
        {
          userId: pudding.id,
          senderId: dawn.id,
          type: 'buddy_encouragement',
          title: '搭子为你加油',
          message: '晨光给你送来一份鼓励：今天也一起坚持吧！',
          targetType: 'buddy',
          targetId: buddy.id,
        },
      ],
      { transaction },
    );
  });
  console.log('演示数据已写入');
  console.log('账号：13800000001 / 13800000002 / 13800000003');
  console.log(`统一密码：${DEMO_PASSWORD}`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
