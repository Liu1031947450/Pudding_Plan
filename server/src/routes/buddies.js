const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Op } = require('sequelize');

// 获取所有伙伴（作为推荐展示）
router.get('/', async (req, res) => {
  try {
    // 排除特定用户（如当前用户，这里简化为展示一部分真实存在的初始化用户）
    const users = await User.findAll({
      limit: 10,
      attributes: ['userId', 'username', 'avatar', 'bio'],
      where: {
        username: { [Op.not]: '布丁助手' },
      },
    });

    const data = users.map(u => ({
      id: u.userId,
      name: u.username,
      goal: u.bio || '暂无目标',
      avatarUri: u.avatar,
    }));

    res.json({
      success: true,
      data,
      message: '获取伙伴列表成功',
    });
  } catch (error) {
    console.error('获取伙伴列表失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

module.exports = router;
