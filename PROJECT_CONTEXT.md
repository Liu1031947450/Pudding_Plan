# PuddingPlan 项目上下文与开发指南

> 最后核对：2026-07-17
>
> 当前分支：`dev`
>
> 分析基线：`2d3b1abb7e871439eecd2e24c2e29e0788414551`
>
> 适用范围：React Native / Expo 前端、Express 后端、PostgreSQL 数据库、Socket.io 实时通知、Android/iOS 原生工程及 Web 构建尝试

## 1. 文档用途

本文档用于在开始开发任务前快速恢复项目上下文。它以当前仓库源码、配置、脚本、Git 历史和本次实际质量检查为依据，重点回答以下问题：

- 项目解决什么问题，已经实现了哪些业务能力；
- 一次用户操作会经过哪些前端、后端和数据库层；
- 新需求应该修改哪个目录，哪些约定不能破坏；
- 当前有哪些已知缺陷、技术债和高风险实现；
- 开发、联调、验证和提交前应该执行哪些命令。

历史文档（如 `README.md`、`API_DOCS.md`、`OPTIMIZATION_PROGRESS.md`）仍有参考价值，但部分描述已经落后于当前实现。发生冲突时，以源码、运行配置和本文件的“当前验证状态”为准。

## 2. 项目概览

PuddingPlan（布丁计划）是一款面向习惯养成、自律打卡和轻社交场景的跨平台应用。客户端以 React Native + Expo 为主，同时保留 Android、iOS 原生工程和一套独立 Webpack Web 构建配置；服务端使用 Express + Sequelize + PostgreSQL，并通过 Socket.io 推送点赞、评论、回复和成就通知。

项目从 2026-04-09 开始搭建，随后经历了以下阶段：

1. 2026-04-09 至 2026-04-10：完成 Expo 应用、主要页面、计划与日历交互以及早期 Mock API。
2. 2026-04-13 至 2026-04-14：加入 Express 后端、登录注册、PostgreSQL 与 Sequelize 持久化。
3. 2026-04-15 至 2026-04-16：集中完成圈子、收藏、成就、通知、提醒和多模块联调。
4. 2026-06-03：进行一次全仓代码质量与架构重构，形成当前 `src/features`、Service/Hook/API 分层及后端部分 MVC 结构。

当前仓库分析到 282 个有效项目文件，其中 216 个为代码文件。业务逻辑主要位于 `src/` 和 `server/src/`；`android/`、`ios/` 主要承载原生构建；`stitch_puddingplan1.0/` 是设计原型参考，不参与应用运行。

## 3. 核心业务模块

| 模块           | 主要能力                                   | 前端入口                                         | 后端入口                                                     | 核心数据                                     |
| -------------- | ------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------- |
| 认证与账号     | 注册、登录、会话恢复、资料编辑、服务端退出 | `AuthScreen.tsx`、`AuthContext.tsx`              | `routes/auth.js`                                             | `User.tokenVersion`、JWT、SecureStore        |
| 计划管理       | 新建、编辑、删除、批量管理、模板创建       | `PlanScreen.tsx`、`CreatePlanScreen.tsx`         | `routes/plans.js`                                            | `Plan`                                       |
| 打卡与提醒     | 盖章、数值、日记打卡与本地定时提醒         | `CalendarScreen.tsx`、`usePlanManagement.ts`     | `routes/plans.js`                                            | `PlanCheckIn`、`Plan.completedDate` 兼容字段 |
| 日历与习惯     | 月历、每日计划完成情况、习惯切换、每日金句 | `CalendarScreen.tsx`、`useCalendarData.ts`       | `routes/calendar.js`、`routes/habits.js`                     | `Plan`、`Habit`                              |
| 节奏与成就     | 周/月打卡图表、徽章进度、解锁通知          | `RhythmChart.tsx`、`AchievementDrawer.tsx`       | `routes/rhythm.js`、`routes/badges.js`                       | `Badge`、实时统计                            |
| 模板           | 系统模板、分类、难度、计划预填充           | `TemplateSelectionScreen.tsx`                    | `routes/templates.js`                                        | `Template`、本地模板兜底                     |
| 圈子与伙伴     | 动态发布、图片上传、瀑布流、详情、关注     | `CirclesScreen.tsx`、`PostMomentScreen.tsx`      | `routes/circles.js`、`circleController.js`                   | `CircleMoment`、`Friendship`                 |
| 社交互动       | 点赞、收藏、评论、回复、我的收藏           | 圈子组件、`MyCollectionsScreen.tsx`              | `circleController.js`                                        | `Like`、`Collect`、`Comment`                 |
| 实时通知       | 通知列表、未读数、已读、实时推送           | `NotificationContext.tsx`、`websocketService.ts` | `routes/notifications.js`、`socketManager.js`                | `Notification`、Socket.io                    |
| 设置与个人中心 | 外观、通知、免打扰、反馈、资料和统计       | `ProfileScreen.tsx`、`SettingsScreen.tsx`        | `routes/auth.js`、`routes/settings.js`、`routes/feedback.js` | `UserSetting`、`Feedback`、用户资料与统计    |

