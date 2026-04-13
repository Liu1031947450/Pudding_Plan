# 布丁计划后端API服务

## 项目简介
这是布丁计划（PuddingPlan）的Node.js后端API服务，使用Express.js框架开发。

## 项目结构
```
server/
├── src/
│   ├── index.js          # 入口文件
│   ├── routes/           # 路由文件
│   │   ├── plans.js
│   │   ├── templates.js
│   │   ├── circles.js
│   │   ├── buddies.js
│   │   ├── calendar.js
│   │   ├── habits.js
│   │   ├── notifications.js
│   │   ├── badges.js
│   │   └── rhythm.js
│   └── data/
│       ├── database.js    # 数据库层
│       └── mockData/      # 模拟数据
│           ├── planData.js
│           ├── badgeData.js
│           ├── notificationData.js
│           ├── communityData.js
│           ├── calendarData.js
│           └── templates.js
├── package.json
└── README.md
```

## 安装和运行

### 1. 安装依赖
```bash
cd server
npm install
```

### 2. 启动服务
```bash
npm start
```

服务将在 `http://localhost:3000` 启动

## API接口

所有接口都以 `/api` 为基础路径。

### 计划相关 (Plans)
- `GET /api/plans` - 获取所有计划
- `GET /api/plans/:id` - 获取单个计划
- `POST /api/plans` - 创建新计划
- `PUT /api/plans/:id` - 更新计划
- `DELETE /api/plans/:id` - 删除计划
- `POST /api/plans/:id/check-in` - 计划打卡

### 模板相关 (Templates)
- `GET /api/templates` - 获取所有模板
- `GET /api/templates/:id` - 获取单个模板
- `GET /api/templates/category/:category` - 按分类获取模板

### 圈子相关 (Circles)
- `GET /api/circles` - 获取圈子列表
- `GET /api/circles/:id` - 获取圈子详情
- `POST /api/circles/:id/join` - 加入圈子
- `POST /api/circles` - 发布新动态
- `GET /api/circles/locations/nearby` - 获取附近地点
- `GET /api/circles/topics/trending` - 获取热门话题

### 伙伴相关 (Buddies)
- `GET /api/buddies` - 获取伙伴列表

### 日历相关 (Calendar)
- `GET /api/calendar` - 获取日历数据
- `GET /api/calendar/quote` - 获取每日金句
- `PATCH /api/calendar` - 更新日历活动

### 习惯相关 (Habits)
- `GET /api/habits` - 获取习惯列表
- `POST /api/habits/:id/toggle` - 切换习惯完成状态

### 通知相关 (Notifications)
- `GET /api/notifications` - 获取通知列表
- `PATCH /api/notifications/:id/read` - 标记通知为已读

### 成就相关 (Badges)
- `GET /api/badges` - 获取成就列表

### 节奏数据 (Rhythm)
- `GET /api/rhythm/week` - 获取周节奏数据
- `GET /api/rhythm/month` - 获取月节奏数据

## 前端对接

前端已经配置好使用后端API，只需要确保：
1. 后端服务正在运行（端口3000）
2. 前端的 `src/api/config.ts` 中 `USE_MOCK` 设置为 `false`

## 响应格式

所有API返回统一的响应格式：
```json
{
  "success": true,
  "data": {},
  "message": "success"
}
```

错误响应格式：
```json
{
  "success": false,
  "data": null,
  "error": "错误信息"
}
```
