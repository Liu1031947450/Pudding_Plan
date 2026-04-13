const express = require('express');
const router = express.Router();
const db = require('../data/database');

// 登录接口
router.post('/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.json({
      success: false,
      error: '手机号和密码不能为空',
    });
  }

  // 验证用户
  const user = db.getUserByPhone(phone);
  if (!user) {
    return res.json({
      success: false,
      error: '用户不存在，请先注册',
    });
  }

  // 验证密码
  if (user.password !== password) {
    return res.json({
      success: false,
      error: '密码错误',
    });
  }

  // 登录成功
  return res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      phone: user.phone,
    },
    message: '登录成功',
  });
});

// 注册接口
router.post('/register', (req, res) => {
  const { username, phone, password, confirmPassword } = req.body;

  if (!username || !phone || !password || !confirmPassword) {
    return res.json({
      success: false,
      error: '所有字段不能为空',
    });
  }

  if (password !== confirmPassword) {
    return res.json({
      success: false,
      error: '两次输入的密码不一致',
    });
  }

  // 检查用户是否已存在
  const existingUser = db.getUserByPhone(phone);
  if (existingUser) {
    return res.json({
      success: false,
      error: '该手机号已注册',
    });
  }

  // 创建新用户
  const newUser = db.addUser({
    username,
    phone,
    password,
  });

  return res.json({
    success: true,
    data: {
      id: newUser.id,
      username: newUser.username,
      phone: newUser.phone,
    },
    message: '注册成功',
  });
});

// 获取用户信息接口
router.get('/user', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.json({
      success: false,
      error: '用户ID不能为空',
    });
  }

  const user = db.getUserById(id);
  if (!user) {
    return res.json({
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
});

module.exports = router;