## 4. 技术栈

### 4.1 客户端

- React 19.2、React Native 0.83.4、Expo 55；
- TypeScript 5.8；
- React Navigation 7：Native Stack + Bottom Tabs；
- React Context + Hooks 作为全局和页面状态方案；
- Expo SecureStore 保存登录信息；
- Expo Notifications 提供设备本地提醒；
- Socket.io Client 接收实时通知；
- Expo Image Picker、Location、Linear Gradient、Blur 等设备与 UI 能力；
- Jest + React Test Renderer 作为测试基础；
- 独立 Webpack 5 配置用于 Web 构建尝试。

### 4.2 服务端

- Node.js + Express 4；
- Sequelize 6 + PostgreSQL；
- JWT + bcrypt 处理身份认证；
- Socket.io 提供 WebSocket 通知；
- Multer + 本地目录处理图片上传；
- Sequelize CLI 管理显式 migration；
- nodemon 用于开发热重启。

### 4.3 工程与平台

- Expo CLI、EAS Build；
- Android Gradle 工程与 Kotlin Application；
- iOS CocoaPods、Xcode 工程与 Swift AppDelegate；
- ESLint、Prettier；
- GitHub Actions 执行格式、lint、完整前端测试、类型检查、Web 构建、后端测试、空库 migration、数据库验证和 API 冒烟。

## 5. 总体技术架构

```text
用户操作
  │
  ▼
Screen / Feature Component
  │
  ├── Context：认证、通知等全局状态
  └── Hook：页面状态、加载、刷新、操作编排
          │
          ▼
       Service：业务接口适配与本地能力
          │
          ▼
       API Module → ApiClient → HTTP + Bearer JWT
                                  │
                                  ▼
                    Express Route / Middleware
                                  │
                 ┌────────────────┴───────────────┐
                 ▼                                ▼
          Controller / Service              data/database.js
                 │                                │
                 └───────────────┬────────────────┘
                                 ▼
                       Sequelize Model → PostgreSQL

服务端社交事件 → Notification → Socket.io → websocketService
                                             │
                                             ▼
                                  NotificationContext → UI

计划提醒配置 → notificationScheduler → Expo Notifications → 设备本地通知
```

这是一个“按功能组织 UI、按层组织数据访问”的混合架构：

- 前端 `features/` 按业务域收拢组件；
- 页面通过 Hook/Context 管理状态，通过 Service/API 访问数据；
- 后端圈子模块已拆为 route + controller，其他模块仍主要在 route 内编排业务；
- `server/src/data/database.js` 同时承担 repository、聚合查询和部分业务逻辑职责；
- PostgreSQL 是远端业务数据的事实源，设备提醒则是客户端本地状态。

## 6. 目录结构与职责

### 6.1 根目录

| 路径                     | 职责                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| `App.tsx`                | 前端根组件，安装 Auth/Notification/SafeArea Provider，控制 Splash 与主导航 |
| `index.js`               | Expo / React Native 注册入口                                               |
| `index.web.js`           | 独立 Webpack Web 注册入口                                                  |
| `package.json`           | 前端依赖、开发脚本、质量检查和后端快捷命令                                 |
| `app.json`、`eas.json`   | Expo 元数据与 EAS 构建配置                                                 |
| `webpack.config.js`      | 自维护 Web 构建配置，开发端口 8080，生产构建已通过                         |
| `README.md`              | 项目简介与基础启动说明，部分细节需结合本文件                               |
| `API_DOCS.md`            | 早期 Mock API 文档，已明显过期                                             |
| `stitch_puddingplan1.0/` | HTML 设计原型与产品需求参考，不属于运行时代码                              |

### 6.2 前端 `src/`

