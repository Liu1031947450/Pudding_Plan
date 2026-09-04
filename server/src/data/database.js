const {
  User,
  Plan,
  PlanCheckIn,
  Habit,
  HabitCheckIn,
  Notification,
  CircleMoment,
  Like,
  Collect,
  Follow,
  BuddyRelationship,
  UserBlock,
  ContentReport,
  UserSetting,
  Badge,
  Comment,
  Feedback,
} = require('../models');
const { Op } = require('sequelize');
const {
  calculateHabitStreak,
  calculateCurrentStreak,
  getCheckInDateError,
  isHabitScheduledForDate,
  toDateString,
} = require('../utils/checkInUtils');

const planCheckInInclude = {
  model: PlanCheckIn,
  as: 'checkIns',
  attributes: ['checkInDate', 'numericValue', 'note', 'createdAt', 'updatedAt'],
  required: false,
};

const habitCheckInInclude = {
  model: HabitCheckIn,
  as: 'checkIns',
  attributes: ['checkInDate', 'createdAt', 'updatedAt'],
  required: false,
};

const hydratePlanCheckIns = plan => {
  if (!plan) return plan;
  const checkIns = [...(plan.checkIns || [])].sort((a, b) =>
    String(a.checkInDate).localeCompare(String(b.checkInDate)),
  );
  plan.setDataValue(
    'completedDate',
    checkIns.map(checkIn => String(checkIn.checkInDate)),
  );
  plan.setDataValue(
    'checkInRecords',
    checkIns.map(checkIn => ({
      date: String(checkIn.checkInDate),
      numericValue:
        checkIn.numericValue === null ? null : Number(checkIn.numericValue),
      note: checkIn.note,
    })),
  );
  return plan;
};

const hydrateHabitCheckIns = (habit, date = toDateString(new Date())) => {
  if (!habit) return habit;
  const checkInDates = [...(habit.checkIns || [])]
    .map(checkIn => String(checkIn.checkInDate))
    .sort();
  habit.setDataValue('checkInDates', checkInDates);
  habit.setDataValue('isCompleted', checkInDates.includes(date));
  habit.setDataValue('scheduledToday', isHabitScheduledForDate(habit, date));
  habit.setDataValue(
    'currentStreak',
    calculateHabitStreak(habit, checkInDates),
  );
  return habit;
};

const buildDateRange = (year, month) => {
  const yearInt = Number(year);
  const monthInt = Number(month);
  const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
  const prefix = `${yearInt}-${String(monthInt).padStart(2, '0')}`;
  return {
    yearInt,
    monthInt,
    daysInMonth,
    startDate: `${prefix}-01`,
    endDate: `${prefix}-${String(daysInMonth).padStart(2, '0')}`,
  };
};

class Database {
  async getUserByPhone(phone) {
    return User.findOne({ where: { phone } });
  }

  async getUserByUserId(userId) {
    return User.findOne({ where: { userId } });
  }

  async addUser(userData) {
    return User.create({
      username: userData.username,
      phone: userData.phone,
      password: userData.password,
      goalTags: userData.goalTags || ['自律'],
    });
  }

