# PuddingPlan (布丁计划)

一个使用 [**React Native**](https://reactnative.dev) + [**Expo**](https://expo.dev) 构建的跨平台移动应用，专注于习惯养成和自律打卡。

## ✨ 功能特性

- **计划管理**: 创建、编辑、删除习惯打卡计划
- **多种打卡方式**: 支持盖章打卡、数值记录、文字日记三种打卡模式
- **里程碑奖励**: 设置阶段性目标和奖励，激励持续打卡
- **成就系统**: 解锁成就徽章，记录成长历程
- **日历视图**: 直观查看打卡历史和活动记录
- **节奏图表**: 可视化展示打卡频率和坚持情况
- **圈子功能**: 加入兴趣圈子，与伙伴共同进步
- **提醒通知**: 自定义打卡提醒时间，不错过每一天

## 📁 项目结构

```
Pudding_Plan/
├── android/                    # Android 原生代码
├── ios/                        # iOS 原生代码
│
├── src/                        # 源代码目录
│   ├── api/                    # API 接口层
│   │   ├── client.ts           # HTTP 客户端配置
│   │   ├── mock-server.ts      # Mock 数据服务
│   │   ├── plans.ts            # 计划相关 API
│   │   ├── calendar.ts         # 日历相关 API
│   │   ├── circles.ts          # 圈子相关 API
│   │   └── notifications.ts    # 通知相关 API
│   │
│   ├── components/             # 组件目录
│   │   ├── common/             # 通用组件
│   │   │   ├── Button.tsx      # 按钮组件
│   │   │   ├── Card.tsx        # 卡片组件
│   │   │   ├── Chip.tsx        # 标签组件
│   │   │   ├── Avatar.tsx      # 头像组件
│   │   │   ├── Toast.tsx       # 提示组件
│   │   │   └── EmptyState.tsx  # 空状态组件
│   │   │
│   │   ├── layout/             # 布局组件
│   │   │   ├── TopAppBar.tsx   # 顶部导航栏
│   │   │   └── BottomNavBar.tsx # 底部导航栏
│   │   │
│   │   ├── plan/               # 计划相关组件
│   │   │   ├── PlanCard.tsx    # 计划卡片
│   │   │   ├── PlanList.tsx    # 计划列表
│   │   │   ├── PlanEmptyState.tsx # 空状态
│   │   │   ├── RhythmChart.tsx # 节奏图表
│   │   │   ├── PlanHeroSection.tsx # 计划头部
│   │   │   ├── PlanBasicInfoForm.tsx # 基本信息表单
│   │   │   ├── CheckInMethodSelector.tsx # 打卡方式选择器
│   │   │   └── ReminderManager.tsx # 提醒管理器
│   │   │
│   │   ├── circle/             # 圈子相关组件
│   │   │   ├── CircleCard.tsx  # 圈子卡片
│   │   │   ├── CircleGrid.tsx  # 圈子网格
│   │   │   ├── BuddyCard.tsx   # 伙伴卡片
│   │   │   └── BuddyList.tsx   # 伙伴列表
│   │   │
│   │   ├── progress/           # 进度组件
│   │   │   ├── ProgressBar.tsx # 进度条
│   │   │   └── BloomProgress.tsx # 圆形进度
│   │   │
│   │   └── specialized/        # 专用组件
│   │       ├── NotificationDrawer.tsx # 通知抽屉
│   │       └── AchievementDrawer.tsx  # 成就抽屉
│   │
│   ├── constants/              # 常量配置
│   │   └── theme.ts            # 主题配置（颜色、间距、字体等）
│   │
│   ├── data/                   # 数据层
│   │   ├── mockData.ts         # Mock 数据
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
│       └── index.ts            # 通用工具函数
│
├── App.tsx                     # 应用入口组件
├── index.js                    # React Native 入口文件
├── package.json                # 项目依赖配置
├── tsconfig.json               # TypeScript 配置
└── README.md                   # 项目文档
```

## 🚀 快速开始

> **注意**: 在开始之前，请确保已安装 Node.js (>= 22.11.0) 和 npm/yarn。

### 第一步：安装依赖

在项目根目录运行以下命令安装项目依赖：

```sh
# 使用 npm
npm install

# 或使用 Yarn
yarn install
```

### 第二步：启动 Expo Go 服务

运行以下命令启动 Expo 开发服务器：

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

### 关闭 Expo Go 服务

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

## 🔧 技术栈

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
- **数据持久化**: Mock Server (开发阶段)
- **构建工具**: Metro + Expo
- **设计系统**: Material Design 3

## 🏗️ 架构设计

### 分层架构

```
┌─────────────────────────────────────┐
│         Screens (页面层)             │  用户界面和页面逻辑
├─────────────────────────────────────┤
│       Components (组件层)            │  可复用的 UI 组件
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

### 核心设计模式

- **组件化**: 按功能和复用性组织组件（common/layout/plan/circle/specialized）
- **Hooks 模式**: 使用自定义 Hooks 封装业务逻辑和状态管理
- **服务层模式**: 将业务逻辑从组件中抽离到 Service 层
- **Mock 数据**: 使用 Mock Server 模拟后端 API，便于前端独立开发

## 📊 代码优化记录

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

**目录结构优化**:

- 保留空目录 `src/assets/` 和 `src/contexts/` 供未来扩展
- 统一组件导出方式，使用 barrel exports (index.ts)
- 规范化文件命名和组织结构

## 📝 开发指南

### 添加新页面

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

### 添加新组件

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

### 使用图标

项目使用 `@expo/vector-icons` 中的 Material Icons：

```typescript
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

<MaterialIcons name="home" size={24} color={Colors.primary} />;
```

查看所有可用图标：https://icons.expo.fyi/Index/MaterialIcons

### 主题配置

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

### 响应式布局

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
