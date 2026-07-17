# PuddingPlan 系统审计、数据库优化与交付路线图

> 审计日期：2026-07-17
> 适用范围：React Native / Expo 客户端、Webpack Web、Express / Sequelize 后端、PostgreSQL、Socket.io
> 参照文档：`PROJECT_CONTEXT.md`
> 排期假设：1 名全栈开发者，工作日投入；日期为建议目标，不含产品需求反复、应用商店审核和外部服务采购时间

## 1. 结论摘要

当前项目已具备可运行的计划、日历、成就、圈子、通知和个人中心雏形，前后端主链路完整，但此前数据库主要依赖 `sequelize.sync()` 在启动时隐式维护，导致 Schema 不可审计，并在 `users` 表累计出 93 个重复 UNIQUE 约束。打卡记录保存在 `plans.completedDate` 数组中，也限制了唯一性、明细扩展和统计查询。

本轮已完成第一阶段高优先级治理：

- 建立 Sequelize migration 基线，修复 `.sequelizerc`，数据库结构改由显式 migration 管理；
- 新增规范化 `plan_check_ins` 表，迁移全部 19 条历史打卡；
- 清理 `users` 表 93 个重复 UNIQUE，仅保留手机号和公开 UUID 两个标准唯一约束；
- 补齐核心外键、唯一约束、CHECK 约束和查询索引；
- 删除启动时 `sequelize.sync()`、手写 ALTER 和无条件清空徽章的逻辑；
- 修复连续打卡算法，将“不同日期总数”改为真正的当前连续天数；
- 后端支持盖章、数值、文字三种打卡明细，旧 `completedDate` 暂时双写兼容；
- 前端日历页已为数值打卡和文字日记提供真实输入与提交闭环；
- 全新 PostgreSQL 已从零执行全部 10 条 migration 并通过结构验证；
- 设置页提醒、勿扰、主题和字体已通过 `user_settings` 与 API 持久化；
- logout 已具备服务端令牌版本失效，401 会统一清理客户端会话；
- CI 已覆盖完整前端验证、PostgreSQL 空库迁移、DB verify 和 API smoke；
- 计划排序已持久化，意见反馈已由伪 Toast 改为真实数据库记录；
- TypeScript、Jest、后端单测、ESLint（0 error）、Web 生产构建和真实 API 冒烟已通过。

当前系统可以继续开发，但尚不建议直接作为生产正式版上线。剩余主要风险集中在短信验证码与限流、习惯/日历语义、上传存储、API 一致性、权限集成测试和可观测性。

## 2. 当前系统架构评估

### 2.1 总体架构

```text
React Native / Expo / Web
  Screen
    -> Feature Component
    -> Hook / Context
    -> Service
    -> API Module
    -> apiClient
         |
         v
Express Route / Middleware
    -> Controller / Service（圈子、成就）
    -> data/database.js（计划、日历、统计等）
    -> Sequelize Model
         |
         v
PostgreSQL

社交/成就事件 -> Notification 表 -> Socket.io -> NotificationContext -> UI
计划提醒配置 -> Expo Notifications -> 设备本地通知
```

### 2.2 分项评价

| 维度       | 当前评价       | 主要优点                                        | 主要风险                                   | 建议目标                                  |
| ---------- | -------------- | ----------------------------------------------- | ------------------------------------------ | ----------------------------------------- |
| 业务完整度 | 中上           | 核心页面和 API 已贯通                           | 多个页面仍为局部 Mock 或本地状态           | 先完成数据闭环，再扩展新功能              |
| 前端分层   | 中上           | Screen/Feature/Hook/Service/API 已形成          | 导航类型、通知状态和 DTO 存在重复          | 收敛单一入口和单一类型定义                |
| 后端分层   | 中             | 圈子已有 controller，数据访问集中               | `database.js` 同时承担仓储、聚合和业务规则 | 按真实改动逐步拆 service/repository       |
| 数据库     | 中上（本轮后） | migration、约束、索引和打卡明细已建立           | 双 ID、兼容数组、Habit 模型仍有历史债      | 逐步移除兼容字段并补每日记录模型          |
| 安全       | 中             | JWT 版本失效、bcrypt、生产 CORS/秘密检查已建立  | 手机号未验证、缺限流、兼容接口可枚举       | 接入短信、限流并收敛兼容接口              |
| 性能       | 中             | 数据量小时响应可接受，核心索引已补              | 聚合统计仍会随数据量线性增长               | 建立慢查询基线，再决定缓存/汇总表         |
| 测试       | 中上           | CI 已运行空库 migration、DB verify 和 API smoke | 缺跨用户所有权和并发测试                   | 增加双用户权限与并发幂等场景              |
| Web 支持   | 可构建         | 生产构建已恢复                                  | 首包 1.42 MiB、图标字体较大                | 若 Web 是正式目标，再做按需图标和路由拆包 |
| 可观测性   | 低             | 有控制台日志                                    | 无结构化日志、指标、链路和错误平台         | 上线前补 requestId、错误采集和健康检查    |

