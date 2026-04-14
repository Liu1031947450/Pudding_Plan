require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const initDatabase = require('./utils/initDatabase');
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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

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

// 初始化数据库并启动服务器
initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`布丁计划后端服务已启动，监听端口 ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('服务启动失败:', error);
    process.exit(1);
  });