| 路径              | 职责                                            | 修改建议                                         |
| ----------------- | ----------------------------------------------- | ------------------------------------------------ |
| `src/screens/`    | 路由级页面，负责页面编排和导航                  | 避免继续堆积可复用的大段 UI；下沉到对应 feature  |
| `src/features/`   | 按 calendar/circle/plan/settings 划分的业务组件 | 新的域内组件优先放这里                           |
| `src/components/` | 跨业务复用的基础 UI、布局和进度组件             | 不要放页面专属业务逻辑                           |
| `src/hooks/`      | 可复用状态与副作用编排                          | Hook 应依赖 Service/Context，不直接复制 API 逻辑 |
| `src/contexts/`   | Auth 与 Notification 全局状态                   | 新增全局状态前先确认确实跨页面共享               |
| `src/services/`   | 业务访问入口、数据兜底、设备能力                | 负责稳定上层调用方式，不承载视图状态             |
| `src/api/`        | HTTP Client、端点封装、DTO 与映射               | 所有请求统一经过 `apiClient`                     |
| `src/types/`      | 全局领域、导航与 UI 类型                        | API DTO 和领域类型不要混为同一概念               |
| `src/utils/`      | 纯函数工具                                      | 不读取组件状态，不产生 UI 副作用                 |
| `src/constants/`  | 主题等全局常量                                  | 颜色 token 应在这里保持完整和一致                |
| `src/data/`       | 本地模板等静态兜底数据                          | 明确标注是兜底、初始化还是事实源                 |

### 6.3 后端 `server/`

| 路径                          | 职责                                  | 修改建议                             |
| ----------------------------- | ------------------------------------- | ------------------------------------ |
| `server/src/index.js`         | Express/HTTP/Socket.io 启动与路由挂载 | 保持为装配入口，不继续塞业务逻辑     |
| `server/src/routes/`          | REST API 路由、鉴权和当前多数业务编排 | 新复杂模块优先 route/controller 分离 |
| `server/src/controllers/`     | 圈子控制器                            | 可作为后续复杂路由拆分范例           |
| `server/src/services/`        | 成就规则执行与通知联动                | 放跨路由可复用的业务能力             |
| `server/src/data/database.js` | Sequelize 查询、写入和聚合            | 当前职责较重，改动前检查所有调用者   |
| `server/src/models/`          | Sequelize 模型与关联                  | 字段变更必须同步 migration           |
| `server/src/middleware/`      | JWT 与文件上传                        | 属于信任边界，必须保留输入和权限校验 |
| `server/src/utils/`           | 数据库启动初始化、Socket 单例管理     | 禁止加入不可重复执行的数据破坏逻辑   |
| `server/migrations/`          | 显式数据库结构迁移                    | 新字段/表应优先新增 migration        |
| `server/uploads/`             | 本地上传图片                          | 不适合无状态、多实例或长期生产存储   |

## 7. 关键运行流程

### 7.1 应用启动与登录恢复

1. `index.js` 通过 Expo 注册 `App`。
2. `App.tsx` 安装 `AuthProvider`、`NotificationProvider` 和 `SafeAreaProvider`。
3. `AuthContext` 从 SecureStore 读取用户、过期时间和 JWT。
4. 本地会话有效时，恢复内存 `authToken` 并连接 Socket.io；服务端仍以 JWT 的 `exp` 和 `User.tokenVersion` 为最终有效性依据。
5. 任一鉴权请求返回 401 时，`apiClient` 通知 `AuthProvider` 清理 SecureStore、Context 和 WebSocket 状态。
6. `AppNavigator` 根据认证状态进入 Auth 或 Main；登录成功后 `AuthScreen` 主动 reset 到 Main。

注意：`apiClient` 中的 token 仅保存在模块内存中，真正持久化由 `AuthContext` 和 SecureStore 负责。

### 7.2 HTTP 请求

1. 功能代码调用 `plansApi`、`circlesApi` 等领域 API。
2. API 模块统一委托 `apiClient`。
3. `apiClient` 负责 Base URL、JSON/FormData、10 秒超时和 Bearer Token。
4. 后端 `authMiddleware` 验证 JWT，并查询用户核对 `tokenVersion`，再将 UUID 和用户实例写入请求上下文。
5. route/controller 查询数据并返回 `{ success, data, message, error }`。

当前 `API_CONFIG.RETRY_ATTEMPTS` 只是配置项，尚未实现自动重试。