## 3. 数据库审计与优化结果

### 3.1 迁移前主要问题

1. 数据库没有 `SequelizeMeta`，说明真实环境不是由 migration 持续演进。
2. 服务启动执行 `sequelize.sync()`，导致同一字段不断生成重复 UNIQUE。
3. `users` 表共有 93 个 UNIQUE 约束，大量重复作用于 `phone` 和 `userId`。
4. 启动初始化会无条件删除 `badges`，存在真实数据丢失风险。
5. 初始 migration 只覆盖部分核心表，社交表主要依赖自动同步创建。
6. 打卡日期存放在 `plans.completedDate DATE[]`，无法自然表达数值、日记、创建时间等明细。
7. 部分关系缺少外键，部分删除规则与业务语义不一致。
8. 核心列表、未读通知、评论和节奏查询缺少明确索引策略。

迁移前数据质量检查结果良好：未发现孤儿外键、重复点赞/收藏/关注/徽章、自关注、负计数、空评论、非法计划或重复打卡日期。因此本轮不需要清洗用户业务数据，只需要结构治理。

### 3.2 优化后核心模型

```text
users
  id PK (内部整数)
  userId UNIQUE (公开 UUID)
  phone UNIQUE
    |
    +--< plans --< plan_check_ins
    +--< habits
    +--< notifications
    +--< badges
    +--< circle_moments --< comments

users.userId
    +--< likes >-- circle_moments
    +--< collects >-- circle_moments
    +--< friendships (userId, friendId)
```

`plan_check_ins` 字段：

| 字段                  | 类型          | 约束/用途                         |
| --------------------- | ------------- | --------------------------------- |
| `id`                  | integer       | 主键                              |
| `planId`              | integer       | 外键到 `plans.id`，计划删除时级联 |
| `checkInDate`         | date          | 用户语义日期，不受时区时间戳影响  |
| `numericValue`        | decimal(12,2) | 数值型打卡，可空                  |
| `note`                | text          | 文字日记，可空，接口限制 5000 字  |
| `createdAt/updatedAt` | timestamptz   | 审计时间                          |

唯一索引 `("planId", "checkInDate")` 保证同一计划同一天最多一条打卡；重复提交会更新可选明细而不是增加重复记录。

### 3.3 关系和删除规则

| 关系                            | 删除规则     | 原因                                          |
| ------------------------------- | ------------ | --------------------------------------------- |
| User -> Plan/Habit/Badge/Moment | CASCADE      | 主体删除后私有业务数据不应成为孤儿            |
| Plan -> PlanCheckIn             | CASCADE      | 打卡记录依附计划                              |
| Moment -> Like/Collect/Comment  | CASCADE      | 动态删除后互动失去业务意义                    |
| User -> Like/Collect/Friendship | CASCADE      | 公开 UUID 关系随用户删除                      |
| Notification.sender -> User     | SET NULL     | 保留接收者历史通知，但发送者可为空            |
| Comment.parent -> Comment       | 当前模型关联 | 后续应确认父评论删除时回复的保留/级联产品语义 |

### 3.4 完整性约束

已建立或标准化：

- `users.phone` 11 位数字格式；
- `users.userId` UUID 格式；
- `plans.totalDays > 0`；
- `plans.type IN (0,1,2)`；
- 动态点赞/评论计数不得为负；
- 评论去除首尾空白后不得为空；
- 关注关系不得指向自己；
- 模板时长必须大于 0；
- 通知目标类型只能为空、`moment` 或 `comment`；
- 徽章 `(userId, badgeKey)` 唯一；
- 点赞、收藏、关注和打卡关系均有复合唯一约束。

### 3.5 索引策略

当前索引针对实际查询路径建立，不为低选择性字段盲目加索引：

