# 布丁计划 / PuddingPlan

布丁计划是一个面向本地演示的全栈习惯养成产品。当前 `1.0.0` 以 Web 为主要验收端，提供真实 PostgreSQL 持久化、计划与习惯打卡、社区互动、成长搭子、通知、内容治理和账号管理。

> 当前定位是“可完整操作的本地全栈演示版”，不是已上线的生产服务。Android/iOS 代码继续保留，但本轮不声明真机、安装包或应用商店验证结果。

## 已实现能力

- 计划：创建、编辑、排序、删除、暂停、恢复、归档，以及盖章、数值、日记三种打卡。
- 习惯：创建、编辑、停用、删除、排序、按星期重复、提醒时间、补签与撤销。
- 成长：本地自然日统计、最近 7 个自然日打卡窗口、月历、节奏图、连续天数、活动历史和徽章。
- 社区：图文动态、公开/仅搭子/仅自己可见、点赞、收藏、评论、回复、关注和地点输入。
- 搭子：标签推荐、请求、接受、拒绝、取消、解除关系和限频鼓励。
- 治理：举报后立即隐藏、拉黑后双向隔离、作者删除内容，以及命令行举报处理。
- 账号：注册协议确认、一键演示登录、资料与头像、修改密码、清除业务数据和注销账号。
- 通知：站内通知与 Socket.io 实时更新；移动端保留本地提醒能力，Web 明确不提供系统通知。

## 技术栈

- 前端：React 19、React Native 0.83、Expo 55、React Navigation、React Native Web、Webpack。
- 后端：Node.js、Express、Sequelize、PostgreSQL、Socket.io、JWT、Multer。
- 测试：Jest、Node.js Test Runner、ESLint、Prettier、TypeScript。

## 环境要求

- Node.js `>= 20`
- npm
- PostgreSQL 18（仓库中的数据库启动命令按本机 macOS 安装路径配置）

## 首次启动

### 1. 安装依赖

```bash
npm install
npm install --prefix server
```

### 2. 配置后端

```bash
cp server/.env.example server/.env
```

本地演示配置：

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pudding_plan_demo
DB_USER=postgres
DB_PASSWORD=postgres123
JWT_SECRET=请替换为本机随机长字符串
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:8080
```

生成 JWT 密钥：

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

`server/.env` 已被 Git 忽略，不要提交真实密码或密钥。

### 3. 启动 PostgreSQL

```bash
npm run db:start
```

该命令会调用：

```bash
sudo -u postgres /Library/PostgreSQL/18/bin/pg_ctl -D /Library/PostgreSQL/18/data start
```

首次执行需要输入 macOS 的 `sudo` 密码。可用 `npm run db:status` 和 `npm run db:stop` 查看状态或停止服务。

### 4. 初始化演示库

```bash
npm run demo:reset
npm run demo:seed
```

- `demo:reset` 会删除并重建演示库。
- 安全保护要求数据库名必须精确为 `pudding_plan_demo`。
- 原有 `pudding_plan` 数据库不会被这些脚本操作。
- `demo:seed` 会执行迁移并写入确定性演示数据。

### 5. 启动后端与 Web

分别打开两个终端：

```bash
npm run server
```

```bash
npm run web
```

访问 `http://localhost:8080`。Web 默认连接当前页面主机的 `3000` 端口。

也可以使用以下命令重建演示库并同时启动前后端：

```bash
npm run demo
```

## 演示账号

登录页提供一键填充入口，三个账号密码相同。

| 用户   | 手机号        | 密码         | 用途                                   |
| ------ | ------------- | ------------ | -------------------------------------- |
| 小布丁 | `13800000001` | `Pudding123` | 主要验收账号，含计划、习惯、搭子和通知 |
| 晨光   | `13800000002` | `Pudding123` | 社区作者与已接受搭子                   |
| 松露   | `13800000003` | `Pudding123` | 待处理搭子请求与私密内容               |

## API 地址

- Web：未配置时自动使用 `http://当前页面主机:3000/api`。
- iOS/Android：必须设置 `EXPO_PUBLIC_API_URL`，地址应使用设备可访问的开发机局域网 IP。
- 后端静态图片地址：`http://后端主机:3000/uploads/...`。

示例：

```bash
EXPO_PUBLIC_API_URL=http://<开发机局域网IP>:3000/api npm start
```

## 常用命令

| 命令                                        | 说明                               |
| ------------------------------------------- | ---------------------------------- |
| `npm run demo:reset`                        | 安全重建 `pudding_plan_demo`       |
| `npm run demo:seed`                         | 执行迁移并写入演示数据             |
| `npm run demo`                              | 重建演示库并启动 API 与 Web        |
| `npm run server`                            | 启动后端，默认端口 `3000`          |
| `npm run web`                               | 启动 Web，默认端口 `8080`          |
| `npm run typecheck`                         | TypeScript 检查                    |
| `npm test -- --runInBand`                   | 前端测试                           |
| `npm run lint`                              | ESLint 检查                        |
| `npm run format:check`                      | Prettier 检查                      |
| `npm run web:build`                         | Web 生产构建                       |
| `npm run --prefix server test`              | 后端单元测试                       |
| `npm run --prefix server db:migrate:status` | 查看迁移状态                       |
| `npm run --prefix server db:verify`         | 校验表、字段、索引、约束和外键孤儿 |
| `npm run --prefix server test:api`          | 对已启动的后端执行多账号 API 冒烟  |
| `npm run --prefix server moderate -- list`  | 查看举报记录                       |
| `npm run verify`                            | 执行前端检查、构建和后端验证       |

## 内容治理命令

```bash
npm run --prefix server moderate -- list
npm run --prefix server moderate -- reject <reportId>
npm run --prefix server moderate -- delete <reportId>
```

治理脚本同样只允许连接 `pudding_plan_demo`。删除动态时会清理本地图片；删除评论时会同步修正评论计数。

## 仓库结构

```text
Pudding_Plan/
├── src/                 # React Native / Web 共享前端
├── server/              # Express、Sequelize、迁移、种子和测试
├── android/             # Android 原生工程（仅保持兼容）
├── ios/                 # iOS 原生工程（仅保持兼容）
├── public/              # Web HTML 模板
├── README.md            # 本地演示说明
├── PROJECT_CONTEXT.md   # 架构、模型、约束和生产限制
└── API_DOCS.md          # 当前真实 API 文档
```

## 当前边界

- 不包含短信验证码、AI、会员、支付、私聊、桌面小组件或公开部署。
- 图片保存在本地磁盘，不是对象存储；举报由命令行处理，不是管理后台。
- 登录限频与 WebSocket 在线状态保存在单进程内存中，不适用于多实例生产环境。
- 定位依赖浏览器/设备授权，也可手工输入；Web 不提供系统通知。
- Android/iOS 原生构建和商店合规仍需在后续发布阶段单独验证。

更多实现细节见 `PROJECT_CONTEXT.md`，接口定义见 `API_DOCS.md`。
