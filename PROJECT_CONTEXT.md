# 布丁计划项目上下文

> 版本：`1.0.0`
>
> 最后核对：2026-09-04
>
> 当前交付：本地全栈演示产品，Web 为主要验收端

## 1. 产品定位

布丁计划（PuddingPlan）是一个轻量、无压的目标与习惯管理产品。核心闭环是：

1. 创建计划或快捷习惯。
2. 设置重复规则与提醒。
3. 按本地自然日完成打卡或补签。
4. 在日历、节奏图、历史和徽章中查看成长。
5. 通过动态、关注和成长搭子获得低压力互动。

本仓库交付的是可真实写入 PostgreSQL 的本地演示版，不把未验证的原生构建、云服务或商业化能力描述为现成功能。

## 2. 技术架构

### 前端

- React 19 + React Native 0.83 + Expo 55。
- `src/` 在 Web、iOS、Android 间共享。
- Web 入口为 `index.web.js`，由 `webpack.config.js` 构建并在 `8080` 端口开发运行。
- 导航入口为 `src/navigation/AppNavigator.tsx`。
- 全局账号、设置和通知状态分别位于 `AuthContext`、`SettingsContext`、`NotificationContext`。
- Web 凭据使用 `localStorage`，原生端使用 `expo-secure-store`，统一封装在 `src/services/storage.ts`。

### 后端

- Express 提供 `/api` REST API，Socket.io 提供实时站内通知。
- Sequelize 连接 PostgreSQL，模型位于 `server/src/models/`。
- 服务入口 `server/src/index.js` 只验证迁移后的结构并补齐模板，不运行 `sync({ alter: true })`。
- 上传由 Multer 写入 `server/uploads/`，真实文件类型由已安装的 `file-type` 校验。
- JWT 同时校验用户的 `tokenVersion`；退出、改密、清数据和注销可使旧会话失效。

### 关键入口

| 路径                                     | 职责                             |
| ---------------------------------------- | -------------------------------- |
| `App.tsx`                                | 前端 Provider 与应用入口         |
| `src/api/config.ts`                      | API 地址和端点常量               |
| `src/api/client.ts`                      | 统一请求、超时、鉴权和错误处理   |
| `src/utils/date.ts`                      | 前端本地自然日工具               |
| `src/services/notificationScheduler.ts`  | 移动端计划/习惯提醒与勿扰处理    |
| `server/src/index.js`                    | HTTP、Socket.io、路由挂载和启动  |
| `server/src/data/database.js`            | 主要数据访问与聚合逻辑           |
| `server/src/utils/checkInUtils.js`       | 后端日期、补签边界和连续天数规则 |
| `server/src/services/communityAccess.js` | 社区可见性、举报和拉黑统一判断   |
| `server/migrations/`                     | 数据库结构演进的唯一入口         |

## 3. 运行与网络约束

- 数据库名默认为 `pudding_plan_demo`；重置、种子和治理脚本均对该名称做精确保护。
- Web 未设置 `EXPO_PUBLIC_API_URL` 时，自动连接当前页面主机的 `3000` 端口。
- 原生端没有硬编码局域网地址，必须通过 `EXPO_PUBLIC_API_URL` 提供可访问的后端 URL。
- 开发 CORS 默认接受 localhost；生产环境必须显式设置 `CORS_ORIGINS`。
- API 响应固定为 `{ success, data, message, error }`，失败使用对应 HTTP 状态码。

常见状态码：

- `200`：读取、更新或删除成功。
- `201`：注册、创建资源、提交举报等创建成功。
- `400`：参数、日期、密码或业务格式不合法。
- `401`：未登录、Token 无效或已失效。
- `403`：资源不可见、被拉黑或跨用户越权。
- `404`：资源不存在或已删除。
- `409`：重复关系、状态冲突、暂停/停用资源不可打卡。
- `429`：登录、注册或搭子鼓励超过频率限制。
- `500`：未预期的服务端错误。

## 4. 核心数据模型

### 用户与设置

- `users`：内部整数 `id`、对外 UUID `userId`、手机号、密码哈希、昵称、头像、简介、1–3 个 `goalTags`、`tokenVersion`。
- `user_settings`：通知开关、默认提醒时间、勿扰时段、字体大小；`theme` 仅允许 `light`。
- `feedbacks`：用户反馈及处理状态。

### 计划与习惯

- `plans`：计划内容、类型、周期、提醒、里程碑、排序和 `active / paused / archived` 状态。
- `plan_check_ins`：计划打卡唯一事实源，按 `planId + checkInDate` 唯一；可保存数值或日记内容。
- `habits`：标题、星期规则 `weekdays`、可选提醒、开始日期、启用状态和排序。
- `habit_check_ins`：快捷习惯打卡事实源，按 `habitId + checkInDate` 唯一。
- `templates`：本地模板库，由种子与启动初始化逻辑维护。
- `badges`：用户徽章解锁状态。

旧字段 `plans.completedDate` 和 `habits.completed` 已由迁移校验后移除，禁止恢复双写。

### 社区与关系

- `circle_moments`：动态、分类、图片、地点和 `public / buddies / private` 可见性。
- `comments`：评论与一级回复。
- `likes`、`collects`：点赞与收藏，均有用户/动态唯一约束。
- `follows`：单向关注，不代表搭子关系。
- `buddy_relationships`：双向成长搭子请求，状态为 `pending / accepted`。
- `user_blocks`：单向拉黑记录；任一方向拉黑都会造成双方内容隔离。
- `content_reports`：动态或评论举报，状态为 `pending / rejected / actioned`。
- `notifications`：关注、搭子、鼓励、点赞、评论、回复等站内通知。

