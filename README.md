# PuddingPlan (布丁计划)

一个使用 [**React Native**](https://reactnative.dev) + [**Expo**](https://expo.dev) 构建的跨平台移动应用，专注于习惯养成和自律打卡，配备完整的后端 API 服务。

## ✨ 功能特性

- **计划管理**: 创建、编辑、删除习惯打卡计划
- **多种打卡方式**: 支持盖章打卡、数值记录、文字日记三种打卡模式
- **里程碑奖励**: 设置阶段性目标和奖励，激励持续打卡
- **成就系统**: 解锁成就徽章，记录成长历程
- **日历视图**: 直观查看打卡历史和活动记录
- **节奏图表**: 可视化展示打卡频率和坚持情况
- **圈子功能**: 加入兴趣圈子，与伙伴共同进步
- **提醒通知**: 自定义打卡提醒时间，不错过每一天
- **完整后端**: Express.js 构建的 RESTful API 服务
- **数据持久化**: 为数据库集成做好准备

## 📁 项目结构

```
Pudding_Plan/
├── android/                    # Android 原生代码
├── ios/                        # iOS 原生代码
├── public/                     # Web 静态资源
│
├── server/                     # 后端 API 服务
│   ├── src/                    # 后端源代码
│   │   ├── data/               # 数据层
│   │   │   ├── mockData/       # 模拟数据
│   │   │   │   ├── badgeData.js      # 成就数据
│   │   │   │   ├── calendarData.js   # 日历数据
│   │   │   │   ├── communityData.js  # 社区数据
│   │   │   │   ├── notificationData.js # 通知数据
│   │   │   │   ├── planData.js       # 计划数据
│   │   │   │   └── templates.js      # 模板数据
│   │   │   └── database.js     # 内存数据库实现
│   │   ├── routes/             # API 路由
│   │   │   ├── badges.js       # 成就相关路由
│   │   │   ├── buddies.js      # 伙伴相关路由
│   │   │   ├── calendar.js     # 日历相关路由
│   │   │   ├── circles.js      # 圈子相关路由
│   │   │   ├── habits.js       # 习惯相关路由
│   │   │   ├── notifications.js # 通知相关路由
│   │   │   ├── plans.js        # 计划相关路由
│   │   │   ├── rhythm.js       # 节奏数据路由
│   │   │   └── templates.js    # 模板相关路由
│   │   └── index.js            # 后端服务入口
│   ├── package.json            # 后端依赖配置
│   └── README.md               # 后端文档
│
├── src/                        # 前端源代码目录
│   ├── api/                    # API 接口层
│   │   ├── dto/                # 数据传输对象
│   │   ├── mappers/            # 数据映射器
│   │   ├── client.ts           # HTTP 客户端配置
│   │   ├── config.ts           # API 配置
│   │   ├── types.ts            # API 类型定义
│   │   ├── plans.ts            # 计划相关 API
│   │   ├── calendar.ts         # 日历相关 API
│   │   ├── circles.ts          # 圈子相关 API
│   │   ├── notifications.ts    # 通知和成就 API
│   │   ├── rhythm.ts           # 节奏数据 API
│   │   └── templates.ts        # 模板 API
│   │
│   ├── components/             # 通用组件目录
│   │   ├── common/             # 通用 UI 组件
│   │   │   ├── Avatar.tsx      # 头像组件
│   │   │   ├── BottomDrawer.tsx # 底部抽屉
│   │   │   ├── Button.tsx      # 按钮组件
│   │   │   ├── Card.tsx        # 卡片组件
│   │   │   ├── Chip.tsx        # 标签组件
│   │   │   ├── EmptyState.tsx  # 空状态组件
│   │   │   └── Toast.tsx       # 提示组件
│   │   │
│   │   ├── layout/             # 布局组件
│   │   │   ├── TopAppBar.tsx   # 顶部导航栏
│   │   │   └── BottomNavBar.tsx # 底部导航栏
│   │   │
│   │   └── progress/           # 进度组件
│   │       ├── ProgressBar.tsx # 进度条
│   │       └── BloomProgress.tsx # 圆形进度
│   │
│   ├── features/               # 业务功能模块（按领域组织）
│   │   ├── plan/               # 计划功能模块
│   │   │   ├── components/     # 计划相关组件
│   │   │   │   ├── PlanCard.tsx    # 计划卡片
│   │   │   │   ├── PlanList.tsx    # 计划列表
│   │   │   │   ├── PlanEmptyState.tsx # 空状态
│   │   │   │   ├── RhythmChart.tsx # 节奏图表
│   │   │   │   ├── PlanHeroSection.tsx # 计划头部
│   │   │   │   ├── PlanBasicInfoForm.tsx # 基本信息表单
│   │   │   │   ├── PlanFormHeader.tsx # 表单头部
│   │   │   │   ├── PlanGoalList.tsx # 目标列表
│   │   │   │   ├── PlanReminderSection.tsx # 提醒设置
│   │   │   │   ├── PlanMilestoneSection.tsx # 里程碑设置
│   │   │   │   ├── CheckInMethodSelector.tsx # 打卡方式选择器
│   │   │   │   ├── ReminderManager.tsx # 提醒管理器
│   │   │   │   ├── TimePickerModal.tsx # 时间选择器
│   │   │   │   ├── MilestoneEditorDrawerContent.tsx # 里程碑编辑器
│   │   │   │   ├── NotificationDrawer.tsx # 通知抽屉
│   │   │   │   └── AchievementDrawer.tsx  # 成就抽屉
│   │   │   └── index.ts        # 统一导出
│   │   │
│   │   ├── calendar/           # 日历功能模块
│   │   │   ├── components/     # 日历相关组件
│   │   │   │   ├── CalendarGrid.tsx # 日历网格
│   │   │   │   ├── CalendarHeader.tsx # 日历头部
│   │   │   │   ├── DayCell.tsx # 日期单元格
│   │   │   │   ├── DailyQuoteCard.tsx # 每日金句
│   │   │   │   └── TodayFocusSection.tsx # 今日焦点
│   │   │   └── index.ts        # 统一导出
│   │   │
│   │   ├── circle/             # 圈子功能模块
│   │   │   ├── components/     # 圈子相关组件
│   │   │   │   ├── CircleCard.tsx  # 圈子卡片
│   │   │   │   ├── CircleGrid.tsx  # 圈子网格
│   │   │   │   ├── BuddyCard.tsx   # 伙伴卡片
│   │   │   │   └── BuddyList.tsx   # 伙伴列表
│   │   │   └── index.ts        # 统一导出
│   │   │
│   │   ├── settings/           # 设置功能模块
│   │   │   ├── components/     # 设置相关组件
│   │   │   │   ├── SettingItem.tsx # 设置项
│   │   │   │   ├── SettingSection.tsx # 设置分组
│   │   │   │   ├── ProfileEditSheet.tsx # 个人资料编辑
│   │   │   │   ├── PhoneBindSheet.tsx # 手机绑定
│   │   │   │   ├── NotificationSheet.tsx # 通知设置
│   │   │   │   ├── DNDSheet.tsx # 勿扰模式
│   │   │   │   ├── AppearanceSheet.tsx # 外观设置
│   │   │   │   ├── LegalDocSheet.tsx # 法律文档
│   │   │   │   ├── FeedbackSheet.tsx # 意见反馈
│   │   │   │   └── ConfirmSheet.tsx # 确认对话框
│   │   │   └── index.ts        # 统一导出
│   │   │
│   │   └── profile/            # 个人中心模块（预留）
│   │       └── components/     # 个人中心组件
│   │
│   ├── constants/              # 常量配置
│   │   └── theme.ts            # 主题配置（颜色、间距、字体等）
│   │
│   ├── data/                   # 数据层
│   │   └── templates.ts        # 计划模板数据
│   │
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── usePlanManagement.ts # 计划管理
│   │   ├── useCalendarData.ts  # 日历数据
│   │   ├── useCircleData.ts    # 圈子数据
│   │   ├── useNotificationState.ts # 通知状态
│   │   └── useReminderState.ts # 提醒状态
│   │
│   ├── navigation/             # 导航配置
│   │   └── AppNavigator.tsx    # 应用导航器
│   │
│   ├── screens/                # 页面组件
│   │   ├── SplashScreen.tsx    # 启动页
│   │   ├── PlanScreen.tsx      # 计划页（首页）
│   │   ├── CalendarScreen.tsx  # 日历页
│   │   ├── CirclesScreen.tsx   # 圈子页
│   │   ├── ProfileScreen.tsx   # 个人中心页
│   │   ├── SettingsScreen.tsx  # 设置页
│   │   ├── CreatePlanScreen.tsx # 创建/编辑计划页
│   │   ├── TemplateSelectionScreen.tsx # 模板选择页
│   │   └── PostMomentScreen.tsx # 发布动态页
│   │
│   ├── services/               # 业务服务层
│   │   ├── planService.ts      # 计划服务
│   │   ├── calendarService.ts  # 日历服务
│   │   ├── circleService.ts    # 圈子服务
│   │   └── templateService.ts  # 模板服务
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   ├── domain.ts           # 领域模型类型
│   │   ├── ui.ts               # UI 相关类型
│   │   └── navigation.ts       # 导航类型
│   │
│   └── utils/                  # 工具函数
│       ├── index.ts            # 通用工具函数入口
│       └── planUtils.ts        # 计划逻辑工具和统计 (核心)
│
├── App.tsx                     # 应用入口组件
├── index.js                    # React Native 入口文件
├── index.web.js                # Web 入口文件
├── package.json                # 项目依赖配置
├── tsconfig.json               # TypeScript 配置
└── README.md                   # 项目文档
```

## 🚀 快速开始

> **注意**: 在开始之前，请确保已安装 Node.js (>= 22.11.0) 和 npm/yarn。

### 第一步：安装依赖

#### 前端依赖

在项目根目录运行以下命令安装前端依赖：

```sh
# 使用 npm
npm install

# 或使用 Yarn
yarn install
```

#### 后端依赖

在 `server` 目录运行以下命令安装后端依赖：

```sh
cd server
# 使用 npm
npm install

# 或使用 Yarn
yarn install
cd ..
```

### 第二步：启动服务

#### 启动后端 API 服务

在 `server` 目录运行以下命令启动后端服务：

```sh
cd server
# 使用 npm
npm start

# 或使用 Yarn
yarn start
cd ..
```

后端服务默认运行在 `http://192.168.0.120:3000`。

#### 启动前端 Expo 服务

在项目根目录运行以下命令启动 Expo 开发服务器：

```sh
# 使用 npm
npm start

# 或使用 Yarn
yarn start
```

启动后会自动打开 Expo 开发工具界面，显示二维码和多个运行选项。

### 第三步：在设备上运行应用

#### 方式一：使用 Expo Go App（推荐用于快速预览）

1. 在手机上安装 Expo Go App：

   - iOS: 从 App Store 下载 "Expo Go"
   - Android: 从 Google Play 或应用商店下载 "Expo Go"

2. 打开 Expo Go App，扫描终端中显示的二维码

3. 应用会自动加载并运行在你的手机上

#### 方式二：使用模拟器/模拟器

在 Expo 开发工具界面中，按下对应的快捷键：

- **Android 模拟器**: 按 `a` 键（需要先启动 Android 模拟器）
- **iOS 模拟器**: 按 `i` 键（仅限 macOS，需要安装 Xcode）
- **Web 浏览器**: 按 `w` 键

#### 方式三：构建原生应用

如果需要构建原生 Android/iOS 应用：

**Android:**

```sh
npm run android
# 或
yarn android
```

**iOS (仅限 macOS):**

```sh
# 首次运行需要安装 CocoaPods 依赖
cd ios
pod install
cd ..

# 运行应用
npm run ios
# 或
yarn ios
```

### 常用命令

#### 前端命令

```sh
# 启动开发服务器
npm start

# 清除缓存并启动
npm start -- --clear

# 运行 Android 应用
npm run android

# 运行 iOS 应用
npm run ios

# 代码检查
npm run lint

# 运行测试
npm test
```

#### 后端命令

```sh
# 启动后端服务
cd server
npm start

# 启动后端开发模式（自动重启）
cd server
npm run dev
```

### 关闭服务

#### 关闭前端服务

在运行 `npm start` 的终端窗口中：

- 按 `Ctrl + C` 停止开发服务器

如果端口被占用，可以手动清理：

```sh
# 查找占用 8081 端口的进程并终止
lsof -ti:8081 | xargs kill -9

# 或查找占用 19000/19001 端口的进程（Expo 默认端口）
lsof -ti:19000 | xargs kill -9
lsof -ti:19001 | xargs kill -9
```

#### 关闭后端服务

在运行后端服务的终端窗口中：

- 按 `Ctrl + C` 停止后端服务器

如果端口被占用，可以手动清理：

```sh
# 查找占用 3000 端口的进程并终止
lsof -ti:3000 | xargs kill -9
```

## 🔧 技术栈

### 前端

- **框架**: React Native 0.85.0 + Expo 55.0.12
- **语言**: TypeScript 5.8.3
- **导航**: React Navigation 7.x
  - @react-navigation/native
  - @react-navigation/native-stack
  - @react-navigation/bottom-tabs
- **UI 组件**:
  - @expo/vector-icons (Material Icons)
  - expo-blur (毛玻璃效果)
  - expo-linear-gradient (渐变效果)
  - react-native-svg (矢量图形)
- **状态管理**: React Hooks + Custom Hooks
- **网络请求**: Fetch API (封装在 apiClient 中)
- **构建工具**: Metro + Expo
- **设计系统**: Material Design 3

### 后端

- **框架**: Express.js 4.19.2
- **语言**: JavaScript
- **中间件**:
  - cors (跨域支持)
  - body-parser (请求体解析)
- **数据存储**: 内存数据库 (开发阶段，为数据库集成做准备)
- **开发工具**: nodemon (自动重启)
- **API 设计**: RESTful API

## 🏗️ 架构设计

### 前端架构

#### 分层架构

```
┌─────────────────────────────────────┐
│         Screens (页面层)             │  用户界面和页面逻辑
├─────────────────────────────────────┤
│    Features (业务功能模块层)         │  按业务域组织的组件和逻辑
├─────────────────────────────────────┤
│       Components (通用组件层)        │  可复用的 UI 组件
├─────────────────────────────────────┤
│         Hooks (逻辑层)               │  业务逻辑和状态管理
├─────────────────────────────────────┤
│       Services (服务层)              │  业务逻辑封装
├─────────────────────────────────────┤
│          API (接口层)                │  数据获取和处理
├─────────────────────────────────────┤
│      Data/Types (数据层)             │  数据模型和类型定义
└─────────────────────────────────────┘
```

#### 核心设计模式

- **Feature-Based 架构**: 按业务域（plan/calendar/circle/settings）组织代码，每个 feature 包含自己的组件、hooks 和逻辑
- **组件分层**:
  - `components/` - 通用 UI 组件（Button、Card、Avatar 等）
  - `features/` - 业务功能模块，每个模块独立管理自己的组件
- **统一导出**: 每个 feature 通过 `index.ts` 统一导出，提供清晰的 API 边界
- **Hooks 模式**: 使用自定义 Hooks 封装业务逻辑和状态管理
- **服务层模式**: 将业务逻辑从组件中抽离到 Service 层
- **API 客户端**: 封装统一的 API 调用逻辑，包含错误处理和超时机制

### 后端架构

#### 分层架构

```
┌─────────────────────────────────────┐
│          Routes (路由层)             │  API 路由定义和请求处理
├─────────────────────────────────────┤
│        Database (数据层)             │  数据存储和访问
└─────────────────────────────────────┘
```

#### 核心设计模式

- **RESTful API 设计**: 遵循 REST 原则，使用标准 HTTP 方法
- **统一响应格式**: 所有 API 响应使用统一的 JSON 格式
- **错误处理**: 统一的错误处理机制
- **数据验证**: 请求数据验证
- **模块化路由**: 按业务域组织路由模块
- **内存数据库**: 开发阶段使用内存数据库，为后续数据库集成做准备

### 目录组织原则

1. **通用组件** (`src/components/`)

   - 只包含与业务无关的通用 UI 组件
   - 可在任何 feature 中复用
   - 例如：Button、Card、Toast、ProgressBar

2. **业务功能模块** (`src/features/`)

   - 按业务域组织（plan、calendar、circle、settings）
   - 每个 feature 包含：
     - `components/` - 该业务域的专用组件
     - `index.ts` - 统一导出接口
   - 未来可扩展：hooks、services、types

3. **导入规则**
   - Screen 从 `../features/xxx` 导入业务组件
   - Screen 从 `../components` 导入通用组件
   - Feature 内部组件从 `../../../components` 导入通用组件
   - Feature 之间可以相互引用（如 calendar 引用 plan 的 NotificationDrawer）

## 📊 代码优化记录

### 2026-04-12 后端代码优化与架构整理

**核心变更**:

- **统一响应格式**: 在所有后端路由中实现统一的响应格式，确保 API 响应的一致性
- **错误处理增强**: 添加 try-catch 错误处理，提高服务稳定性
- **数据验证**: 为请求数据添加验证逻辑，确保数据完整性
- **代码规范**: 统一代码风格，添加清晰的注释和文档
- **功能扩展**: 为通知 API 添加标记所有通知为已读的功能

**优化的文件**:

- `server/src/routes/plans.js` - 优化计划相关路由，添加数据验证和错误处理
- `server/src/routes/calendar.js` - 优化日历相关路由，添加参数验证和错误处理
- `server/src/routes/notifications.js` - 优化通知相关路由，添加新功能和错误处理

### 2026-04-12 前端代码优化

**核心变更**:

- **API 客户端优化**: 移除所有 `console.log` 调试语句，确保生产环境代码干净
- **API 功能扩展**: 为 notifications API 添加标记所有通知为已读和删除通知的功能
- **类型定义优化**: 确保类型定义的完整性和一致性
- **代码规范**: 统一代码风格，提高代码可读性

**优化的文件**:

- `src/api/plans.ts` - 移除调试日志，优化错误处理
- `src/api/notifications.ts` - 添加新功能，优化参数处理

### 2026-04-10 代码整理

**删除的文件**:

- `src/screens/HomeScreen.tsx` - 未使用的首页组件
- `src/components/plan/BadgeSection.tsx` - 已被 AchievementDrawer 替代
- `src/components/specialized/BentoGrid.tsx` - 未使用的网格组件

**清理的代码**:

- 移除所有 `console.log` 调试语句
- 移除所有 `Alert` 测试代码
- 清理重复的导出声明
- 优化组件导入路径

**优化的组件**:

- `AchievementDrawer`: 添加打开/关闭动画，优化布局为两列显示
- `PlanScreen`: 移除内联成就展示，改用抽屉方式
- `CirclesScreen`: 移除占位符事件处理

**文件统计**:

- 优化前: 75 个 TypeScript 文件
- 优化后: 72 个 TypeScript 文件
- 删除: 3 个文件
- 清理: 9 处 console.log，2 处 Alert

### 2026-04-11 Feature 架构重构

**核心变更**:

- **业务组件 Feature 化**: 将计划、日历、圈子、设置相关组件从 `src/components/` 迁移到 `src/features/`，按业务域组织代码。
- **通用组件收口**: `src/components/` 现在只保留通用 UI 组件（common、layout、progress），不再承载业务组件。
- **导出边界统一**: 每个 feature 模块通过 `index.ts` 统一导出，Screen 层统一从 `features/xxx` 导入业务组件。
- **API 层整理**: 新增 `src/api/types.ts` 统一 API 类型；Mock 数据从 `src/data/mockData.ts` 拆分到 `src/api/mock/data/`。
- **设置页组件化**: 提取 `SettingItem`、`SettingSection` 等设置页子组件，减少 `SettingsScreen` 复杂度。

**目录结构调整**:

- `src/components/plan/` → `src/features/plan/components/`
- `src/components/circle/` → `src/features/circle/components/`
- `src/components/settings/` → `src/features/settings/components/`
- `src/components/specialized/` → `src/features/plan/components/`
- `src/data/mockData.ts` → `src/api/mock/data/*.ts`

**重构收益**:

- 业务边界更清晰，降低目录混用
- 通用组件与业务组件职责分离
- 未来新增功能时更容易扩展 feature 模块
- import 路径语义更明确

### 2026-04-10 数据架构升级

**核心变更**:

- **事实源统一**: 引入 `completedDate: string[]` 作为计划打卡的唯一事实源，废弃了分散在 `currentDays` 和 `checkInsDB` 中的状态数据。
- **派生逻辑抽离**: 新建 `src/utils/planUtils.ts`，统一负责计算连续天数 (Streak)、历史最长天数、打卡进度及中断检测。
- **UI 逻辑优化**: `PlanCard` 等组件现在完全基于 `completedDate` 派生展示数据，确保了数据的一致性和逻辑的健壮性。
- **Mock 服务重构**: `mock-server.ts` 移除冗余的打卡数据库，所有日历和进度逻辑均实时基于计划内的日期列表生成。

**目录结构优化**:

- 保留空目录 `src/assets/` 和 `src/contexts/` 供未来扩展
- 统一组件导出方式，使用 barrel exports (index.ts)
- 规范化文件命名和组织结构

## 📝 开发指南

### 前端开发

#### 添加新页面

1. 在 `src/screens/` 目录下创建新的页面组件
2. 在 `src/screens/index.ts` 中导出组件
3. 在 `src/navigation/AppNavigator.tsx` 中注册路由

示例：

```typescript
// src/screens/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

const NewScreen: React.FC = () => {
  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
};

export default NewScreen;

// src/screens/index.ts
export { default as NewScreen } from './NewScreen';

// src/navigation/AppNavigator.tsx
import { NewScreen } from '../screens';
// 在 Stack.Navigator 中添加
<Stack.Screen name="NewScreen" component={NewScreen} />;
```

#### 添加新组件

1. 在 `src/components/` 目录下创建组件文件
2. 在 `src/components/index.ts` 中导出组件
3. 组件应使用主题常量（`src/constants/theme.ts`）保持样式一致

示例：

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

export const MyComponent: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.onSurface,
  },
});

