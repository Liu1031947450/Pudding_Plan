# Pudding Plan (布丁计划) 前端项目优化进度记录

本文档用于记录当前正在进行的优化工作、当前所处步骤以及后续排期，防止中断任务后无法恢复。

> 本文件保留阶段性历史。2026-07-17 之后的当前事实、数据库审计和排期请优先阅读 `PROJECT_CONTEXT.md` 与 `SYSTEM_AUDIT_AND_ROADMAP.md`。

## 1. 当前所处状态

- **当前步骤**：打卡编辑安全、设置运行时、数据清除和基础认证防护已完成；下一步处理遗留 Habit/Calendar 语义与短信/对象存储等外部服务
- **已完成任务**：历史前端结构优化；10 条 migration 空库链路；打卡规范化与编辑；约束和冗余索引治理；设置和排序持久化；真实反馈；服务端 logout；完整 CI 与 API 冒烟

---

## 2. 详细研发进度表

### 阶段一：低风险快速治理 (先止血)

| 任务 ID     | 任务名称                       | 涉及模块 / 文件     | 当前状态 | 记录与下一步动作                             |
| :---------- | :----------------------------- | :------------------ | :------- | :------------------------------------------- |
| **TSK-001** | 排除 Git `.env` 文件跟踪       | `.gitignore`        | 已完成   | 已排除 Git 缓存。                            |
| **TSK-003** | 修复 22 个 ESLint 编译级 Error | TSX/TS 文件         | 已完成   | 成功解决全部 Hook 依赖 and unused 变量报错。 |
| **TSK-004** | 环境变量代替硬编码 IP          | `src/api/config.ts` | 已完成   | 成功迁移为 process.env.EXPO_PUBLIC_API_URL。 |
| **FMT-001** | Prettier 格式化问题修复        | 前端整体            | 已完成   | 成功格式化全部代码文件。                     |

### 阶段二：中等规模结构优化 (再治理)

| 任务 ID     | 任务名称                       | 涉及模块 / 文件                                     | 当前状态 | 记录与下一步动作                                                           |
| :---------- | :----------------------------- | :-------------------------------------------------- | :------- | :------------------------------------------------------------------------- |
| **TSK-002** | Circle 详情重复代码重构        | `CircleDetailScreen.tsx`<br>`CircleDetailModal.tsx` | 已完成   | 成功抽取 CircleDetailContent，页面体积缩减 95%。                           |
| **TSK-006** | 拆分 PostMomentScreen 巨型文件 | `PostMomentScreen.tsx`                              | 已完成   | 成功抽离 Hook 与子 Drawer 组件到 PostMomentDrawers.tsx，代码行数缩减 60%。 |

### 阶段三：长期架构演进 (后演进)

| 任务 ID     | 任务名称                     | 涉及模块 / 文件                                   | 当前状态 | 记录与下一步动作                                                                         |
| :---------- | :--------------------------- | :------------------------------------------------ | :------- | :--------------------------------------------------------------------------------------- |
| **TSK-007** | 自动化 CI 质量门禁与 PR 验证 | `.github/workflows/ci.yml`                        | 已完成   | 覆盖 Format、Lint、TS、Jest、Web build、后端测试、空库 migration、DB verify、API smoke。 |
| **TSK-008** | Jest 单元测试基础建设        | `jest.config.js`<br>`__tests__/planUtils.test.ts` | 已完成   | 修正了 Jest 的 ESModule 解析范围，编写并成功运行 planUtils.test.ts 核心计算测试。        |

### 阶段四：数据库与全栈一致性治理

| 任务 ID      | 任务名称                 | 涉及模块 / 文件                                                | 当前状态 | 记录与下一步动作                                                                   |
| :----------- | :----------------------- | :------------------------------------------------------------- | :------- | :--------------------------------------------------------------------------------- |
| **DB-001**   | migration 基线与启动安全 | `server/.sequelizerc`、`initDatabase.js`、`server/migrations/` | 已完成   | 停止 `sync()`；补齐空库结构；10 条 migration 均为 up。                             |
| **DB-002**   | 规范化计划打卡           | `PlanCheckIn.js`、`database.js`、`plans.js`                    | 已完成   | 19 条历史记录已迁移；旧数组暂时双写兼容。                                          |
| **DB-003**   | 约束与索引加固           | `20260716000200-harden-schema.js`                              | 已完成   | users UNIQUE 由 93 个精简为 2 个，并补外键、CHECK 和索引。                         |
| **FS-001**   | 数值/日记打卡闭环        | Calendar、API、Service、Hook                                   | 已完成   | 三种打卡可持久化；通用计划编辑不再覆盖明细。                                       |
| **QA-001**   | 全栈验证                 | Jest、node:test、Webpack、`smokeApi.js`                        | 已完成   | 类型、测试、lint、Web 构建、DB verify 和 API smoke 通过。                          |
| **SET-001**  | 用户设置持久化           | `user_settings`、SettingsContext、本地通知、AppText            | 已完成   | 提醒/勿扰已接入运行时调度，主题接入系统/导航容器，全局文本按字号设置缩放。         |
| **SEC-001**  | 会话失效与认证防护       | auth middleware、rateLimit、AuthContext                        | 已完成   | logout、401、CORS/秘密检查、单进程限流与匿名 ID 枚举接口删除已完成；短信仍待接入。 |
| **DATA-CLR** | 用户数据清除             | auth API、database transaction、SettingsScreen                 | 已完成   | 保留账号，事务删除业务数据、校准动态计数并退出。                                   |
| **PLAN-001** | 计划排序持久化           | `plans.sortOrder`、reorder API、Plan Hook                      | 已完成   | 拖动顺序通过事务保存，刷新和跨设备保持一致。                                       |
| **FB-001**   | 意见反馈闭环             | `feedbacks`、feedback API、FeedbackSheet                       | 已完成   | 反馈内容真实落库，测试账号删除时级联清理。                                         |
| **DATA-001** | Habit 每日记录           | Habit、Calendar、新 migration                                  | 待开始   | 以 `habit_check_ins` 替代永久布尔完成状态。                                        |

---

## 3. 后续步骤与断点恢复备忘

- **中断恢复点**：数据库第一阶段已完成并在当前本机库执行。下一优先级是路线图 P0 安全与隔离数据库集成测试；继续开发前先运行 `git status --short`、`npm run db:migrate:status` 并阅读两份当前文档。
