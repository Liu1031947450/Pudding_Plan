const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../data/database');
const { CircleMoment } = require('../models');
const { generateToken, authMiddleware } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');
const {
  uploadAvatar,
  validateImage,
  handleUploadError,
  getFileUrl,
} = require('../middleware/upload');
const { deleteUploadedFiles } = require('../utils/files');
const { ok, fail } = require('../utils/http');

const router = express.Router();
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

const serializeUser = user => ({
  id: user.userId,
  username: user.username,
  phone: user.phone,
  avatar: user.avatar,
  bio: user.bio,
  goalTags: user.goalTags || [],
});

const validatePassword = password =>
  typeof password === 'string' &&
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password);

const validateGoalTags = value =>
  Array.isArray(value) &&
  value.length >= 1 &&
  value.length <= 3 &&
  value.every(tag => typeof tag === 'string') &&
  new Set(value.map(tag => tag.trim())).size === value.length &&
  value.every(tag => tag.trim() && tag.trim().length <= 20);

const getOwnedFiles = async user => {
  const moments = await CircleMoment.findAll({
    where: { authorId: user.id },
    attributes: ['imageUri', 'images'],
  });
  return [
    user.avatar,
    ...moments.flatMap(moment => [moment.imageUri, ...(moment.images || [])]),
  ].filter(Boolean);
};

router.post('/login', loginRateLimit, async (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  const password = req.body?.password;
  if (!phone || !password) return fail(res, 400, '手机号和密码不能为空');
  try {
    const user = await db.getUserByPhone(phone);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return fail(res, 401, '手机号或密码错误');
    }
    ok(
      res,
      {
        token: generateToken(user.userId, user.tokenVersion),
        user: serializeUser(user),
      },
      '登录成功',
    );
  } catch (error) {
    console.error('登录失败:', error);
    fail(res, 500, '登录失败，请稍后重试');
  }
});

router.post('/register', registerRateLimit, async (req, res) => {
  const {
    username,
    phone,
    password,
    confirmPassword,
    acceptedTerms,
    goalTags,
  } = req.body || {};
  if (!username || !phone || !password || !confirmPassword)
    return fail(res, 400, '所有字段不能为空');
  if (acceptedTerms !== true)
    return fail(res, 400, '请先同意用户协议和隐私政策');
  if (password !== confirmPassword)
    return fail(res, 400, '两次输入的密码不一致');
  if (
    typeof username !== 'string' ||
    !username.trim() ||
    username.trim().length > 50
  ) {
    return fail(res, 400, '用户名应为1至50个字符');
  }
  if (!/^\d{11}$/.test(phone)) return fail(res, 400, '请输入有效的11位手机号');
  if (!validatePassword(password))
    return fail(res, 400, '密码至少8位，且必须同时包含字母和数字');
  if (goalTags !== undefined && !validateGoalTags(goalTags))
    return fail(res, 400, '目标标签需为1至3个不重复标签');
  try {
    if (await db.getUserByPhone(phone)) return fail(res, 409, '该手机号已注册');
    const user = await db.addUser({
      username: username.trim(),
      phone,
      password: await bcrypt.hash(password, 10),
      goalTags: goalTags?.map(tag => tag.trim()) || ['自律'],
    });
    ok(
      res,
      {
        token: generateToken(user.userId, user.tokenVersion),
        user: serializeUser(user),
      },
      '注册成功',
      201,
    );
  } catch (error) {
    console.error('注册失败:', error);
    fail(res, 500, '注册失败，请稍后重试');
  }
});

router.get('/me', authMiddleware, (req, res) =>
  ok(res, serializeUser(req.user), '获取用户信息成功'),
);

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await req.user.increment('tokenVersion');
    ok(res, null, '已安全退出');
  } catch (error) {
    console.error('退出登录失败:', error);
    fail(res, 500, '退出登录失败');
  }
});

router.delete('/data', authMiddleware, async (req, res) => {
  try {
    const files = await getOwnedFiles(req.user);
    await db.clearUserDataByUserId(req.userId);
    await deleteUploadedFiles(files);
    ok(res, null, '所有业务数据已清除');
  } catch (error) {
    console.error('清除用户数据失败:', error);
    fail(res, 500, '清除数据失败');
  }
});

router.delete('/account', authMiddleware, async (req, res) => {
  const password = req.body?.password;
  if (!password) return fail(res, 400, '请输入当前密码确认注销');
  try {
    if (!(await bcrypt.compare(password, req.user.password)))
      return fail(res, 403, '当前密码错误');
    const files = await getOwnedFiles(req.user);
    await db.clearUserDataByUserId(req.userId);
    await req.user.destroy();
    await deleteUploadedFiles(files);
    ok(res, null, '账号已彻底注销');
  } catch (error) {
    console.error('注销账号失败:', error);
    fail(res, 500, '注销账号失败');
  }
});

router.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  if (!currentPassword || !newPassword || !confirmPassword)
    return fail(res, 400, '请填写完整的密码信息');
  if (newPassword !== confirmPassword)
    return fail(res, 400, '两次输入的新密码不一致');
  if (!validatePassword(newPassword))
    return fail(res, 400, '新密码至少8位，且必须同时包含字母和数字');
  try {
    if (!(await bcrypt.compare(currentPassword, req.user.password)))
      return fail(res, 403, '当前密码错误');
    const password = await bcrypt.hash(newPassword, 10);
    await req.user.update({
      password,
      tokenVersion: req.user.tokenVersion + 1,
    });
    ok(
      res,
      { token: generateToken(req.user.userId, req.user.tokenVersion) },
      '密码修改成功',
    );
  } catch (error) {
    console.error('修改密码失败:', error);
    fail(res, 500, '修改密码失败');
  }
});

router.post(
  '/avatar',
  authMiddleware,
  uploadAvatar.single('avatar'),
  handleUploadError,
  validateImage,
  async (req, res) => {
    if (!req.file) return fail(res, 400, '请选择头像图片');
    const avatar = getFileUrl(req, req.file.filename);
    try {
      const previous = req.user.avatar;
      await req.user.update({ avatar });
      await deleteUploadedFiles([previous]);
      ok(res, serializeUser(req.user), '头像已更新', 201);
    } catch (error) {
      await deleteUploadedFiles([avatar]).catch(() => {});
      console.error('上传头像失败:', error);
      fail(res, 500, '头像更新失败');
    }
  },
);

router.put('/me', authMiddleware, async (req, res) => {
  const { username, bio, goalTags } = req.body || {};
  if (
    typeof username !== 'string' ||
    !username.trim() ||
    username.trim().length > 50
  ) {
    return fail(res, 400, '用户名应为1至50个字符');
  }
  if (bio !== undefined && (typeof bio !== 'string' || bio.length > 200)) {
    return fail(res, 400, '个性签名不能超过200字');
  }
  if (!validateGoalTags(goalTags))
    return fail(res, 400, '目标标签需为1至3个不重复标签');
  try {
    const user = await db.updateUserByUserId(req.userId, {
      username: username.trim(),
      bio: typeof bio === 'string' ? bio.trim() || null : null,
      goalTags: goalTags.map(tag => tag.trim()),
    });
    ok(res, serializeUser(user), '资料更新成功');
  } catch (error) {
    console.error('更新用户资料失败:', error);
    fail(res, 500, '更新失败，请稍后重试');
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    ok(res, await db.getUserStatsByUserId(req.userId), '获取用户统计成功');
  } catch (error) {
    console.error('获取用户统计失败:', error);
    fail(res, 500, '获取用户统计失败，请稍后重试');
  }
});

module.exports = router;