### 7.3 计划、打卡与提醒

- `plan_check_ins` 是打卡记录的数据库事实源，唯一键为 `(planId, checkInDate)`；
- `Plan.completedDate: string[]` 暂时保留并双写，只用于旧客户端和回滚兼容；
- 计划响应同时提供 `checkInRecords`，可包含 `numericValue` 和 `note`；
- `currentDays`、`days`、`progress` 仍根据兼容日期列表派生；
- 创建/编辑由 `CreatePlanScreen → usePlanManagement → planService → plansApi` 完成；
- 打卡由 `POST /api/plans/:id/check-in?date=YYYY-MM-DD` 完成，请求体可传 `numericValue` 或 `note`；
- 重复日期不会插入新记录，但允许更新已有数值/文字明细；
- 后端完成打卡后立即检查成就；
- 计划提醒由前端 `notificationScheduler.ts` 注册为设备本地通知，不由后端定时任务触发；
- 删除计划时，前端同步取消该计划对应的本地提醒。

计划列表拖动排序当前只改变前端内存顺序，没有持久化排序字段或接口。

### 7.4 日历、习惯与节奏图

- 月历数据不是独立表，而是服务端按日期范围查询 `plan_check_ins` 即时计算；
- `completedPlanIds` 用于标记某日完成过哪些计划；
- Habit 是独立表，完成状态通过 `/api/habits/:id/toggle` 切换；
- 周/月节奏图统计每日完成计划数量，并映射为 0-100 的展示值；
- 每日金句目前来自服务端内置数组。

### 7.5 模板

- 服务端首次启动时将 `server/src/data/mockData/templates.js` 写入 `templates` 表；
- 前端优先请求服务端模板；
- 请求失败或空数据时，`templateService.ts` 回退到 `src/data/templates.ts`；
- 修改模板结构时，需要同时检查前后端模板定义和初始化逻辑。

### 7.6 圈子与图片发布

1. `PostMomentScreen` 通过 Image Picker 选择最多 9 张图片。
2. `circlesApi.uploadImage` 以 FormData 上传到 `/api/circles/upload`。
3. Multer 写入 `server/uploads/`，服务端返回可访问 URL。
4. 发布接口保存动态正文、首图和图片数组。
5. 列表/详情通过 `circleController` 序列化为前端需要的结构。
6. 点赞、收藏、评论、回复会更新关系表，并在适用时创建通知。

地点推荐和热门话题仍来自后端 Mock 数据，不是持久化或外部服务结果。

### 7.7 实时通知

1. 客户端登录或恢复会话时，用 JWT 建立 Socket.io 连接。
2. 服务端握手中验证 JWT，并用用户 UUID 维护 `connectedUsers` 映射。
3. 社交或成就事件先写 `notifications` 表，再向在线用户的 socketId 推送 `new_notification`。
4. `NotificationContext` 统一监听事件、更新通知列表和未读数。
5. 离线用户重新进入页面时，通过 REST API 拉取数据库通知。

这是“数据库保证可追溯、WebSocket 提升实时性”的双通道设计。

## 8. 数据模型与标识规则

### 8.1 主要模型

- `User`：账号、手机号、密码摘要、头像、简介；
- `UserSetting`：用户提醒时间、勿扰时段、主题与字体偏好；
- `Feedback`：用户意见类型、内容、联系方式与处理状态；
- `Plan`：计划周期、打卡日期、打卡方式、提醒、里程碑；
- `PlanCheckIn`：计划每日打卡明细、数值和文字记录；
- `Habit`：日历页习惯项目及完成状态；
- `Template`：系统计划模板；
- `Badge`：用户成就解锁记录；
- `CircleMoment`：社交动态及计数；
- `Like`、`Collect`：用户与动态的关系；
- `Comment`：评论和基于 `parentId` 的回复；
- `Friendship`：关注/伙伴关系；
- `Notification`：站内通知、发送者及目标对象。

### 8.2 双 ID 规则

`User` 同时拥有两种 ID，这是理解后端逻辑的关键：

| ID            | 类型                | 用途                                                                       |
| ------------- | ------------------- | -------------------------------------------------------------------------- |
| `User.id`     | PostgreSQL 自增整数 | `plans`、`habits`、`notifications`、`badges`、动态作者等传统外键           |
| `User.userId` | UUID 字符串         | JWT 载荷、前端公开用户 ID、Socket 连接、Like/Collect/Friendship 的用户字段 |

