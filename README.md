# PuddingPlan

一个使用 [**React Native**](https://reactnative.dev) 构建的跨平台移动应用，基于 [`@react-native-community/cli`](https://github.com/react-native-community/cli) 初始化。

## 📁 项目结构

```
Pudding_Plan/
├── android/                    # Android 原生代码
│   ├── app/
│   │   ├── src/main/java/      # Kotlin/Java 源码
│   │   └── src/main/res/       # Android 资源文件
│   ├── gradle/                 # Gradle 配置
│   └── build.gradle            # 项目级构建配置
│
├── ios/                        # iOS 原生代码
│   ├── PuddingPlan/            # iOS 应用源码
│   ├── PuddingPlan.xcodeproj/  # Xcode 项目文件
│   └── Podfile                 # CocoaPods 依赖配置
│
├── src/                        # 源代码目录
│   ├── components/             # 通用组件
│   ├── constants/              # 常量配置（主题、颜色、间距等）
│   │   └── theme.ts
│   ├── hooks/                  # 自定义 Hooks
│   ├── navigation/             # 导航配置
│   │   └── AppNavigator.tsx
│   ├── screens/                # 页面组件
│   │   └── HomeScreen.tsx
│   ├── services/              # API 服务层
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts
│   └── utils/                  # 工具函数
│       └── index.ts
│
├── App.tsx                     # 应用入口组件
├── index.js                    # React Native 入口文件
├── package.json                # 项目依赖配置
├── tsconfig.json               # TypeScript 配置
├── metro.config.js             # Metro 打包器配置
├── babel.config.js             # Babel 转译配置
└── jest.config.js              # Jest 测试配置
```

## 🚀 快速开始

> **注意**: 在开始之前，请确保已完成 [环境配置指南](https://reactnative.dev/docs/set-up-your-environment)。

### 第一步：启动 Metro

在项目根目录运行以下命令启动 Metro 开发服务器：

```sh
# 使用 npm
npm start

# 或使用 Yarn
yarn start
```

### 第二步：运行应用

Metro 运行时，打开新的终端窗口，使用以下命令构建并运行 Android 或 iOS 应用：

#### Android

```sh
# 使用 npm
npm run android

# 或使用 Yarn
yarn android
```

#### iOS

首次克隆项目或更新原生依赖后，需要安装 CocoaPods 依赖：

```sh
bundle install
bundle exec pod install
```

然后运行应用：

```sh
# 使用 npm
npm run ios

# 或使用 Yarn
yarn ios
```

如果配置正确，你应该能在 Android 模拟器、iOS 模拟器或真机上看到应用运行。

## 🔧 技术栈

- **框架**: React Native 0.85.0
- **语言**: TypeScript
- **导航**: React Navigation
- **状态管理**: React Hooks
- **构建工具**: Metro

## 📝 开发指南

### 添加新页面

1. 在 `src/screens/` 目录下创建新的页面组件
2. 在 `src/navigation/AppNavigator.tsx` 中注册路由

### 添加新组件

1. 在 `src/components/` 目录下创建组件文件
2. 组件应使用主题常量（`src/constants/theme.ts`）保持样式一致

### 主题配置

主题相关配置位于 `src/constants/theme.ts`，包括：
- `Colors`: 颜色配置
- `Spacing`: 间距配置
- `FontSize`: 字体大小配置

## 🎉 恭喜！

你已经成功运行了 React Native 应用！

### 接下来可以做什么？

- 想将 React Native 代码集成到现有应用中？查看 [集成指南](https://reactnative.dev/docs/integration-with-existing-apps)
- 想深入学习 React Native？查看 [官方文档](https://reactnative.dev/docs/getting-started)

## 🔍 故障排除

如果遇到问题，请查看 [故障排除页面](https://reactnative.dev/docs/troubleshooting)。

## 📚 了解更多

想了解更多关于 React Native 的知识，请查看以下资源：

- [React Native 官网](https://reactnative.dev) - 了解 React Native
- [环境配置](https://reactnative.dev/docs/environment-setup) - React Native 环境配置概述
- [入门指南](https://reactnative.dev/docs/getting-started) - React Native 基础知识
- [官方博客](https://reactnative.dev/blog) - 阅读最新的官方博客文章
- [`@facebook/react-native`](https://github.com/facebook/react-native) - React Native 开源仓库
