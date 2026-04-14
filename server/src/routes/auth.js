const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../data/database');
const { generateToken, authMiddleware } = require('../middleware/auth');

// 登录接口
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      error: '手机号和密码不能为空',
    });
  }

  try {
    const user = await db.getUserByPhone(phone);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '手机号或密码错误',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '手机号或密码错误',
      });
    }

    const token = generateToken(user.userId);

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.userId,
          username: user.username,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio,
        },
      },
      message: '登录成功',
    });
  } catch (error) {
    console.error('登录失败:', error);
    return res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试',
    });
  }
});

// 注册接口
router.post('/register', async (req, res) => {
  const { username, phone, password, confirmPassword } = req.body;

  if (!username || !phone || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      error: '所有字段不能为空',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: '两次输入的密码不一致',
    });
  }

  try {
    const existingUser = await db.getUserByPhone(phone);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: '该手机号已注册',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.addUser({
      username,
      phone,
      password: hashedPassword,
    });

    const token = generateToken(newUser.userId);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.userId,
          username: newUser.username,
          phone: newUser.phone,
          avatar: newUser.avatar,
          bio: newUser.bio,
        },
      },
      message: '注册成功',
    });
  } catch (error) {
    console.error('注册失败:', error);
    return res.status(500).json({
      success: false,
      error: '注册失败，请稍后重试',
    });
  }
});

// 获取当前用户信息接口（需要认证）
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.getUserByUserId(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.userId,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取用户信息失败，请稍后重试',
    });
  }
});

// 更新用户资料接口（需要认证）
router.put('/me', authMiddleware, async (req, res) => {
  const { username, avatar, bio } = req.body;

  if (!username) {
    return res.status(400).json({
      success: false,
      error: '用户名不能为空',
    });
  }

  try {
    const updatedUser = await db.updateUserByUserId(req.userId, {
      username,
      avatar,
      bio,
    });

    return res.json({
      success: true,
      data: {
        id: updatedUser.userId,
        username: updatedUser.username,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
      },
      message: '资料更新成功',
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    return res.status(500).json({
      success: false,
      error: '更新失败，请稍后重试',
    });
  }
});

// 获取当前用户统计信息接口（需要认证）
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await db.getUserStatsByUserId(req.userId);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取用户统计失败，请稍后重试',
    });
  }
});

// 兼容旧接口：根据ID获取用户信息
router.get('/user', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: '用户ID不能为空',
    });
  }

  try {
    const user = await db.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return res.status(500).json({
      success: false,
      error: '获取用户信息失败，请稍后重试',
    });
  }
});

// 关注某人
router.post('/follow/:targetUserId', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    if (req.userId === targetUserId) {
      return res.status(400).json({ success: false, error: '不能关注你自己' });
    }

    const { Friendship } = require('../models');
    await Friendship.findOrCreate({
      where: { userId: req.userId, friendId: targetUserId },
    });

    res.json({ success: true, message: '关注成功' });
  } catch (error) {
    console.error('关注失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// 取消关注某人
router.delete('/follow/:targetUserId', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const { Friendship } = require('../models');

    await Friendship.destroy({
      where: { userId: req.userId, friendId: targetUserId },
    });

    res.json({ success: true, message: '取消关注成功' });
  } catch (error) {
    console.error('取消关注失败:', error);
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

module.exports = router;
