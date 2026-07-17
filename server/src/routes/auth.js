const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../data/database');
const { generateToken, authMiddleware } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const authKey = req => `${req.ip}:${String(req.body?.phone || '').trim()}`;
const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: authKey,
});
const registerRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  key: req => req.ip,
});

// 登录接口
router.post('/login', loginRateLimit, async (req, res) => {
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

    const token = generateToken(user.userId, user.tokenVersion);

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
router.post('/register', registerRateLimit, async (req, res) => {
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
  if (
    typeof username !== 'string' ||
    !username.trim() ||
    username.length > 50
  ) {
    return res.status(400).json({
      success: false,
      error: '用户名应为1至50个字符',
    });
  }
  if (!/^\d{11}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      error: '请输入有效的11位手机号',
    });
  }
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return res.status(400).json({
      success: false,
      error: '密码至少8位，且必须同时包含字母和数字',
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
      username: username.trim(),
      phone,
      password: hashedPassword,
    });

    const token = generateToken(newUser.userId, newUser.tokenVersion);

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

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await req.user.increment('tokenVersion');
    return res.json({ success: true, message: '已安全退出' });
  } catch (error) {
    console.error('退出登录失败:', error);
    return res.status(500).json({ success: false, error: '退出登录失败' });
  }
});

router.delete('/data', authMiddleware, async (req, res) => {
  try {
    await db.clearUserDataByUserId(req.userId);
    return res.json({ success: true, message: '所有个人数据已清除' });
  } catch (error) {
    console.error('清除用户数据失败:', error);
    return res.status(500).json({ success: false, error: '清除数据失败' });
  }
});

// 更新用户资料接口（需要认证）
router.put('/me', authMiddleware, async (req, res) => {
  const { username, avatar, bio } = req.body;

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    username.trim().length > 50
  ) {
    return res.status(400).json({
      success: false,
      error: '用户名应为1至50个字符',
    });
  }
  if (bio !== undefined && (typeof bio !== 'string' || bio.length > 500)) {
    return res
      .status(400)
      .json({ success: false, error: '个性签名不能超过500字' });
  }
  if (
    avatar !== undefined &&
    avatar !== null &&
    (typeof avatar !== 'string' || avatar.length > 1000)
  ) {
    return res.status(400).json({ success: false, error: '头像地址格式无效' });
  }

  try {
    const updatedUser = await db.updateUserByUserId(req.userId, {
      username: username.trim(),
      avatar,
      bio: typeof bio === 'string' ? bio.trim() : bio,
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