// src/components/index.ts
export { MyComponent } from './MyComponent';
```

#### 使用图标

项目使用 `@expo/vector-icons` 中的 Material Icons：

```typescript
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

<MaterialIcons name="home" size={24} color={Colors.primary} />;
```

查看所有可用图标：https://icons.expo.fyi/Index/MaterialIcons

#### 主题配置

主题相关配置位于 `src/constants/theme.ts`，包括：

- **Colors**: Material Design 3 颜色系统
  - `primary`, `secondary`, `tertiary` - 主题色
  - `surface`, `background` - 背景色
  - `onPrimary`, `onSurface` - 文字颜色
- **Spacing**: 间距配置
  - `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`
- **FontSize**: 字体大小配置
  - `xs: 12`, `sm: 14`, `md: 16`, `lg: 18`, `xl: 24`, `xxl: 32`
- **BorderRadius**: 圆角配置
  - `sm: 8`, `md: 16`, `lg: 32`, `xl: 48`, `full: 9999`

#### 响应式布局

使用 flexWrap 和百分比宽度实现响应式布局：

```typescript
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  item: {
    width: '48%', // 两列布局
    minWidth: 140, // 最小宽度
  },
});
```

### 后端开发

#### 添加新路由

1. 在 `server/src/routes/` 目录下创建新的路由文件
2. 在 `server/src/index.js` 中注册路由
3. 使用统一的响应格式和错误处理

示例：

```javascript
// server/src/routes/newRoute.js
const express = require('express');
const router = express.Router();
const db = require('../data/database');

