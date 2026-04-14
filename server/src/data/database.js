const { User, Plan, Habit, Notification, Badge } = require('../models');
const { mockNotifications } = require('./mockData/notificationData');
const { mockBadges } = require('./mockData/badgeData');

class Database {
  // 用户相关方法
  async getUserByPhone(phone) {
    return await User.findOne({ where: { phone } });
  }

  async getUserById(id) {
    return await User.findByPk(id);
  }

  async getUserByUserId(userId) {
    return await User.findOne({ where: { userId } });
  }

  async addUser(userData) {
    const newUser = await User.create({
      username: userData.username,
      phone: userData.phone,
      password: userData.password
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

  async getUserStatsByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const plans = await Plan.findAll({ where: { userId: user.id } });
    const habits = await Habit.findAll({ where: { userId: user.id } });

    const totalCheckIns = plans.reduce((sum, plan) => {
      const completedDate = plan.completedDate || [];
      return sum + completedDate.length;
    }, 0);

    const streakDays = totalCheckIns;
    const healingPlans = plans.length;
    const totalHabits = habits.length;

    return {
      streakDays,
      totalCheckIns,
      healingPlans,
      totalHabits,
      totalPlans: plans.length,
    };
  }

  async getCalendarMonthDataByUserId(userId, year, month) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    const plans = await Plan.findAll({ where: { userId: user.id } });
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10);
    const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === yearInt && now.getMonth() + 1 === monthInt;

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateStr = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const completedPlanIds = plans
        .filter(plan => (plan.completedDate || []).includes(dateStr))
        .map(plan => String(plan.id));
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
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    let notifications = await Notification.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
    });

    if (notifications.length === 0) {
      const stats = await this.getUserStatsByUserId(userId);
      const seededNotifications = await Notification.bulkCreate(
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
        })),
      );
      notifications = seededNotifications;
    }

    return notifications.map(notification => notification.toJSON());
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
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    const stats = await this.getUserStatsByUserId(userId);
    let badges = await Badge.findAll({
      where: { userId: user.id },
      order: [['id', 'ASC']],
    });

    if (badges.length === 0) {
      const seededBadges = await Badge.bulkCreate(
        mockBadges.map(badge => ({
          userId: user.id,
          badgeKey: badge.id,
          title: badge.title,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          unlocked: false,
        })),
      );
      badges = seededBadges;
    }

    for (const badge of badges) {
      const unlocked =
        badge.badgeKey === '1'
          ? stats.streakDays >= 1
          : badge.badgeKey === '2'
            ? stats.streakDays >= 7
            : badge.badgeKey === '3'
              ? stats.healingPlans >= 1
              : stats.totalHabits >= 1;

      if (badge.unlocked !== unlocked) {
        await badge.update({ unlocked });
      }
    }

    const refreshedBadges = await Badge.findAll({
      where: { userId: user.id },
      order: [['id', 'ASC']],
    });
    return refreshedBadges.map(badge => badge.toJSON());
  }

  async getWeekRhythmDataByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    const plans = await Plan.findAll({ where: { userId: user.id } });
    const today = new Date();
    const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    return weekLabels.map((label, index) => {
      const targetDate = new Date(today);
      const diff = today.getDay() === 0 ? 6 : today.getDay() - 1;
      targetDate.setDate(today.getDate() - diff + index);
      const dateStr = targetDate.toISOString().split('T')[0];

      const completedCount = plans.filter(plan => (plan.completedDate || []).includes(dateStr)).length;
      return {
        date: label,
        value: completedCount > 0 ? Math.min(100, completedCount * 50) : 0,
      };
    });
  }

  async getMonthRhythmDataByUserId(userId) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    const plans = await Plan.findAll({ where: { userId: user.id } });
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const completedCount = plans.filter(plan => (plan.completedDate || []).includes(dateStr)).length;
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
    return await Plan.findAll({ where: { userId: user.id } });
  }

  async getPlanById(id) {
    return await Plan.findByPk(id);
  }

  async createPlan(planData) {
    const user = await User.findOne({ where: { userId: planData.userId } });
    if (!user) {
      throw new Error('用户不存在');
    }
    return await Plan.create({ ...planData, userId: user.id });
  }

  async updatePlan(id, updates) {
    const plan = await Plan.findByPk(id);
    if (!plan) {
      throw new Error('计划不存在');
    }
    await plan.update(updates);
    return plan;
  }

  async deletePlan(id) {
    const plan = await Plan.findByPk(id);
    if (!plan) {
      throw new Error('计划不存在');
    }
    await plan.destroy();
    return true;
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