| 查询场景            | 索引                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| 用户计划/习惯       | `plans_user_id_idx`、`habits_user_id_idx`                            |
| 某日或日期范围打卡  | `plan_check_ins_date_idx`                                            |
| 计划某日幂等打卡    | `plan_check_ins_plan_date_unique`                                    |
| 用户通知时间线      | `notifications_user_created_idx`                                     |
| 用户未读通知        | 部分索引 `notifications_user_unread_created_idx WHERE read=false`    |
| 动态作者/发布时间线 | `circle_moments_author_created_idx`、`circle_moments_created_at_idx` |
| 评论时间线/回复     | `comments_moment_created_idx`、`comments_parent_id_idx`              |
| 点赞和收藏列表      | `likes_moment_created_idx`、`collects_user_created_idx`              |
| 好友反向查询        | `friendships_friend_status_idx`                                      |
| 模板筛选            | category、difficulty 索引                                            |

后续只有在 `EXPLAIN (ANALYZE, BUFFERS)` 或慢查询日志证明必要时，才增加覆盖索引、汇总表或缓存。

### 3.6 数据迁移与验证结果

完整备份：

```text
/tmp/pudding_plan_pre_optimization_2026-07-16T09-00-55-795Z.dump
```

迁移后数据量：

| 表             | 行数 |
| -------------- | ---: |
| users          |   11 |
| plans          |   12 |
| plan_check_ins |   19 |
| habits         |    1 |
| notifications  |   35 |
| badges         |    0 |
| templates      |    6 |
| circle_moments |    8 |
| likes          |    5 |
| collects       |    4 |
| friendships    |    0 |
| comments       |   18 |

验证结论：原业务表行数未减少，19 条历史打卡全部迁移，无孤儿记录，`users` UNIQUE 精简为 2 个，10 条 migration 状态均为 `up`；最新结构已在隔离空库从零验证。

## 4. 后端改造说明

### 4.1 启动流程

`initDatabase` 现在只负责：

1. 验证数据库连接；
2. 验证必需表已经由 migration 建立；
3. 在模板表为空时初始化系统模板；
4. 仅在 `SEED_DEMO_DATA=true` 时显式写入演示社区数据。

启动过程不再 `sync()`、不再 ALTER Schema、不再删除徽章数据。生产部署应在启动应用前单独执行 migration。

### 4.2 打卡数据访问

- 计划列表/详情通过关联 `PlanCheckIn` 返回 `checkInRecords`；
- 为兼容现有客户端，后端仍组装 `completedDate`；
- 创建或更新旧格式计划时，同步写入打卡明细；
- 新打卡在事务中写 `plan_check_ins`，并同步兼容数组；
- 同一计划同日重复请求保持幂等；
- 统计、月历、周节奏、月节奏已改为查询规范化表；
- 当前连续天数只从今天或昨天向前计算连续日期。

### 4.3 API 合同

```http
POST /api/plans/:id/check-in?date=YYYY-MM-DD
Authorization: Bearer <token>
Content-Type: application/json

{}
```

数值打卡：

```json
{ "numericValue": 12.5 }
```

文字日记：

```json
{ "note": "今天按计划完成，并记录了感受。" }
```

计划响应新增可选字段：

```json
{
  "completedDate": ["2026-07-16"],
  "checkInRecords": [
    {
      "date": "2026-07-16",
      "numericValue": 12.5,
      "note": null
    }
  ]
}
```

### 4.4 运维命令

已有数据库首次接入 migration：

```bash
cd server
npm run db:baseline
npm run db:migrate
npm run db:verify
```

新数据库不应手工 baseline，应从第一条 migration 顺序执行：

```bash
cd server
npm run db:migrate
```

日常验证：

```bash
npm run db:migrate:status
npm run db:verify
npm test
```

后端运行时的真实 API 冒烟：

```bash
cd server
npm start
# 另一个终端
npm run test:api
```

`test:api` 会创建临时测试账号和计划，验证注册、计划、重复打卡、统计、日历、节奏和徽章接口，最后自动清理测试账号。

## 5. 前端改造与用户体验

### 5.1 已完成

- `Plan` 类型新增 `checkInRecords`；
- API、Service、Hook 支持可选数值和文字打卡参数；
- 日历“今日重点”根据计划类型显示“点击盖章 / 记录数值 / 写下日记”；
- 数值计划弹出输入框，校验非负有限数字；
- 日记计划弹出多行输入框，限制 5000 字；
- 提交期间禁用按钮并显示 loading；
- 打卡成功后刷新计划和月历，重复打卡由服务端返回明确提示。
- 通用计划编辑已与打卡事实解耦，即使旧客户端提交 `completedDate` 也不会重建或丢失明细；
- 选中历史日期时展示数值/日记摘要，当天记录可重新打开编辑；
- 设置页配置可由服务端读取和更新；
- 提醒开关、每日提醒和跨夜勿扰已接入本地通知调度，全局文本已通过 `AppText` 应用字号缩放；清除数据已改为真实后端事务；
- logout 后旧 JWT 失效，401 会清理 SecureStore 和客户端认证状态。
- 计划拖动顺序会通过批量事务接口持久化；
- 意见反馈真实落库，未接入短信前不再展示伪手机号绑定成功。