因此很多路由需要先把 JWT 中的 UUID 转为内部整数 ID。新增查询或关联时，不要仅凭字段名 `userId` 推断其类型，必须查看对应 Model。

## 9. API 路由概览

所有业务接口以 `/api` 为前缀。

| 前缀             | 主要接口                                                                      |
| ---------------- | ----------------------------------------------------------------------------- |
| `/auth`          | 登录、注册、服务端退出、当前用户、资料更新、统计、公开用户查询、关注/取消关注 |
| `/plans`         | 计划 CRUD、打卡                                                               |
| `/templates`     | 模板列表、详情、分类                                                          |
| `/calendar`      | 月历、每日金句、日历更新占位接口                                              |
| `/habits`        | 习惯列表、创建、切换、删除                                                    |
| `/rhythm`        | 周/月节奏数据                                                                 |
| `/badges`        | 成就与进度                                                                    |
| `/circles`       | 动态列表/详情/发布、上传、点赞、收藏、评论、地点、话题、收藏列表              |
| `/buddies`       | 推荐伙伴                                                                      |
| `/notifications` | 列表、未读筛选、单条/全部已读、删除                                           |
| `/settings`      | 当前用户设置读取与更新                                                        |
| `/feedback`      | 登录用户提交意见反馈                                                          |

后端目前并未完全统一 HTTP 状态码：部分业务失败仍返回 HTTP 200，并通过 `success: false` 表达失败。前端必须同时检查 HTTP 结果和业务 `success`。

## 10. 环境配置与启动

### 10.1 环境要求

- Node.js：建议统一使用 20.x LTS；根 `package.json` 要求 `>=20`，README 写的是 `>=22.11`，EAS development 固定为 20.18，三者目前不一致；
- npm；
- PostgreSQL；
- iOS 开发需要 Xcode、CocoaPods；
- Android 开发需要 JDK、Android SDK；
- 真机联调时，手机和开发机需能访问同一局域网地址。

### 10.2 安装

```bash
npm install
cd server && npm install
```

### 10.3 后端配置

复制并填写：

```bash
cp server/.env.example server/.env
```

必填项包括：

- `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD`；
- `JWT_SECRET`；
- `JWT_EXPIRES_IN`；
- `PORT`、`NODE_ENV`。

不要依赖源码中的默认数据库密码。生产环境必须显式提供所有数据库变量与高强度 `JWT_SECRET`。

### 10.4 前端 API 地址

当前 Expo 客户端实际读取：

```env
EXPO_PUBLIC_API_URL=http://<开发机局域网IP>:3000/api
```

默认回退地址硬编码为 `http://192.168.0.101:3000/api`，换网络或换开发机后通常需要调整环境变量。`REACT_APP_API_URL` 和 `REACT_APP_TIMEOUT` 当前不会被 `src/api/config.ts` 使用。

### 10.5 启动命令

```bash
# 终端 1：后端
npm run backend

# 终端 2：Expo
npm start
```

其他常用命令：

```bash
npm run android
npm run ios
npm run start:tunnel
npm run start:localhost
npm run db:start
npm run db:stop
npm run db:status
```

`db:start/db:stop/db:status` 硬编码了 macOS PostgreSQL 18 安装路径，并要求 `sudo -u postgres`。其他系统或安装方式应改用本机 PostgreSQL 服务管理命令。

数据库结构由 Sequelize migration 管理。已有历史数据库首次接入时执行：

```bash
cd server
npm run db:baseline
npm run db:migrate
npm run db:verify
```

全新数据库不要执行 baseline，直接运行 `npm run db:migrate`。应用启动不再自动创建或修改表；`SEED_DEMO_DATA=true` 仅用于显式初始化演示社区数据。

## 11. 开发规范

### 11.1 分层与依赖方向

- Screen 负责页面编排，不直接复制底层 fetch；
- Feature Component 负责域内展示和交互，不访问无关业务；
- Hook 管理可复用状态和副作用；
- Context 只承载真正跨页面共享的状态；
- Service 提供稳定业务入口并组合 API、缓存或设备能力；
- API Module 负责端点和请求/响应类型；
- `apiClient` 是统一 HTTP 出口；
- 后端复杂路由优先采用 route → controller/service → data/model；
- 数据表或字段变化必须新增 migration，不应只修改 Model 或扩大启动时修补逻辑。