## 5. 核心业务规则

### 本地自然日

- 业务日期统一为本地 `YYYY-MM-DD`，不得使用 UTC `toISOString()` 截取日期。
- 允许今天及此前 6 个自然日，共 7 个日期窗口。
- 禁止未来日期；后端是最终校验边界。
- 连续天数可从今天或昨天结束，避免当天尚未打卡时提前断签。

### 计划

- `active`：可显示在今日重点、可提醒、可打卡。
- `paused`：停止提醒并退出今日重点，不可打卡，可恢复。
- `archived`：只在历史区域显示，不可打卡，可恢复。
- 三种打卡类型：盖章不接受附加值；数值必须提供非负数值；日记必须提供非空文字。
- 修改计划不得覆盖历史打卡明细。

### 快捷习惯

- `weekdays` 使用 `0–6` 表示周日至周六，必须非空且不重复。
- 只允许在开始日期之后、启用状态下、且符合重复星期的日期打卡。
- 停用保留历史记录，但停止今日展示和提醒。
- 当前连续天数按该习惯自己的重复星期计算。

### 社区访问

- `public`：除拉黑和举报隐藏外，所有登录用户可见。
- `buddies`：作者本人和已接受搭子可见。
- `private`：仅作者本人可见。
- 列表、详情、评论、点赞人、收藏和通知使用同一权限判断。
- 举报动态或评论后，目标立即对举报者隐藏。
- 拉黑会解除双方关注和搭子关系、删除双方相关通知，并阻止后续互动。
- 用户只能删除自己的动态和评论。

### 上传

- 动态最多 4 张图片，每张最大 5 MB；头像最大 2 MB。
- 扩展名不作为信任依据，服务端读取文件内容判断真实 MIME。
- 动态只能引用当前用户刚上传且仍存在的相对 `/uploads/...` 地址。
- 发布失败可清理未使用图片；删除动态、清除数据或注销账号会清理关联文件。

### 搭子与通知

- 推荐只读取公开资料中的目标标签，不读取私密计划。
- 请求可发送、接受、拒绝、取消；已接受关系可解除。
- 鼓励是一次性通知，不提供私聊或会话记录，并受服务端频率限制。
- Web 仅展示站内通知；系统提醒只在支持的原生环境调度。

## 6. 页面与功能入口

| 页面      | 主要能力                                                 |
| --------- | -------------------------------------------------------- |
| 登录/注册 | 手机号密码、一键演示账号、协议确认                       |
| 日历      | 月历、今日重点、习惯 CRUD、补签、近 7 日状态             |
| 计划      | 活跃/暂停/归档分区、排序、编辑、三种打卡                 |
| 圈子      | 动态流、推荐搭子入口、发布、互动和举报                   |
| 搭子中心  | 推荐、收到请求、发出请求、我的搭子、鼓励                 |
| 通知      | 互动、关注、搭子请求、接受和鼓励通知                     |
| 我的      | 统计、徽章、活动历史、收藏                               |
| 设置      | 资料、头像、提醒、勿扰、字体、黑名单、改密、清数据、注销 |

## 7. 数据库迁移与演示数据

- `server/migrations/20260904000100-complete-demo-product-v1.js` 完成 v1.0 模型迁移、旧关系拆分和约束建立。
- 迁移历史通过 `SequelizeMeta` 管理，不允许用模型同步替代正式迁移。
- `demo:reset` 只重建 `pudding_plan_demo`。
- `demo:seed` 先执行全部迁移，再清空演示数据并写入三个确定账号。
- `db:verify` 检查必需表、字段、索引、约束、旧结构残留和外键孤儿。

## 8. 开发约束

- 新业务日期必须复用 `src/utils/date.ts` 或 `server/src/utils/checkInUtils.js`。
- 社区新入口必须复用 `communityAccess`，不能只在列表层过滤。
- 计划和习惯打卡只能写各自 check-in 表，不能新增聚合布尔或日期数组。
- 所有 API 使用共享 `ok` / `fail` 响应工具。
- 不提交 `.env`、`.expo`、上传内容、构建目录或临时检查脚本。
- 不增加仅服务未来需求的抽象；优先复用现有模型、服务和组件。
- 不把 Android/iOS 源码存在等同于已通过真机或商店验证。

## 9. 验证顺序

```bash
npm run typecheck
npm test -- --runInBand
npm run lint
npm run format:check
npm run web:build
npm run --prefix server test
npm run --prefix server db:migrate:status
npm run --prefix server db:verify
```

启动后端后执行：

```bash
npm run --prefix server test:api
```

最后在 Web 完成登录、计划、习惯、社区、搭子、通知、设置、清数据和注销的交互验收，再重新运行 `demo:seed` 恢复确定性数据。

## 10. 已知生产限制

- 本地磁盘上传不支持多实例、CDN、备份和跨主机共享。
- 登录/注册限频与 Socket.io 在线用户表是进程内状态，多实例部署需外部共享存储。
- 举报依赖命令行脚本，没有管理员身份、审核后台和审计工作流。
- 没有短信验证、找回密码、邮件服务、对象存储、第三方内容审核或生产监控。
- 没有 AI、会员、支付、私聊、小组件和多端云同步。
- Web 不支持系统通知；原生通知、定位权限、后台行为和深链仍需真机验证。
- 尚未进行 APK/AAB、App Store、Google Play 或公开互联网部署验证。
