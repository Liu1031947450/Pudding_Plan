# 布丁计划 API 文档

> 版本：`1.0.0`
>
> 基础地址：`http://localhost:3000/api`
>
> 当前实现：Express + PostgreSQL，非 Mock API

## 1. 通用约定

### 认证

除模板和每日语录外，接口均要求：

```http
Authorization: Bearer <token>
```

### 响应

所有接口固定返回：

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "error": null
}
```

失败示例：

```json
{
  "success": false,
  "data": null,
  "message": "",
  "error": "请求参数无效"
}
```

常用状态码为 `200`、`201`、`400`、`401`、`403`、`404`、`409`、`429`、`500`。

### 日期与 ID

- 业务日期使用本地自然日 `YYYY-MM-DD`。
- 打卡窗口包含今天和此前 6 个自然日，禁止未来日期。
- 对外资源 ID 均按字符串处理；请求路径中的数字 ID 可直接传字符串。

## 2. 认证与账号

### `POST /auth/login`

无需认证。登录限频为同一 IP + 手机号 15 分钟最多 10 次。

```json
{ "phone": "13800000001", "password": "Pudding123" }
```

成功返回 `{ token, user }`。

### `POST /auth/register`

无需认证。同一 IP 一小时最多 10 次。

```json
{
  "username": "新用户",
  "phone": "13800000009",
  "password": "Pudding123",
  "confirmPassword": "Pudding123",
  "acceptedTerms": true,
  "goalTags": ["自律", "阅读"]
}
```

- 密码至少 8 位且同时包含字母和数字。
- `goalTags` 可省略；提供时必须是 1–3 个不重复、每个不超过 20 字的字符串。

### 其他账号接口

| 方法     | 路径             | 请求                                                | 说明                          |
| -------- | ---------------- | --------------------------------------------------- | ----------------------------- |
| `GET`    | `/auth/me`       | 无                                                  | 当前用户资料                  |
| `PUT`    | `/auth/me`       | `{ username?, bio?, goalTags? }`                    | 修改公开资料                  |
| `POST`   | `/auth/avatar`   | `multipart/form-data`，字段 `avatar`                | 上传头像，最大 2 MB           |
| `PUT`    | `/auth/password` | `{ currentPassword, newPassword, confirmPassword }` | 修改密码并返回新 Token        |
| `POST`   | `/auth/logout`   | 无                                                  | 增加会话版本，使旧 Token 失效 |
| `DELETE` | `/auth/data`     | 无                                                  | 清除业务数据，保留账号        |
| `DELETE` | `/auth/account`  | `{ password }`                                      | 永久注销账号及关联数据        |
| `GET`    | `/auth/stats`    | 无                                                  | 计划、习惯、打卡与社交统计    |

## 3. 计划

### 计划结构重点

```json
{
  "title": "每天阅读",
  "type": 0,
  "status": "active",
  "totalDays": 30,
  "reminders": [],
  "milestones": []
}
```

- `type`: `0` 盖章、`1` 数值、`2` 日记。
- `status`: `active`、`paused`、`archived`。
- `completedDate` 只由打卡记录派生，不能通过计划更新写入。

| 方法     | 路径                                  | 请求                       | 权限/行为                    |
| -------- | ------------------------------------- | -------------------------- | ---------------------------- |
| `GET`    | `/plans`                              | 无                         | 仅当前用户全部计划           |
| `GET`    | `/plans/:id`                          | 无                         | 仅计划所有者                 |
| `POST`   | `/plans`                              | 计划字段                   | 创建计划，返回 `201`         |
| `PUT`    | `/plans/reorder`                      | `{ planIds: ["1", "2"] }`  | 列表必须完整且仅含本人计划   |
| `PUT`    | `/plans/:id`                          | 可编辑计划字段             | 不能改写历史打卡             |
| `DELETE` | `/plans/:id`                          | 无                         | 删除计划及打卡               |
| `POST`   | `/plans/:id/check-in?date=YYYY-MM-DD` | `{ numericValue?, note? }` | 仅活跃计划；重复日期更新明细 |
| `DELETE` | `/plans/:id/check-ins/:date`          | 无                         | 撤销允许窗口内的打卡         |

打卡请求示例：

```http
POST /plans/1/check-in?date=2026-09-04

Content-Type: application/json

{}
```

```http
POST /plans/1/check-in?date=2026-09-04

Content-Type: application/json

{ "numericValue": 12.5 }
```

```http
POST /plans/1/check-in?date=2026-09-04

Content-Type: application/json

