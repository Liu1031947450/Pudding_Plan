# PuddingPlan (布丁计划)

一个使用 [**React Native**](https://reactnative.dev) + [**Expo**](https://expo.dev) 构建的跨平台移动应用，专注于习惯养成和自律打卡，配备完整的后端 API 与实时通知服务。

## ✨ 功能特性

- **计划管理**: 创建、编辑、删除习惯打卡计划，支持多种模板
- **多种打卡方式**: 支持盖章打卡、数值记录、文字日记三种打卡模式
- **里程碑奖励**: 设置阶段性目标和奖励，激励持续打卡
- **成就系统**: 解锁成就徽章，记录成长历程
- **日历视图**: 直观查看打卡历史和活动记录，支持每日金句展示
- **节奏图表**: 可视化展示打卡频率和坚持情况
- **圈子与社区**: 类似社交平台的瀑布流动态展示，支持发布图文、关注伙伴
- **社交互动**: 完整的点赞、收藏、评论及回复功能
- **实时通知**: 集成 Socket.io，实现即时接收社交互动通知（点赞、评论等）
- **个人中心**: 管理个人资料、成就记录及我的收藏（支持长按取消收藏）
- **后端架构**: 使用 Sequelize ORM (PostgreSQL/SQLite) 实现持久化存储，支持 WebSocket 通信

## 📁 项目结构

```
Pudding_Plan/
├── android/                    # Android 原生代码
├── ios/                        # iOS 原生代码
├── server/                     # 后端 API 服务
│   ├── src/                    # 后端源代码
│   │   ├── models/             # Sequelize 数据库模型
│   │   ├── routes/             # API 业务路由
│   │   ├── middleware/         # JWT 与权限中间件
│   │   ├── utils/              # Socket.io、文件上传、DB 初始化工具
│   │   └── index.js            # 服务入口 (Express + WebSocket)
│   ├── uploads/                # 用户图片存储目录
│   ├── package.json            # 后端依赖配置
│   └── README.md               # 后端说明文档
├── src/                        # 前端源代码目录
│   ├── api/                    # 接口封装与全局配置
│   ├── components/             # 通用基础 UI 组件
│   ├── features/               # 领域业务模块 (Plan, Calendar, Circle, Settings)
│   ├── hooks/                  # 全局共享自定义 Hooks
│   ├── navigation/             # AppNavigator 路由栈配置
│   ├── screens/                # 业务页面组件 (首页, 详情页, 收藏页, 发布页等)
│   ├── services/               # 业务逻辑与数据转换服务
│   ├── types/                  # 全局 TypeScript 类型声明
│   └── utils/                  # 统计工具、URL 处理、日期转换
├── App.tsx                     # 应用入口
├── index.js                    # React Native 入口
└── package.json                # 前端配置说明文件
```

## 🚀 快速开始

> **注意**: 在开始之前，请确保已安装 Node.js (>= 22.11.0) 和 npm/yarn。

### 第一步：安装依赖

#### 前端依赖
在项目根目录运行：
```sh
npm install
```

#### 后端依赖
在 `server` 目录运行：
```sh
cd server && npm install && cd ..
```

### 第二步：启动服务

#### 启动后端 API 服务
在 `server` 目录运行：
```sh
cd server && npm run dev
```
后端服务默认运行在 `http://0.0.0.0:3000` (API 路径为 `/api`)。

#### 启动前端 Expo 服务
在项目根目录运行：
```sh
npm start
```

### 第三步：在设备上运行
1. **Expo Go**: 在手机上安装 Expo Go App，扫描终端二维码。
2. **模拟器**: 在终端按 `a` (Android) 或 `i` (iOS) 启动。

## 🔧 技术栈

### 前端
- **框架**: React Native + Expo
- **状态管理**: React Hooks + Context API
- **路由**: React Navigation (Stack & Tabs)
- **实时通信**: Socket.io-client
- **UI 组件**: Material Design 3 风格，Lucide Icons, Expo Linear Gradient

### 后端
- **引擎**: Node.js + Express
- **数据库**: Sequelize ORM (PostgreSQL / SQLite)
- **实时性**: Socket.io (WebSocket)
- **认证**: JWT (jsonwebtoken)
- **存储**: Multer (本地磁盘上传)

## 📊 重大更新记录

### 2026-04-15 全面社交化与持久化升级
- **数据库迁移**: 从内存数据库全量迁移至 Sequelize ORM 架构。
- **动态详情页**: 实现了完整的动态阅读、点赞、收藏及瀑布流展示 logic。
- **实时系统**: 引入 Socket.io 共享管理器，实现评论与点赞的即时通知推送。
- **收藏管理**: 升级“我的收藏”为瀑布流布局，并支持长按取消收藏。

---
© 2026 PuddingPlan (布丁计划)
