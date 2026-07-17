require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const { setIO, connectedUsers } = require('./utils/socketManager');
const initDatabase = require('./utils/initDatabase');
const { expressOrigin, socketOrigin } = require('./config/cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: socketOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  // 性能优化配置
  pingInterval: 25000,
  pingTimeout: 5000,
  maxHttpBufferSize: 1e6, // 1MB
  transports: ['websocket'], // 只使用websocket传输
});

// 注册 io 实例到共享管理器（解决循环依赖）
setIO(io);

const plansRoutes = require('./routes/plans');
const templatesRoutes = require('./routes/templates');
const circlesRoutes = require('./routes/circles');
const buddiesRoutes = require('./routes/buddies');
const calendarRoutes = require('./routes/calendar');
const habitsRoutes = require('./routes/habits');
const notificationsRoutes = require('./routes/notifications');
const badgesRoutes = require('./routes/badges');
const rhythmRoutes = require('./routes/rhythm');
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const feedbackRoutes = require('./routes/feedback');
const { verifyToken } = require('./middleware/auth');
const { User } = require('./models');

const PORT = process.env.PORT || 3000;

const path = require('path');

app.use(
  cors({
    origin: expressOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(bodyParser.json());

// 全局请求日志中间件
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// 静态文件服务：图片上传目录
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: '布丁计划API服务' });
});

app.use('/api/auth', authRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/circles', circlesRoutes);
app.use('/api/buddies', buddiesRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/rhythm', rhythmRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/feedback', feedbackRoutes);

// WebSocket连接管理（connectedUsers 来自 socketManager）

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('未提供认证token'));
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findOne({ where: { userId: decoded.userId } });
    if (!user || user.tokenVersion !== Number(decoded.tokenVersion || 0)) {
      return next(new Error('token已失效'));
    }
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('无效的token'));
  }
});

io.on('connection', socket => {
  console.log(`用户 ${socket.userId} 已连接`);

  // 存储用户连接
  connectedUsers.set(socket.userId, socket.id);

  // 断开连接处理
  socket.on('disconnect', () => {
    console.log(`用户 ${socket.userId} 已断开连接`);
    connectedUsers.delete(socket.userId);
  });
});

// io 和 connectedUsers 已通过 socketManager 共享，无需从此模块导出

// 初始化数据库并启动服务器
initDatabase()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`布丁计划后端服务已启动，监听端口 ${PORT}`);
    });
  })
  .catch(error => {
    console.error('服务启动失败:', error);
    process.exit(1);
  });
