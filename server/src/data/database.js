const { User, Plan, Habit } = require('../models');

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
