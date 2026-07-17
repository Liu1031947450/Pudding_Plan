const {
  User,
  Plan,
  PlanCheckIn,
  Habit,
  Notification,
  CircleMoment,
  Like,
  Collect,
  Friendship,
  UserSetting,
  Badge,
  Comment,
  Feedback,
} = require('../models');
const { Op } = require('sequelize');
const { mockNotifications } = require('./mockData/notificationData');
const {
  calculateCurrentStreak,
  isValidDateString,
  toDateString,
} = require('../utils/checkInUtils');

const checkInInclude = {
  model: PlanCheckIn,
  as: 'checkIns',
  attributes: ['checkInDate', 'numericValue', 'note'],
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

class Database {
  // 用户相关方法
  async getUserByPhone(phone) {
    return await User.findOne({ where: { phone } });
  }

  async getUserByUserId(userId) {
    return await User.findOne({ where: { userId } });
  }

  async addUser(userData) {
    const newUser = await User.create({
      username: userData.username,
      phone: userData.phone,
      password: userData.password,
    });
    return newUser;
  }

  async updateUser(id, userData) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('用户不存在');
    }
    await user.update(userData);
    return user;
  }

  async updateUserByUserId(userId, userData) {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('用户不存在');
    }
    await user.update(userData);
    return user;
  }

  async getUserSettingsByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');
    const [settings] = await UserSetting.findOrCreate({
      where: { userId: user.id },
    });
    return settings;
  }

  async updateUserSettingsByUserId(userId, updates) {
    const settings = await this.getUserSettingsByUserId(userId);
    await settings.update(updates);
    return settings;
  }

  async clearUserDataByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');

    return await User.sequelize.transaction(async transaction => {
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
          attributes: ['momentId'],
          transaction,
        }),
      ]);
      const ownedIds = new Set(ownedMoments.map(moment => String(moment.id)));
      const affectedMomentIds = [
        ...new Set(
          [...likedMoments, ...commentedMoments]
            .map(item => String(item.momentId))
            .filter(id => !ownedIds.has(id)),
        ),
      ];

      await Notification.destroy({
        where: {
          [Op.or]: [{ userId: user.id }, { senderId: user.id }],
        },
        transaction,
      });
      await Like.destroy({ where: { userId: user.userId }, transaction });
      await Collect.destroy({ where: { userId: user.userId }, transaction });
      await Friendship.destroy({
        where: {
          [Op.or]: [{ userId: user.userId }, { friendId: user.userId }],
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

  async getUserStatsByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const [
      plans,
      habits,
      momentsCount,
      likesCount,
      collectsCount,
      friendsCount,
    ] = await Promise.all([
      Plan.findAll({
        where: { userId: user.id },
        attributes: ['id', 'title'],
      }),
      Habit.findAll({ where: { userId: user.id } }),
      CircleMoment.count({ where: { authorId: user.id } }),
      Like.count({ where: { userId: user.userId } }),
      Collect.count({ where: { userId: user.userId } }),
      Friendship.count({ where: { userId: user.userId } }),
    ]);

    const planIds = plans.map(plan => plan.id);
    const checkIns = planIds.length
      ? await PlanCheckIn.findAll({
          where: { planId: { [Op.in]: planIds } },
          attributes: ['planId', 'checkInDate'],
          order: [['checkInDate', 'DESC']],
        })
      : [];
    const planTitleById = new Map(
      plans.map(plan => [String(plan.id), plan.title]),
    );
    const allCheckInDates = checkIns.map(checkIn =>
      String(checkIn.checkInDate),
    );
    const uniqueCheckInDates = [...new Set(allCheckInDates)].sort();

    const totalCheckIns = allCheckInDates.length;
    const streakDays = calculateCurrentStreak(uniqueCheckInDates);
    const healingPlans = plans.length;
    const totalHabits = habits.length;

    const checkInRecords = uniqueCheckInDates
      .slice()
      .reverse()
      .map(date => ({
        date,
        planTitles: checkIns
          .filter(checkIn => String(checkIn.checkInDate) === date)
          .map(checkIn => planTitleById.get(String(checkIn.planId)))
          .filter(Boolean),
        count: checkIns.filter(checkIn => String(checkIn.checkInDate) === date)
          .length,
      }));

    return {
      streakDays,
      totalCheckIns,
      healingPlans,
      totalHabits,
      totalPlans: plans.length,
      checkInRecords,
      socialStats: {
        moments: momentsCount,
        likes: likesCount,
        collects: collectsCount,
        friends: friendsCount,
      },
    };
  }

  async getCalendarMonthDataByUserId(userId, year, month) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10);
    const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
    const startDate = `${yearInt}-${String(monthInt).padStart(2, '0')}-01`;
    const endDate = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(
      daysInMonth,
    ).padStart(2, '0')}`;
    const checkIns = await PlanCheckIn.findAll({
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
    });
    const planIdsByDate = new Map();
    for (const checkIn of checkIns) {
      const date = String(checkIn.checkInDate);
      const planIds = planIdsByDate.get(date) || [];
      planIds.push(String(checkIn.planId));
      planIdsByDate.set(date, planIds);
    }
    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === yearInt && now.getMonth() + 1 === monthInt;

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateStr = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`;
      const completedPlanIds = planIdsByDate.get(dateStr) || [];
      const hasActivity = completedPlanIds.length > 0;

      return {
        day,
        hasActivity,
        isToday: isCurrentMonth && now.getDate() === day,
        isSelected: false,
        activityType: hasActivity ? 'primary' : undefined,
        completedPlanIds,
      };
    });
  }

  async getNotificationsByUserId(userId) {
    console.log(`[Database] 开始查询通知: UserUUID: ${userId}`);
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      console.warn(`[Database] 未找到 UUID 为 ${userId} 的用户`);
      return [];
    }

    console.log(`[Database] 找到用户: ${user.username} (intID: ${user.id})`);

    let notifications = await Notification.findAll({
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

    console.log(
      `[Database] 用户 ${user.id} 共有 ${notifications.length} 条通知数据`,
    );

    if (notifications.length === 0) {
      const stats = await this.getUserStatsByUserId(userId);
      // 为演示目的提供初始消息
      await Notification.bulkCreate(
        mockNotifications.map(notification => ({
          userId: user.id,
          type: notification.type,
          title: notification.title,
          message:
            notification.type === 'achievement'
              ? `你已累计打卡 ${stats.streakDays} 天，继续加油！`
              : notification.message,
          time: notification.time,
          read: notification.read,
          senderId: null,
        })),
      );
      notifications = await Notification.findAll({
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
    }

    return notifications.map(n => n.toJSON());
  }

  async markNotificationAsRead(userId, notificationId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const notification = await Notification.findOne({
      where: { id: notificationId, userId: user.id },
    });
    if (!notification) {
      throw new Error('未找到通知');
    }

    await notification.update({ read: true });
    return true;
  }

  async markAllNotificationsAsRead(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    await Notification.update({ read: true }, { where: { userId: user.id } });
    return true;
  }

  async deleteNotification(userId, notificationId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const deleted = await Notification.destroy({
      where: { id: notificationId, userId: user.id },
    });
    if (!deleted) {
      throw new Error('未找到通知');
    }

    return true;
  }

  async getBadgesByUserId(userId) {
    const achievementService = require('../services/achievementService');
    const stats = await this.getUserStatsByUserId(userId);
    return await achievementService.getUserAchievements(userId, stats);
  }

  async getWeekRhythmDataByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    const today = new Date();
    const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const monday = new Date(today);
    const diff = today.getDay() === 0 ? 6 : today.getDay() - 1;
    monday.setDate(today.getDate() - diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const checkIns = await PlanCheckIn.findAll({
      where: {
        checkInDate: {
          [Op.between]: [toDateString(monday), toDateString(sunday)],
        },
      },
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
    });
    const counts = checkIns.reduce((result, checkIn) => {
      const date = String(checkIn.checkInDate);
      result.set(date, (result.get(date) || 0) + 1);
      return result;
    }, new Map());

    return weekLabels.map((label, index) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + index);
      const completedCount = counts.get(toDateString(targetDate)) || 0;
      return {
        date: label,
        value: completedCount > 0 ? Math.min(100, completedCount * 50) : 0,
      };
    });
  }

  async getMonthRhythmDataByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(
      daysInMonth,
    ).padStart(2, '0')}`;
    const checkIns = await PlanCheckIn.findAll({
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
    });
    const counts = checkIns.reduce((result, checkIn) => {
      const date = String(checkIn.checkInDate);
      result.set(date, (result.get(date) || 0) + 1);
      return result;
    }, new Map());

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`;
      const completedCount = counts.get(dateStr) || 0;
      return {
        date: `${day}`,
        value: completedCount > 0 ? Math.min(100, completedCount * 50) : 0,
      };
    });
  }

  // Plan 相关方法
  async getPlansByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];
    const plans = await Plan.findAll({
      where: { userId: user.id },
      include: [checkInInclude],
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    return plans.map(hydratePlanCheckIns);
  }

  async getPlanById(id) {
    const plan = await Plan.findByPk(id, { include: [checkInInclude] });
    return hydratePlanCheckIns(plan);
  }

  async createPlan(planData) {
    const user = await User.findOne({ where: { userId: planData.userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    return await Plan.sequelize.transaction(async transaction => {
      await Plan.increment('sortOrder', {
        by: 1,
        where: { userId: user.id },
        transaction,
      });
      const plan = await Plan.create(
        {
          ...planData,
          userId: user.id,
          sortOrder: 0,
          completedDate: [],
        },
        { transaction },
      );

      const created = await Plan.findByPk(plan.id, {
        include: [checkInInclude],
        transaction,
      });
      return hydratePlanCheckIns(created);
    });
  }

  async updatePlan(id, updates) {
    return await Plan.sequelize.transaction(async transaction => {
      const plan = await Plan.findByPk(id, { transaction, lock: true });
      if (!plan) {
        throw new Error('计划不存在');
      }

      const nextUpdates = { ...updates };
      delete nextUpdates.completedDate;
      delete nextUpdates.checkInRecords;

      await plan.update(nextUpdates, { transaction });
      const updated = await Plan.findByPk(id, {
        include: [checkInInclude],
        transaction,
      });
      return hydratePlanCheckIns(updated);
    });
  }

  async checkInPlan(id, checkInDate, details = {}) {
    if (!isValidDateString(checkInDate)) {
      throw new Error('打卡日期格式无效');
    }

    return await Plan.sequelize.transaction(async transaction => {
      const plan = await Plan.findByPk(id, { transaction, lock: true });
      if (!plan) throw new Error('计划不存在');

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

      const completedDate = [
        ...new Set([...(plan.completedDate || []), checkInDate]),
      ].sort();
      await plan.update({ completedDate }, { transaction });

      const updated = await Plan.findByPk(id, {
        include: [checkInInclude],
        transaction,
      });
      return { plan: hydratePlanCheckIns(updated), created };
    });
  }

  async deletePlan(id) {
    const plan = await Plan.findByPk(id);
    if (!plan) {
      throw new Error('计划不存在');
    }
    await plan.destroy();
    return true;
  }

  async reorderPlans(userId, planIds) {
    const user = await User.findOne({ where: { userId } });
    if (!user) throw new Error('用户不存在');

    return await Plan.sequelize.transaction(async transaction => {
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

  // Habit 相关方法
  async getHabitsByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];
    return await Habit.findAll({ where: { userId: user.id } });
  }

  async getHabitById(id) {
    return await Habit.findByPk(id);
  }

  async createHabit(habitData) {
    const user = await User.findOne({ where: { userId: habitData.userId } });
    if (!user) {
      throw new Error('用户不存在');
    }
    return await Habit.create({ ...habitData, userId: user.id });
  }

  async updateHabit(id, updates) {
    const habit = await Habit.findByPk(id);
    if (!habit) {
      throw new Error('习惯不存在');
    }
    await habit.update(updates);
    return habit;
  }

  async deleteHabit(id) {
    const habit = await Habit.findByPk(id);
    if (!habit) {
      throw new Error('习惯不存在');
    }
    await habit.destroy();
    return true;
  }
}

const db = new Database();

module.exports = db;