### 11.2 TypeScript 与 React

- 新代码应通过 `npx tsc --noEmit`；
- 避免用 `as any`、`as never` 掩盖导航或 API 类型问题；
- 导航参数统一维护在一份 RootStack 类型中，避免 `src/navigation` 与 `src/types` 漂移；
- Hook 依赖项必须完整，异步操作要处理 loading、失败和卸载清理；
- 可复用样式放入 `StyleSheet.create`，动态值可保留最小范围的数组样式；
- 领域派生值应从单一事实源计算，避免多个可写字段互相漂移。

### 11.3 后端与数据库

- 所有用户私有资源必须验证所有权；
- `req.userId` 是 JWT UUID，不是数据库整数主键；
- 入口处验证请求体、查询参数和上传文件；
- 业务错误应使用正确的 4xx/5xx 状态码，并保持统一响应结构；
- Schema 变更使用可回滚 migration；
- 启动初始化必须幂等，不得清空用户业务数据；
- 禁止恢复 `sequelize.sync()` 作为正式 Schema 演进手段；
- 新增关联时明确外键使用整数 ID 还是 UUID；
- 生产上传应迁移到对象存储，或至少补充配额、清理、备份和多实例策略。

### 11.4 格式与提交前检查

仓库配置：

- ESLint：`@react-native`；
- Prettier：单引号、尾逗号、单参数箭头省略括号；
- CI 目标分支：`main`、`dev`。

提交前建议执行：

```bash
npx tsc --noEmit
npm run format:check
npm run lint
npm test -- --runInBand
node --check server/src/index.js
```

涉及数据库时还应在隔离数据库中执行 migration 和核心接口联调。

## 12. 当前实际验证状态

以下结果来自 2026-07-17 对当前工作树的实际执行，不是历史文档结论。

| 检查                         | 结果 | 说明                                                           |
| ---------------------------- | ---- | -------------------------------------------------------------- |
| `npx tsc --noEmit`           | 通过 | 当前 TypeScript 工程无错误                                     |
| `npm run lint`               | 通过 | 0 error、13 个非阻断 warning                                   |
| `npm test -- --runInBand`    | 通过 | 2 suites、7 tests                                              |
| `cd server && npm test`      | 通过 | 连续日期、日期与打卡类型校验 4 tests                           |
| 后端全部 JS `node --check`   | 通过 | 新增 migration、脚本、Model、路由均通过                        |
| `npm run web:build`          | 通过 | bundle 约 1.41 MiB，仅保留体积 warning                         |
| `npm run db:migrate:status`  | 通过 | 10 条 migration 均为 `up`                                      |
| `npm run db:verify`          | 通过 | 字段、CHECK、索引、UNIQUE、孤儿记录和行数均正常                |
| 空 PostgreSQL 全量 migration | 通过 | 隔离库从零执行 10 条 migration，`db:verify` 通过并已删除测试库 |
| `npm run test:api`           | 通过 | 设置、反馈、排序、打卡、统计、退出失效均通过且测试数据已清理   |

数据库当前数据量为 users 11、plans 12、plan_check_ins 19、habits 1、notifications 35、templates 6、circle_moments 8、likes 5、collects 4、comments 18、user_settings 0、feedbacks 0。迁移前后原业务表行数未减少。

## 13. 已知问题与解决方案

### 已在本轮解决

- 服务启动不再清空 `badges`；
- 服务启动不再执行 `sequelize.sync()` 或手写 ALTER；
- `users` 表 93 个重复 UNIQUE 已精简为 2 个；
- 19 条历史打卡已迁移到 `plan_check_ins`；
- 连续打卡统计已改为真正的当前连续日期；
- 数值打卡和文字日记已贯通前端输入、API 和数据库；
- 计划编辑不再接受或重建打卡日期，数值/日记明细在编辑后保持不变；
- 日历可展示选中日期的数值/日记摘要，并可编辑当天明细；
- 用户设置已由 `user_settings` 跨设备持久化；提醒开关会重建/取消本地通知，勿扰时段会抑制前台通知并将定时提醒延后到勿扰结束，字号由全局 `AppText` 按设置缩放；
- “清除所有数据”已改为后端事务删除，保留账号但清理业务数据、本地提醒并安全退出；
- 计划拖动顺序已由 `sortOrder` 和批量事务接口跨设备持久化；
- 意见反馈已真实写入 `feedbacks`，未接入短信前不再展示伪手机号绑定成功；
- 退出登录会递增 `tokenVersion`，旧 JWT 和 WebSocket 握手立即失效；
- 登录/注册已增加进程内 IP/账号限流，匿名 `/auth/user?id=` 内部 ID 枚举接口已删除；
- 401 会统一清理 SecureStore、AuthContext 和 WebSocket 状态；
- CI 已加入 PostgreSQL 空库 migration、结构验证和安全 API 冒烟；
- TypeScript、测试、lint 和 Web 构建阻断项已修复。