// 统一响应格式函数
const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({
    success,
    data,
    message,
    error,
  });
};

// 示例路由
router.get('/', (req, res) => {
  try {
    sendResponse(res, true, db.someData, '获取数据成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

module.exports = router;

// server/src/index.js
const newRoute = require('./routes/newRoute');
app.use('/api/new-route', newRoute);
```

#### 数据模型扩展

1. 在 `server/src/data/mockData/` 目录下添加新的模拟数据
2. 在 `server/src/data/database.js` 中注册数据模型

示例：

```javascript
// server/src/data/mockData/newData.js
const mockNewData = [
  { id: '1', name: '示例数据 1' },
  { id: '2', name: '示例数据 2' },
];

module.exports = { mockNewData };

// server/src/data/database.js
const { mockNewData } = require('./mockData/newData');

class Database {
  constructor() {
    // 其他数据...
    this.newData = [...mockNewData];
  }
}
```

### API 开发规范

#### 前端 API 调用

1. 使用 `apiClient` 进行 API 调用
2. 处理 API 响应和错误
3. 使用服务层封装业务逻辑

示例：

```typescript
// src/api/newApi.ts
import { apiClient, type ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

export const newApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    try {
      return await apiClient.get<any[]>(API_ENDPOINTS.NEW_ENDPOINT);
    } catch (error: any) {
      return { success: false, error: error.message || '获取数据失败' };
    }
  },
};

// src/services/newService.ts
import { newApi } from '../api';
import type { ApiResponse } from '../api/client';

export const newService = {
  async getData() {
    const response = await newApi.getAll();
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || '获取数据失败');
  },
};
```

#### 后端 API 设计

1. 遵循 RESTful API 设计原则
2. 使用标准 HTTP 方法
3. 统一响应格式
4. 实现错误处理和数据验证

### 数据库集成准备

项目当前使用内存数据库，为后续数据库集成做准备：

1. 数据模型已标准化
2. 数据访问逻辑已封装
3. 路由和业务逻辑已分离

后续集成数据库时，只需：

1. 安装数据库驱动
2. 配置数据库连接
3. 实现数据库操作层
4. 替换内存数据库实现

## 🎉 恭喜！

你已经成功运行了 PuddingPlan 应用！

### 接下来可以做什么？

- 探索应用的各个页面：计划、日历、圈子、个人中心
- 查看源代码了解项目结构和实现细节
- 根据需求添加新功能或修改现有功能
- 阅读开发指南学习如何添加新页面和组件

## 🔍 故障排除

### 端口被占用

如果启动时提示端口被占用：

```sh
# 清理 Expo 默认端口
lsof -ti:19000 | xargs kill -9
lsof -ti:19001 | xargs kill -9

# 清理 Metro 端口
lsof -ti:8081 | xargs kill -9
```

### 缓存问题

如果遇到奇怪的错误或更新不生效，尝试清除缓存：

```sh
# 清除 Expo 缓存并重启
npm start -- --clear

# 或手动清除
rm -rf node_modules
rm -rf .expo
npm install
```

### TypeScript 错误

如果 IDE 显示 TypeScript 错误但代码能正常运行：

1. 重启 TypeScript 服务器（VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"）
2. 检查 `tsconfig.json` 配置是否正确
3. 运行 `npx tsc --noEmit` 检查类型错误

### iOS 模拟器问题

如果 iOS 模拟器无法启动：

```sh
# 重新安装 pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android 模拟器问题

1. 确保 Android Studio 已安装并配置好 Android SDK
2. 确保至少有一个 Android 虚拟设备（AVD）已创建
3. 在 Android Studio 中手动启动模拟器后再运行 `npm run android`

### 依赖安装问题

如果 `npm install` 失败：

```sh
# 清理并重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

更多问题请查看：

- [Expo 故障排除](https://docs.expo.dev/troubleshooting/overview/)
- [React Native 故障排除](https://reactnative.dev/docs/troubleshooting)

## 📚 了解更多

想了解更多关于项目使用的技术，请查看以下资源：

- [React Native 官网](https://reactnative.dev) - 了解 React Native
- [Expo 官方文档](https://docs.expo.dev) - Expo 开发指南
- [React Navigation 文档](https://reactnavigation.org/docs/getting-started) - 导航库使用指南
- [Material Design 3](https://m3.material.io) - Material Design 设计规范
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/) - TypeScript 学习资源

## 📄 许可证

本项目仅供学习和个人使用。

## 👥 贡献

欢迎提交 Issue 和 Pull Request！