### 5.2 仍需改善

- 独立打卡历史页仍按日期聚合计划名，完整正文目前在日历选中日期中查看；
- 数值打卡缺少单位、目标值、趋势图和输入精度配置；
- 日记支持当天编辑，但仍缺删除、图片和隐私控制；
- 空状态、错误重试和无障碍标签覆盖不完整；
- Web 首包较大，应在正式支持 Web 时做路由懒加载和图标按需加载。

## 6. 性能评估

### 6.1 当前可接受部分

- 当前数据量很小，规范化后核心查询均有可利用索引；
- 用户统计并行查询计划、习惯和社交计数；
- 月历和节奏只查询指定日期范围，不再加载全部计划数组后逐条扫描；
- 未读通知使用部分索引，适合高频查询；
- API 客户端已有 10 秒超时，页面普遍有 loading/refresh 状态。

### 6.2 风险与触发条件

| 风险                     | 何时出现                | 优化方式                                |
| ------------------------ | ----------------------- | --------------------------------------- |
| 用户统计多次扫描打卡记录 | 单用户达到数万条打卡    | SQL GROUP BY 聚合或日汇总表             |
| 动态计数与关系表可能漂移 | 并发点赞/评论或异常中断 | 单事务原子增减，定期校准任务            |
| 通知列表无限增长         | 用户通知达到数万条      | 游标分页、归档、保留策略                |
| 本地上传占满磁盘         | 长期运行或多实例        | 对象存储、配额、生命周期清理            |
| Web 包体积大             | 弱网首次加载            | 路由拆包、按需图标、移除非 Web 原生模块 |
| 控制台日志过多           | 生产高并发              | 结构化日志、级别、采样和脱敏            |

不要预先引入 Redis 或复杂缓存。先建立接口耗时、数据库慢查询和错误率基线，在证据显示瓶颈后再优化。

## 7. 未完成功能与交付计划

### 7.1 P0：上线前必须完成

| 功能/问题      | 具体需求                             | 技术路径                                        | 预计工时 | 建议交付   |
| -------------- | ------------------------------------ | ----------------------------------------------- | -------: | ---------- |
| 认证安全       | 真实验证码、多实例共享限流           | 服务端验证码表/缓存、短信供应商、Redis/API 网关 |   3-5 天 | 2026-07-24 |
| API 状态码     | 业务失败不再统一 HTTP 200            | 统一错误处理中间件和错误类型                    |   2-3 天 | 2026-07-31 |
| 所有权集成测试 | 防止跨用户读写计划、习惯、通知、动态 | 隔离测试库 + supertest/内置 fetch + migration   |   3-4 天 | 2026-08-06 |
| 备份恢复演练   | 证明备份可恢复                       | 测试库执行 pg_restore、核对计数和约束           |     1 天 | 2026-08-07 |

### 7.2 P1：核心产品闭环

| 功能/问题      | 具体需求                      | 技术路径                                           |    预计工时 | 建议交付   |
| -------------- | ----------------------------- | -------------------------------------------------- | ----------: | ---------- |
| 习惯每日记录   | Habit 不再使用永久布尔值      | 新增 `habit_check_ins(habitId,date)`，日历按日查询 |      3-4 天 | 2026-08-13 |
| 日历写接口定案 | 删除占位 PATCH 或支持独立事件 | 推荐先删除无效写接口；确有需求再建 CalendarEvent   | 1 天 / 4 天 | 2026-08-14 |
| 打卡明细展示   | 展示数值和日记，支持查看历史  | 计划详情/历史 API 与 UI 扩展                       |      3-4 天 | 2026-08-24 |

### 7.3 P2：生产化和体验提升