### P1：核心数据语义和上线安全

#### 13.1 日历 PATCH 接口不持久化

位置：`PATCH /api/calendar`。

当前接口仅把请求数据原样返回，随后前端重新加载时，日历仍根据 Plan 打卡数据计算，更新不会保留。

解决方案：明确产品语义：

- 如果日历只能反映计划打卡，删除该写接口和前端 `updateDayActivity`；
- 如果允许独立日历事件，新增 CalendarEvent 模型、migration、所有权校验和 CRUD。

#### 13.2 Habit 完成状态不是按日记录

`habits.completed` 是永久布尔值，无法表示“某个习惯在某天是否完成”，也不能计算连续习惯天数。

解决方案：新增 `habit_check_ins(habitId, checkInDate)` 和复合唯一约束；Habit 表保留定义信息，日历状态从每日记录派生。

#### 13.3 认证与生产配置仍不安全

- 注册流程尚未接入短信供应商，不能证明手机号归属；
- 当前限流为单进程内存实现，多实例部署时应迁移到 Redis/API 网关。

解决方案：上线前接入服务端验证码和共享限流存储。生产环境目前已强制数据库配置、32 位以上 JWT 密钥和 `CORS_ORIGINS` 白名单。

#### 13.4 兼容打卡数组仍需最终下线

`plan_check_ins` 已是数据库事实源。通用计划创建/更新接口已忽略 `completedDate`，仅专用打卡接口为兼容旧客户端投影更新该数组。

解决方案：待所有客户端升级后运行一致性检查，再用独立 migration 删除数组字段；在此之前任何打卡写入必须继续通过统一数据访问方法，不能绕过双写。

### P2：容易形成隐性缺陷或维护成本

#### 13.5 导航类型和真实参数不一致

- `CreatePlanScreen` 支持 `planId`，但公共 RootStack 类型只声明 `templateId`；
- 多处使用 `as never` 或 `any` 绕过导航检查；
- `NotificationsScreen` 从根 Stack 直接导航到嵌套 Tab 的 `Circles`，目标层级不明确。

解决方案：合并并导出唯一导航类型；补上 `planId`；嵌套导航使用 `navigate('Main', { screen: 'Circles' })` 或直接进入 `CircleDetail`。

#### 13.6 通知状态存在重复实现

项目同时存在：

- `NotificationContext`；
- `src/hooks/useNotifications.ts`；
- deprecated 的 `useNotificationState.ts`；
- 当前未被页面调用的 `useNotificationPolling.ts`。

影响：未来容易重复注册 WebSocket 监听、产生多个通知列表和状态不一致。

解决方案：以 `NotificationContext` 为唯一全局状态入口；确认无调用后删除旧 Hook，或只保留向 Context 转发的兼容导出。

#### 13.7 圈子 DTO Mapper 未接入且类型已漂移

`CircleMapper` 没有实际调用者，DTO 使用 snake_case，但当前后端直接返回前端领域结构。为通过类型检查补齐的 `user_id` 仍不代表真实运行合同已经统一。

解决方案：二选一：

- 若后端合同保持当前结构，删除未使用 DTO/Mapper；
- 若要建立明确 API 合同，统一由 API 层使用 Mapper，并为 DTO/领域转换补测试。

#### 13.8 API 与部分历史文档已过期

`API_DOCS.md` 仍描述 `USE_MOCK` 和不存在的 `src/api/mock-server.ts`；`server/README.md` 仍偏向早期 Mock 数据结构。当前状态以本文和 `SYSTEM_AUDIT_AND_ROADMAP.md` 为准。

解决方案：以当前 route 和 API module 自动整理接口表；历史进度文档增加日期与 commit，避免把旧结论当成持续保证。

#### 13.10 环境文件已被 Git 跟踪

