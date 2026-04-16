const { Badge, User, Notification } = require('../models');
const ACHIEVEMENTS = require('../constants/achievements');
const { getIO, connectedUsers } = require('../utils/socketManager');

class AchievementService {
  /**
   * 获取用户完整的成就列表（包含已解锁和未解锁）
   * @param {string} userId UUID
   * @param {object} stats 用户实时统计数据
   */
  async getUserAchievements(userId, stats) {
    // 确保 stats 对象存在且具有基本结构
    const safeStats = {
      streakDays: 0,
      totalCheckIns: 0,
      healingPlans: 0,
      socialStats: { moments: 0, likes: 0, collects: 0, friends: 0 },
      ...stats,
    };

    // 尝试查找用户
    let user = null;
    if (userId) {
      user = await User.findOne({ where: { userId } });
      if (!user && !isNaN(Number(userId))) {
        user = await User.findByPk(userId);
      }
    }

    // 获取数据库中存储的解锁记录（即使查询失败也不影响标准列表返回）
    const badgeMap = new Map();
    if (user) {
      try {
        const userBadges = await Badge.findAll({
          where: { userId: user.id },
          attributes: [
            'id',
            'userId',
            'badgeKey',
            'unlocked',
            'createdAt',
            'updatedAt',
          ],
        });
        userBadges.forEach(b => badgeMap.set(b.badgeKey, b));
      } catch (dbErr) {
        console.error(
          '[Achievement] 查询用户徽章记录失败（可能是表结构不匹配）:',
          dbErr.message,
        );
      }
    }

    // 合并标准库与用户状态
    const results = ACHIEVEMENTS.map(standard => {
      const userRecord = badgeMap.get(standard.key);
      const isUnlockedInDb = userRecord ? userRecord.unlocked : false;

      let progress = 0;
      let meetsRequirement = false;

      try {
        progress = standard.getProgress ? standard.getProgress(safeStats) : 0;
        meetsRequirement = standard.requirement
          ? standard.requirement(safeStats)
          : false;
      } catch (err) {
        console.error(`[Achievement] 计算成就 ${standard.key} 进度失败:`, err);
      }

      return {
        id: standard.key,
        badgeKey: standard.key,
        title: standard.title,
        description: standard.description,
        icon: standard.icon,
        color: standard.color,
        unlocked: isUnlockedInDb || meetsRequirement,
        unlockedAt: userRecord ? userRecord.unlockedAt : null,
        progress: typeof progress === 'number' ? progress : 0,
        target: standard.target || 0,
        percentage:
          standard.target && standard.target > 0
            ? Math.min(100, (Number(progress || 0) / standard.target) * 100)
            : 0,
      };
    });

    return results;
  }

  /**
   * 检查并执行成就解锁，同时发送通知
   * @param {string} userId UUID
   * @param {object} stats 用户实时统计数据
   */
  async checkAndUnlockAchievements(userId, stats) {
    const user = await User.findOne({ where: { userId } });
    if (!user) return [];

    const newlyUnlocked = []; // { key, title, description, icon, color }

    for (const standard of ACHIEVEMENTS) {
      try {
        if (standard.requirement(stats)) {
          const [badge, created] = await Badge.findOrCreate({
            where: { userId: user.id, badgeKey: standard.key },
            defaults: {
              unlocked: true,
              unlockedAt: new Date(),
            },
          });

          if (created) {
            newlyUnlocked.push(standard);
          } else if (!badge.unlocked) {
            await badge.update({
              unlocked: true,
              unlockedAt: new Date(),
            });
            newlyUnlocked.push(standard);
          }
        }
      } catch (err) {
        console.error(
          `[Achievement] 检查成就 ${standard.key} 时出错:`,
          err.message,
        );
      }
    }

    // 为每个新解锁的成就发送通知
    for (const achievement of newlyUnlocked) {
      await this._sendAchievementNotification(user, achievement);
    }

    return newlyUnlocked.map(a => a.key);
  }

  /**
   * 创建成就解锁通知并通过 WebSocket 实时推送
   */
  async _sendAchievementNotification(user, achievement) {
    try {
      const notification = await Notification.create({
        userId: user.id,
        type: 'achievement',
        title: '🎉 新成就解锁！',
        message: `恭喜你获得了「${achievement.title}」徽章 — ${achievement.description}`,
        read: false,
      });

      console.log(
        `[Achievement] 通知已创建: 用户 ${user.username} 解锁「${achievement.title}」`,
      );

      // 通过 WebSocket 实时推送
      const socketId = connectedUsers.get(user.userId);
      if (socketId) {
        const io = getIO();
        if (io) {
          const payload = {
            id: String(notification.id),
            type: 'achievement',
            title: notification.title,
            message: notification.message,
            time: '刚刚',
            read: false,
          };
          io.to(socketId).emit('new_notification', payload);
          console.log(`[Achievement] 实时推送已发送给 ${user.username}`);
        }
      }
    } catch (err) {
      console.error(`[Achievement] 发送成就通知失败:`, err.message);
    }
  }
}

module.exports = new AchievementService();