{ "note": "今天完成了计划。" }
```

## 4. 快捷习惯

习惯请求示例：

```json
{
  "title": "工作日拉伸",
  "subtitle": "十分钟",
  "icon": "self-improvement",
  "category": "运动",
  "weekdays": [1, 2, 3, 4, 5],
  "reminderTime": "18:30",
  "startDate": "2026-09-04",
  "isActive": true
}
```

| 方法     | 路径                          | 请求                       | 说明                                        |
| -------- | ----------------------------- | -------------------------- | ------------------------------------------- |
| `GET`    | `/habits?date=YYYY-MM-DD`     | 无                         | 返回指定日期完成状态、连续天数和近 7 日记录 |
| `POST`   | `/habits`                     | 习惯字段                   | 创建习惯，返回 `201`                        |
| `PUT`    | `/habits/reorder`             | `{ habitIds: ["1", "2"] }` | 保存当前用户排序                            |
| `PUT`    | `/habits/:id`                 | 可编辑习惯字段             | 编辑或停用习惯                              |
| `DELETE` | `/habits/:id`                 | 无                         | 删除习惯及历史打卡                          |
| `PUT`    | `/habits/:id/check-ins/:date` | 无                         | 对指定自然日打卡                            |
| `DELETE` | `/habits/:id/check-ins/:date` | 无                         | 撤销指定自然日打卡                          |
| `POST`   | `/habits/:id/toggle`          | 无                         | 兼容入口，仅切换今天                        |

`weekdays` 使用 `0–6` 表示周日至周六。停用、早于开始日期或不在重复星期内的日期不能打卡。

## 5. 日历、活动与成长

| 方法  | 路径                          | 说明                                      |
| ----- | ----------------------------- | ----------------------------------------- |
| `GET` | `/calendar?year=2026&month=9` | 返回计划与习惯合并后的月活动数据          |
| `GET` | `/calendar/quote`             | 无需认证；返回本地每日语录                |
| `GET` | `/activity/history?limit=100` | 返回计划/习惯名称、类型、日期、数值或日记 |
| `GET` | `/rhythm/week`                | 最近一周综合节奏数据                      |
| `GET` | `/rhythm/month`               | 当前月综合节奏数据                        |
| `GET` | `/badges`                     | 当前用户徽章及解锁状态                    |

`limit` 必须是 `1–200` 的整数。

## 6. 社区动态

### 动态字段

```json
{
  "title": "今天的小进步",
  "content": "完成了晨跑。",
  "category": "运动",
  "visibility": "public",
  "location": "城市公园",
  "images": ["/uploads/<当前用户>-<文件>.jpeg"]
}
```

- `visibility`: `public`、`buddies`、`private`。
- 最多 4 张不同图片；必须先通过上传接口获得当前用户自己的相对 URL。
- 标题最大 200 字，正文最大 10000 字，地点最大 120 字。

| 方法     | 路径                               | 请求                                | 说明                                 |
| -------- | ---------------------------------- | ----------------------------------- | ------------------------------------ |
| `GET`    | `/circles`                         | 无                                  | 当前用户可见的动态列表               |
| `GET`    | `/circles/:id`                     | 无                                  | 可见动态详情                         |
| `POST`   | `/circles`                         | 动态字段                            | 发布动态，返回 `201`                 |
| `DELETE` | `/circles/:id`                     | 无                                  | 仅作者删除，清理图片和关联数据       |
| `POST`   | `/circles/upload`                  | `multipart/form-data`，字段 `image` | 上传单张动态图片，最大 5 MB          |
| `DELETE` | `/circles/upload`                  | `{ images: ["/uploads/..."] }`      | 清理未发布图片；已发布图片返回 `409` |
| `POST`   | `/circles/:id/like`                | 无                                  | 点赞可见动态                         |
| `DELETE` | `/circles/:id/like`                | 无                                  | 取消点赞                             |
| `POST`   | `/circles/:id/collect`             | 无                                  | 收藏可见动态                         |
| `DELETE` | `/circles/:id/collect`             | 无                                  | 取消收藏                             |
| `GET`    | `/circles/collections`             | 无                                  | 仅返回仍有权限查看的收藏             |
| `GET`    | `/circles/:id/likers`              | 无                                  | 可见动态的点赞用户                   |
| `GET`    | `/circles/:id/comments`            | 无                                  | 可见且未隐藏的评论与回复             |
| `POST`   | `/circles/:id/comments`            | `{ content, parentId? }`            | 发表评论或一级回复，返回 `201`       |
| `DELETE` | `/circles/:id/comments/:commentId` | 无                                  | 仅评论作者删除                       |
| `GET`    | `/circles/locations/nearby`        | 无                                  | 返回定位提示；地点也可手工输入       |
| `GET`    | `/circles/topics/trending`         | 无                                  | 由现有动态分类和固定默认项生成       |

## 7. 关注、搭子与拉黑

### 关注

| 方法     | 路径                | 说明         |
| -------- | ------------------- | ------------ |
| `POST`   | `/users/:id/follow` | 单向关注用户 |
| `DELETE` | `/users/:id/follow` | 取消关注     |

### 搭子

| 方法     | 路径                         | 请求         | 说明                                   |
| -------- | ---------------------------- | ------------ | -------------------------------------- |
| `GET`    | `/buddies`                   | 无           | 已接受搭子列表                         |
| `GET`    | `/buddies/recommendations`   | 无           | 按目标标签重合度排序，最多 20 人       |
| `GET`    | `/buddies/requests`          | 无           | 返回 `incoming`、`outgoing`、`buddies` |
| `POST`   | `/buddies/requests`          | `{ userId }` | 发送请求，返回 `201`                   |
| `POST`   | `/buddies/:id/accept`        | 无           | 仅接收方接受                           |
| `POST`   | `/buddies/:id/reject`        | 无           | 仅接收方拒绝                           |
| `DELETE` | `/buddies/requests/:id`      | 无           | 仅发送方取消待处理请求                 |
| `POST`   | `/buddies/:id/encouragement` | 无           | 已接受搭子间发送一次性鼓励，受限频保护 |
| `DELETE` | `/buddies/:id`               | 无           | 任一搭子解除关系                       |

### 拉黑

| 方法     | 路径              | 请求         | 说明                               |
| -------- | ----------------- | ------------ | ---------------------------------- |
| `GET`    | `/blocks`         | 无           | 当前用户黑名单                     |
| `POST`   | `/blocks`         | `{ userId }` | 拉黑并解除双方关注、搭子和相关通知 |
| `DELETE` | `/blocks/:userId` | 无           | 取消拉黑                           |

## 8. 举报

### `POST /reports`

```json
{
  "targetType": "moment",
  "targetId": "12",
  "reason": "spam",
  "detail": "补充说明"
}
```

- `targetType`: `moment` 或 `comment`。
- `reason`: `spam`、`harassment`、`inappropriate`、`other`。
- 不能举报自己内容；重复有效举报返回 `409`。
- 创建后目标立即对举报者隐藏。

维护命令：

```bash
npm run --prefix server moderate -- list
npm run --prefix server moderate -- reject <reportId>
npm run --prefix server moderate -- delete <reportId>
```

## 9. 通知

| 方法     | 路径                             | 说明                     |
| -------- | -------------------------------- | ------------------------ |
| `GET`    | `/notifications?unreadOnly=true` | 获取经过可见性过滤的通知 |
| `PATCH`  | `/notifications/:id/read`        | 标记本人通知已读         |
| `PATCH`  | `/notifications/read-all`        | 全部标记已读             |
| `DELETE` | `/notifications/:id`             | 删除本人通知             |

通知类型包含提醒、成就、点赞、评论、回复、关注、搭子请求、搭子接受和搭子鼓励。Socket.io 连接时通过 `auth.token` 提供同一 JWT。

## 10. 设置、反馈与模板

### 设置

| 方法  | 路径        | 请求                                                                                  |
| ----- | ----------- | ------------------------------------------------------------------------------------- |
| `GET` | `/settings` | 无                                                                                    |
| `PUT` | `/settings` | `{ notificationsEnabled?, notificationTime?, dndStart?, dndEnd?, theme?, fontSize? }` |

- 时间格式为 `HH:mm`。
- `theme` 当前只能是 `light`。
- `fontSize` 为 `small / medium / large`。

### 反馈

`POST /feedback`

```json
{
  "category": "suggestion",
  "content": "希望增加更多模板。",
  "contact": "可选联系方式"
}
```

`category` 为 `suggestion / issue / experience / other`，正文 5–500 字。

### 模板

以下接口无需认证：

- `GET /templates`
- `GET /templates/category/:category`
- `GET /templates/:id`

## 11. 权限一致性

- 所有用户资源均以 JWT 对应用户为准，不接受客户端传入所有者 ID。
- 计划、习惯、通知、设置、清数据和注销均校验所有权。
- 社区列表、详情、评论、收藏和通知执行同一动态可见性规则。
- 任一方向存在拉黑关系时，双方不能查看内容、关注、建立搭子或互动。
- 上传 URL 不能跨用户复用，且发布时必须仍对应服务器上的真实文件。