`.gitignore` 现在忽略 `.env*`，但 `.env.development` 和 `.env.production` 已经是跟踪文件。它们当前主要是公开 API 地址，不等同于服务端秘密，但容易让团队误以为所有环境文件均未入库。

解决方案：明确区分“可提交的公开客户端配置”和“本机/秘密配置”。推荐提交 `.env.example`，由本地或 CI 注入实际地址；任何密钥禁止使用 `EXPO_PUBLIC_`。

#### 13.11 安全与生产化缺口

- 注册流程尚未验证手机号归属；当前登录/注册限流为单进程内存实现；
- 数据库开发默认密码硬编码；
- 本地上传没有完整配额、清理和对象存储策略；
- 多个业务失败使用 HTTP 200；
- 当前 API 冒烟依赖人工启动本机服务，CI 尚未配置隔离 PostgreSQL 集成测试。

解决方案：上线前继续完成服务端验证码、共享限流、上传限制、标准状态码和更广的所有权集成测试。CORS 白名单、生产秘密配置检查和内部 ID 枚举接口删除已完成。

## 14. 复杂度热点

修改以下文件前应先追踪完整调用链，并优先做小范围拆分而不是继续堆积：

- `src/features/circle/components/CircleDetailContent.tsx`；
- `src/screens/ProfileScreen.tsx`；
- `src/screens/PostMomentScreen.tsx`；
- `server/src/controllers/circleController.js`；
- `src/screens/CreatePlanScreen.tsx`；
- `src/screens/AuthScreen.tsx`；
- `src/features/circle/components/PostMomentDrawers.tsx`；
- `server/src/data/database.js`；
- `server/src/utils/initDatabase.js`；
- `server/src/routes/auth.js`、`server/src/routes/plans.js`。

复杂并不自动意味着需要重构。只有当任务触及对应职责、测试能够覆盖、且拆分能减少实际耦合时再改结构。

## 15. 新任务开始前的检查清单

1. 阅读本文件相关章节，确认功能事实源和数据所有者。
2. 执行 `git status --short`，不要覆盖已有工作树改动。
3. 从 Screen/route 开始，沿 Hook → Service → API → route/controller → data/model 追踪完整路径。
4. 确认用户 ID 是整数还是 UUID。
5. 涉及 Schema 时先设计 migration 和回滚。
6. 涉及通知时区分设备本地提醒与服务端实时通知。
7. 涉及日历时确认数据来自 Plan 打卡还是独立事件。
8. 涉及模板时检查服务端 Seed 与前端本地兜底两份定义。
9. 修改共享组件前检查所有调用页面，避免局部需求影响全局。
10. 完成后执行与改动风险相称的类型、lint、测试和接口验证。

## 16. 推荐阅读顺序

新成员建议按以下顺序阅读代码：

1. `README.md`、`package.json`；
2. `index.js`、`App.tsx`、`src/navigation/AppNavigator.tsx`；
3. `src/contexts/AuthContext.tsx`、`NotificationContext.tsx`；
4. `src/api/client.ts`、`src/api/config.ts`；
5. 计划主链：`PlanScreen.tsx` → `usePlanManagement.ts` → `planService.ts` → `plans.ts`；
6. 后端入口：`server/src/index.js`、`middleware/auth.js`；
7. 计划后端：`routes/plans.js` → `data/database.js` → `models/Plan.js`；
8. 圈子链路：`CirclesScreen.tsx` / `PostMomentScreen.tsx` → `circles.ts` → `routes/circles.js` → `circleController.js`；
9. 实时链路：`websocketService.ts` → `socketManager.js` → 通知创建逻辑；
10. 数据库：`models/index.js`、`initDatabase.js`、`server/migrations/`；
11. 工程配置：`app.json`、`eas.json`、Android/iOS 入口、`.github/workflows/ci.yml`；
12. 最后再读历史优化文档和 `stitch_puddingplan1.0/` 设计原型。

## 17. 文档维护规则

以下变更发生时应同步更新本文档：

- 新增或移除核心业务模块；
- 修改导航结构、全局 Context 或 API 分层；
- 修改 User ID、数据表、关联或 migration 策略；
- 修改认证、通知、提醒或上传架构；
- 修复本文件列出的已知问题；
- Node/Expo/React Native/PostgreSQL 版本发生变化；
- 开发、构建、测试或 CI 命令变化。

更新时应写明核对日期和 commit，避免再次出现“历史结论看起来像当前事实”的问题。
