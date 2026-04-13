const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const plansRoutes = require('./routes/plans');
const templatesRoutes = require('./routes/templates');
const circlesRoutes = require('./routes/circles');
const buddiesRoutes = require('./routes/buddies');
const calendarRoutes = require('./routes/calendar');
const habitsRoutes = require('./routes/habits');
const notificationsRoutes = require('./routes/notifications');
const badgesRoutes = require('./routes/badges');
const rhythmRoutes = require('./routes/rhythm');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: '布丁计划API服务' });
});

app.use('/api/plans', plansRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/circles', circlesRoutes);
app.use('/api/buddies', buddiesRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/badges', badgesRoutes);
app.use('/api/rhythm', rhythmRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`布丁计划后端服务已启动，监听端口 ${PORT}，可以通过 http://192.168.0.120:${PORT} 访问`);
});