| 功能/问题      | 技术路径                                     | 预计工时 | 建议交付   |
| -------------- | -------------------------------------------- | -------: | ---------- |
| 上传对象存储   | S3/OSS 直传或服务端代理、类型/尺寸/配额校验  |   4-6 天 | 2026-09-08 |
| 地点与热门话题 | 明确产品数据源；无外部服务时先建可运营配置表 |   3-5 天 | 2026-09-15 |
| 通知分页与归档 | 游标分页、索引验证、过期清理                 |   2-3 天 | 2026-09-18 |
| 可观测性       | requestId、结构化日志、健康检查、错误采集    |   3-4 天 | 2026-09-24 |
| Web 体验       | 路由懒加载、按需图标、端口调整、浏览器回归   |   3-5 天 | 2026-10-01 |
| DTO/导航收敛   | 删除死 Mapper 或正式接入；统一导航参数类型   |   2-3 天 | 2026-10-06 |

## 8. 已知问题与解决建议

| 问题                         | 当前影响                | 建议                                                      |
| ---------------------------- | ----------------------- | --------------------------------------------------------- |
| `plans.completedDate` 仍存在 | 双写增加一致性维护成本  | 客户端全部升级并运行一致性检查后，再用后续 migration 删除 |
| `database.js` 职责较重       | 修改计划/统计时回归面大 | 只在新增复杂逻辑时按 plan/statistics repository 渐进拆分  |
| Habit 永久布尔值             | 不能表达每天是否完成    | P1 新增按日记录表                                         |
| Calendar PATCH 不持久化      | UI 调用会产生假成功     | 若无独立事件需求，直接删除接口和调用                      |
| 手机号归属未验证             | 可用他人手机号注册      | P0 接入服务端验证码；基础限流已完成                       |
| 上传写本地磁盘               | 多实例不一致且难备份    | 迁移对象存储                                              |
| 通知/圈子部分失败仍 HTTP 200 | 监控和客户端判断困难    | 统一错误处理中间件                                        |
| 13 个 ESLint warning         | 不阻断构建但增加噪声    | 随触及文件消除，不建议一次性大改 UI                       |
| Web 首包和字体较大           | 弱网加载慢              | Web 确认为正式目标后按需优化                              |
| 历史文档漂移                 | 开发人员误判当前状态    | 以 `PROJECT_CONTEXT.md` 和本文为当前事实源                |

## 9. 质量验证记录

2026-07-17 已实际执行：

| 命令/检查                   | 结果                                                     |
| --------------------------- | -------------------------------------------------------- |
| 后端所有 JS `node --check`  | 通过                                                     |
| `npx tsc --noEmit`          | 通过                                                     |
| `npm test -- --runInBand`   | 通过，2 suites / 7 tests                                 |
| `cd server && npm test`     | 通过，4 tests                                            |
| `npm run lint`              | 通过，0 error / 13 warning                               |
| `npm run web:build`         | 通过，3 个包体积 warning                                 |
| `npm run db:migrate:status` | 10 条 migration 均为 `up`                                |
| 空库 migration + verify     | 通过，隔离测试库已删除                                   |
| `npm run db:verify`         | 通过，字段/约束/索引/孤儿/行数正常                       |
| `npm run test:api`          | 通过，含设置、反馈、排序和 logout 失效，临时数据自动清理 |

## 10. 推荐开发工作流

1. 开始任务前阅读 `PROJECT_CONTEXT.md` 和本文对应章节。
2. 执行 `git status --short`，保护工作树已有改动。
3. 涉及数据时先确认真实事实源、ID 类型和所有权边界。
4. Schema 变更必须新增 migration，并提供 down 或明确不可逆原因。
5. 先在备份或隔离库迁移，再运行 `db:verify`。
6. 前端类型、API、Service、Hook 和 UI 同步更新。
7. 至少执行 TypeScript、相关测试、lint 和构建。
8. 数据库/API 改动执行真实 smoke；测试数据必须自动清理。
9. 更新 `PROJECT_CONTEXT.md`、本文和实际 API 文档。

## 11. 本轮改造的兼容与回滚策略

- `plans.completedDate` 暂时保留并双写，旧客户端仍能工作；
- 新客户端优先使用 `checkInRecords` 展示明细；
- `plan_check_ins` migration 的 down 会先把日期聚合回 `completedDate` 再删表；
- Schema 加固 migration 以事务执行，失败不会留下半套约束；
- 回滚前必须先备份，并确认没有只存在于 `numericValue/note` 的业务数据，因为旧数组无法保存这些明细；
- 生产回滚优先回滚应用版本，不应轻易回滚已承载新明细的数据表。

## 12. 下一步建议

下一个开发迭代建议只聚焦 P0 安全和测试库，不同时启动大规模架构重构。数据库结构已经足以支撑当前规模；最有价值的后续工作是让认证、权限、备份恢复和 CI 数据库集成测试达到可上线标准。
