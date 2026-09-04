require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { fail } = require('../utils/http');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET 环境变量未配置，拒绝启动以避免使用不安全默认值');
}
if (process.env.NODE_ENV === 'production' && JWT_SECRET.length < 32) {
  throw new Error('生产环境 JWT_SECRET 长度不能少于 32 位');
}

function generateToken(userId, tokenVersion = 0) {
  return jwt.sign({ userId, tokenVersion }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, 401, '未提供认证令牌');
  }

  const token = authHeader.substring(7);
  try {
    const decoded = verifyToken(token);
    const user = await User.findOne({ where: { userId: decoded.userId } });
    if (!user || user.tokenVersion !== Number(decoded.tokenVersion || 0)) {
      throw new Error('令牌已失效');
    }
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    return fail(res, 401, '认证令牌无效或已过期');
  }
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
};