  async updateUser(id, userData) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('用户不存在');
    await user.update(userData);
    return user;
  }

  async updateUserByUserId(userId, userData) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    await user.update(userData);
    return user;
  }

  async getUserSettingsByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    const [settings] = await UserSetting.findOrCreate({
      where: { userId: user.id },
      defaults: { theme: 'light' },
    });
    if (settings.theme !== 'light') await settings.update({ theme: 'light' });
    return settings;
  }

  async updateUserSettingsByUserId(userId, updates) {
    const settings = await this.getUserSettingsByUserId(userId);
    await settings.update({ ...updates, theme: 'light' });
    return settings;
  }

  async clearUserDataByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');

    return User.sequelize.transaction(async transaction => {
      const [ownedMoments, likedMoments, commentedMoments] = await Promise.all([
        CircleMoment.findAll({
          where: { authorId: user.id },
          attributes: ['id'],
          transaction,
        }),
        Like.findAll({
          where: { userId: user.userId },
          attributes: ['momentId'],
          transaction,
        }),
        Comment.findAll({
          where: { userId: user.id },
          attributes: ['id', 'momentId'],
          transaction,
        }),
      ]);
      const ownedMomentIds = ownedMoments.map(moment => moment.id);
      const commentsOnOwnedMoments = ownedMomentIds.length
        ? await Comment.findAll({
            where: { momentId: { [Op.in]: ownedMomentIds } },
            attributes: ['id'],
            transaction,
          })
        : [];
      const ownedIds = new Set(ownedMomentIds.map(String));
      const ownedCommentIds = [
        ...new Set(
          [...commentedMoments, ...commentsOnOwnedMoments].map(
            comment => comment.id,
          ),
        ),
      ];
      const affectedMomentIds = [
        ...new Set(
          [...likedMoments, ...commentedMoments]
            .map(item => String(item.momentId))
            .filter(id => !ownedIds.has(id)),
        ),
      ];

      await Notification.destroy({
        where: { [Op.or]: [{ userId: user.id }, { senderId: user.id }] },
        transaction,
      });
      await Like.destroy({ where: { userId: user.userId }, transaction });
      await Collect.destroy({ where: { userId: user.userId }, transaction });
      await Follow.destroy({
        where: { [Op.or]: [{ userId }, { followingId: userId }] },
        transaction,
      });
      await BuddyRelationship.destroy({
        where: {
          [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
        },
        transaction,
      });
      await UserBlock.destroy({
        where: { [Op.or]: [{ blockerId: userId }, { blockedId: userId }] },
        transaction,
      });
      await ContentReport.destroy({
        where: {
          [Op.or]: [
            { reporterId: userId },
            ...(ownedMomentIds.length
              ? [
                  {
                    targetType: 'moment',
                    targetId: { [Op.in]: ownedMomentIds },
                  },
                ]
              : []),
            ...(ownedCommentIds.length
              ? [
                  {
                    targetType: 'comment',
                    targetId: { [Op.in]: ownedCommentIds },
                  },
                ]
              : []),
          ],
        },
        transaction,
      });
      await Comment.destroy({ where: { userId: user.id }, transaction });
      await CircleMoment.destroy({ where: { authorId: user.id }, transaction });
      await Plan.destroy({ where: { userId: user.id }, transaction });
      await Habit.destroy({ where: { userId: user.id }, transaction });
      await Badge.destroy({ where: { userId: user.id }, transaction });
      await UserSetting.destroy({ where: { userId: user.id }, transaction });
      await Feedback.destroy({ where: { userId: user.id }, transaction });

      for (const momentId of affectedMomentIds) {
        const [likesCount, commentsCount] = await Promise.all([
          Like.count({ where: { momentId }, transaction }),
          Comment.count({ where: { momentId }, transaction }),
        ]);
        await CircleMoment.update(
          { likesCount, commentsCount },
          { where: { id: momentId }, transaction },
        );
      }
      return true;
    });
  }

  async getActivityHistoryByUserId(userId, limit = 100) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    const [planRecords, habitRecords] = await Promise.all([
      PlanCheckIn.findAll({
        include: [
          {
            model: Plan,
            as: 'plan',
            required: true,
            where: { userId: user.id },
            attributes: ['id', 'title', 'type'],
          },
        ],
        order: [
          ['checkInDate', 'DESC'],
          ['updatedAt', 'DESC'],
        ],
        limit,
      }),
      HabitCheckIn.findAll({
        include: [
          {
            model: Habit,
            as: 'habit',
            required: true,
            where: { userId: user.id },
            attributes: ['id', 'title'],
          },
        ],
        order: [
          ['checkInDate', 'DESC'],
          ['updatedAt', 'DESC'],
        ],
        limit,
      }),
    ]);

    return [
      ...planRecords.map(record => ({
        id: `plan-${record.id}`,
        type: 'plan',
        itemId: String(record.plan.id),
        title: record.plan.title,
        checkInType: record.plan.type,
        date: String(record.checkInDate),
        numericValue:
          record.numericValue === null ? null : Number(record.numericValue),
        note: record.note,
        updatedAt: record.updatedAt,
      })),
      ...habitRecords.map(record => ({
        id: `habit-${record.id}`,
        type: 'habit',
        itemId: String(record.habit.id),
        title: record.habit.title,
        checkInType: 'habit',
        date: String(record.checkInDate),
        numericValue: null,
        note: null,
        updatedAt: record.updatedAt,
      })),
    ]
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, limit)
      .map(({ updatedAt, ...record }) => record);
  }

  async getUserStatsByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    const [
      plans,
      habits,
      momentsCount,
      likesCount,
      collectsCount,
      followingCount,
      buddiesCount,
    ] = await Promise.all([
      Plan.findAll({
        where: { userId: user.id },
        attributes: ['id', 'status'],
      }),
      Habit.findAll({
        where: { userId: user.id },
        attributes: ['id', 'isActive'],
      }),
      CircleMoment.count({ where: { authorId: user.id } }),
      Like.count({ where: { userId } }),
      Collect.count({ where: { userId } }),
      Follow.count({ where: { userId } }),
      BuddyRelationship.count({
        where: {
          status: 'accepted',
          [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
        },
      }),
    ]);
    const planIds = plans.map(plan => plan.id);
    const habitIds = habits.map(habit => habit.id);
    const [planCheckIns, habitCheckIns] = await Promise.all([
      planIds.length
        ? PlanCheckIn.findAll({ where: { planId: { [Op.in]: planIds } } })
        : [],
      habitIds.length
        ? HabitCheckIn.findAll({ where: { habitId: { [Op.in]: habitIds } } })
        : [],
    ]);
    const dates = [...planCheckIns, ...habitCheckIns].map(record =>
      String(record.checkInDate),
    );

    return {
      streakDays: calculateCurrentStreak([...new Set(dates)]),
      totalCheckIns: dates.length,
      healingPlans: plans.filter(plan => plan.status !== 'archived').length,
      totalHabits: habits.filter(habit => habit.isActive).length,
      totalPlans: plans.length,
      checkInRecords: await this.getActivityHistoryByUserId(userId),
      socialStats: {
        moments: momentsCount,
        likes: likesCount,
        collects: collectsCount,
        friends: followingCount,
        buddies: buddiesCount,
      },
    };
  }

  async getCalendarMonthDataByUserId(userId, year, month) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];
    const { yearInt, monthInt, daysInMonth, startDate, endDate } =
      buildDateRange(year, month);
    const [planCheckIns, habitCheckIns] = await Promise.all([
      PlanCheckIn.findAll({
        where: { checkInDate: { [Op.between]: [startDate, endDate] } },
        attributes: ['planId', 'checkInDate'],
        include: [
          {
            model: Plan,
            as: 'plan',
            attributes: [],
            required: true,
            where: { userId: user.id },
          },
        ],
      }),
      HabitCheckIn.findAll({
        where: { checkInDate: { [Op.between]: [startDate, endDate] } },
        attributes: ['habitId', 'checkInDate'],
        include: [
          {
            model: Habit,
            as: 'habit',
            attributes: [],
            required: true,
            where: { userId: user.id },
          },
        ],
      }),
    ]);
    const byDate = new Map();
    for (const record of planCheckIns) {
      const date = String(record.checkInDate);
      const current = byDate.get(date) || { planIds: [], habitIds: [] };
      current.planIds.push(String(record.planId));
      byDate.set(date, current);
    }
    for (const record of habitCheckIns) {
      const date = String(record.checkInDate);
      const current = byDate.get(date) || { planIds: [], habitIds: [] };
      current.habitIds.push(String(record.habitId));
      byDate.set(date, current);
    }
    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === yearInt && now.getMonth() + 1 === monthInt;

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`;
      const activity = byDate.get(date) || { planIds: [], habitIds: [] };
      const activityCount = activity.planIds.length + activity.habitIds.length;
      return {
        day,
        date,
        hasActivity: activityCount > 0,
        isToday: isCurrentMonth && now.getDate() === day,
        isSelected: false,
        activityType:
          activity.planIds.length && activity.habitIds.length
            ? 'tertiary'
            : activity.habitIds.length
            ? 'secondary'
            : activity.planIds.length
            ? 'primary'
            : undefined,
        completedPlanIds: activity.planIds,
        completedHabitIds: activity.habitIds,
        activityCount,
      };
    });
  }

  async getNotificationsByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];
    const notifications = await Notification.findAll({
      where: { userId: user.id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['userId', 'username', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return notifications.map(notification => {
      const data = notification.toJSON();
      return {
        ...data,
        id: String(data.id),
        senderId: data.senderId == null ? null : String(data.senderId),
        targetId: data.targetId == null ? null : String(data.targetId),
      };
    });
  }

  async markNotificationAsRead(userId, notificationId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    const notification = await Notification.findOne({
      where: { id: notificationId, userId: user.id },
    });
    if (!notification) throw new Error('未找到通知');
    await notification.update({ read: true });
    return true;
  }

  async markAllNotificationsAsRead(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    await Notification.update({ read: true }, { where: { userId: user.id } });
    return true;
  }

  async deleteNotification(userId, notificationId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    const deleted = await Notification.destroy({
      where: { id: notificationId, userId: user.id },
    });
    if (!deleted) throw new Error('未找到通知');
    return true;
  }

  async getBadgesByUserId(userId) {
    const achievementService = require('../services/achievementService');
    const stats = await this.getUserStatsByUserId(userId);
    return achievementService.getUserAchievements(userId, stats);
  }

  async getCheckInCounts(userId, startDate, endDate) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return new Map();
    const [planCheckIns, habitCheckIns] = await Promise.all([
      PlanCheckIn.findAll({
        where: { checkInDate: { [Op.between]: [startDate, endDate] } },
        attributes: ['checkInDate'],
        include: [
          {
            model: Plan,
            as: 'plan',
            attributes: [],
            required: true,
            where: { userId: user.id },
          },
        ],
      }),
      HabitCheckIn.findAll({
        where: { checkInDate: { [Op.between]: [startDate, endDate] } },
        attributes: ['checkInDate'],
        include: [
          {
            model: Habit,
            as: 'habit',
            attributes: [],
            required: true,
            where: { userId: user.id },
          },
        ],
      }),
    ]);
    return [...planCheckIns, ...habitCheckIns].reduce((counts, record) => {
      const date = String(record.checkInDate);
      counts.set(date, (counts.get(date) || 0) + 1);
      return counts;
    }, new Map());
  }

  async getWeekRhythmDataByUserId(userId) {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(
      today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1),
    );
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const counts = await this.getCheckInCounts(
      userId,
      toDateString(monday),
      toDateString(sunday),
    );
    return ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(
      (label, index) => {
        const target = new Date(monday);
        target.setDate(monday.getDate() + index);
        const count = counts.get(toDateString(target)) || 0;
        return { date: label, value: count ? Math.min(100, count * 50) : 0 };
      },
    );
  }

  async getMonthRhythmDataByUserId(userId) {
    const now = new Date();
    const { yearInt, monthInt, daysInMonth, startDate, endDate } =
      buildDateRange(now.getFullYear(), now.getMonth() + 1);
    const counts = await this.getCheckInCounts(userId, startDate, endDate);
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`;
      const count = counts.get(date) || 0;
      return {
        date: String(day),
        value: count ? Math.min(100, count * 50) : 0,
      };
    });
  }

  async getPlansByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];
    const plans = await Plan.findAll({
      where: { userId: user.id },
      include: [planCheckInInclude],
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    return plans.map(hydratePlanCheckIns);
  }

  async getPlanById(id) {
    return hydratePlanCheckIns(
      await Plan.findByPk(id, { include: [planCheckInInclude] }),
    );
  }

  async createPlan(planData) {
    const user = await User.findOne({ where: { userId: planData.userId } });
    if (!user) throw new Error('用户不存在');
    return Plan.sequelize.transaction(async transaction => {
      await Plan.increment('sortOrder', {
        by: 1,
        where: { userId: user.id },
        transaction,
      });
      const plan = await Plan.create(
        { ...planData, userId: user.id, sortOrder: 0, status: 'active' },
        { transaction },
      );
      return hydratePlanCheckIns(
        await Plan.findByPk(plan.id, {
          include: [planCheckInInclude],
          transaction,
        }),
      );
    });
  }

  async updatePlan(id, updates) {
    return Plan.sequelize.transaction(async transaction => {
      const plan = await Plan.findByPk(id, { transaction, lock: true });
      if (!plan) throw new Error('计划不存在');
      const nextUpdates = { ...updates };
      delete nextUpdates.completedDate;
      delete nextUpdates.checkInRecords;
      await plan.update(nextUpdates, { transaction });
      return hydratePlanCheckIns(
        await Plan.findByPk(id, {
          include: [planCheckInInclude],
          transaction,
        }),
      );
    });
  }

  async checkInPlan(id, checkInDate, details = {}) {
    const dateError = getCheckInDateError(checkInDate);
    if (dateError) throw new Error(dateError);
    return Plan.sequelize.transaction(async transaction => {
      const plan = await Plan.findByPk(id, { transaction, lock: true });
      if (!plan) throw new Error('计划不存在');
      if (plan.status !== 'active') throw new Error('暂停或归档的计划不能打卡');
      const [record, created] = await PlanCheckIn.findOrCreate({
        where: { planId: plan.id, checkInDate },
        defaults: {
          numericValue: details.numericValue ?? null,
          note: details.note?.trim() || null,
        },
        transaction,
      });
      if (
        !created &&
        (details.numericValue !== undefined || details.note !== undefined)
      ) {
        await record.update(
          {
            numericValue: details.numericValue ?? record.numericValue,
            note:
              details.note === undefined
                ? record.note
                : details.note.trim() || null,
          },
          { transaction },
        );
      }
      return {
        plan: hydratePlanCheckIns(
          await Plan.findByPk(id, {
            include: [planCheckInInclude],
            transaction,
          }),
        ),
        created,
      };
    });
  }

  async deletePlanCheckIn(id, checkInDate) {
    const dateError = getCheckInDateError(checkInDate);
    if (dateError) throw new Error(dateError);
    const deleted = await PlanCheckIn.destroy({
      where: { planId: id, checkInDate },
    });
    if (!deleted) throw new Error('未找到打卡记录');
    return this.getPlanById(id);
  }

  async deletePlan(id) {
    const plan = await Plan.findByPk(id);
    if (!plan) throw new Error('计划不存在');
    await plan.destroy();
    return true;
  }

  async reorderPlans(userId, planIds) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    return Plan.sequelize.transaction(async transaction => {
      const plans = await Plan.findAll({
        where: { userId: user.id },
        attributes: ['id'],
        transaction,
        lock: true,
      });
      const ownedIds = new Set(plans.map(plan => String(plan.id)));
      if (
        planIds.length !== ownedIds.size ||
        planIds.some(id => !ownedIds.has(String(id)))
      ) {
        throw new Error('计划排序列表不完整或包含无权操作的计划');
      }
      await Promise.all(
        planIds.map((id, sortOrder) =>
          Plan.update(
            { sortOrder },
            { where: { id, userId: user.id }, transaction },
          ),
        ),
      );
      return true;
    });
  }

  async getHabitsByUserId(userId, date = toDateString(new Date())) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];
    const habits = await Habit.findAll({
      where: { userId: user.id },
      include: [habitCheckInInclude],
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    return habits.map(habit => hydrateHabitCheckIns(habit, date));
  }

  async getHabitById(id, date = toDateString(new Date())) {
    return hydrateHabitCheckIns(
      await Habit.findByPk(id, { include: [habitCheckInInclude] }),
      date,
    );
  }

  async createHabit(habitData) {
    const user = await User.findOne({ where: { userId: habitData.userId } });
    if (!user) throw new Error('用户不存在');
    return Habit.sequelize.transaction(async transaction => {
      await Habit.increment('sortOrder', {
        by: 1,
        where: { userId: user.id },
        transaction,
      });
      const habit = await Habit.create(
        { ...habitData, userId: user.id, sortOrder: 0 },
        { transaction },
      );
      return hydrateHabitCheckIns(
        await Habit.findByPk(habit.id, {
          include: [habitCheckInInclude],
          transaction,
        }),
      );
    });
  }

  async updateHabit(id, updates) {
    const habit = await Habit.findByPk(id);
    if (!habit) throw new Error('习惯不存在');
    await habit.update(updates);
    return this.getHabitById(id);
  }

  async checkInHabit(id, date) {
    const dateError = getCheckInDateError(date);
    if (dateError) throw new Error(dateError);
    const habit = await Habit.findByPk(id);
    if (!habit) throw new Error('习惯不存在');
    if (!isHabitScheduledForDate(habit, date)) {
      throw new Error(
        habit.isActive ? '该日期不在习惯重复计划内' : '已停用的习惯不能打卡',
      );
    }
    await HabitCheckIn.findOrCreate({
      where: { habitId: habit.id, checkInDate: date },
    });
    return this.getHabitById(id, date);
  }

  async deleteHabitCheckIn(id, date) {
    const dateError = getCheckInDateError(date);
    if (dateError) throw new Error(dateError);
    const deleted = await HabitCheckIn.destroy({
      where: { habitId: id, checkInDate: date },
    });
    if (!deleted) throw new Error('未找到习惯打卡记录');
    return this.getHabitById(id, date);
  }

  async reorderHabits(userId, habitIds) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    return Habit.sequelize.transaction(async transaction => {
      const habits = await Habit.findAll({
        where: { userId: user.id },
        attributes: ['id'],
        transaction,
        lock: true,
      });
      const ownedIds = new Set(habits.map(habit => String(habit.id)));
      if (
        habitIds.length !== ownedIds.size ||
        habitIds.some(id => !ownedIds.has(String(id)))
      ) {
        throw new Error('习惯排序列表不完整或包含无权操作的习惯');
      }
      await Promise.all(
        habitIds.map((id, sortOrder) =>
          Habit.update(
            { sortOrder },
            { where: { id, userId: user.id }, transaction },
          ),
        ),
      );
      return true;
    });
  }

  async deleteHabit(id) {
    const habit = await Habit.findByPk(id);
    if (!habit) throw new Error('习惯不存在');
    await habit.destroy();
    return true;
  }
}

module.exports = new Database();
