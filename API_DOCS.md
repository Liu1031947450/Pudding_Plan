# Mock API 接口文档

本项目已实现完整的 Mock API 接口系统，用于前后端联调。

## 配置

在 `src/api/config.ts` 中配置 API 基础地址：

```typescript
export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3000/api'
    : 'https://api.puddingplan.com',
  TIMEOUT: 10000,
};
```

## 使用方式

所有 API 接口都支持 Mock 模式，通过 `USE_MOCK` 常量控制：

```typescript
const USE_MOCK = true; // 开启 Mock 模式
```

## API 接口列表

### 1. 计划相关 (Plans API)

```typescript
import { plansApi } from '@/api';

// 获取所有计划
const response = await plansApi.getAll();

// 获取单个计划
const response = await plansApi.getById(id);

// 创建计划
const response = await plansApi.create(planData);

// 更新计划
const response = await plansApi.update(id, updates);

// 删除计划
const response = await plansApi.delete(id);

// 打卡
const response = await plansApi.checkIn(id);
```

### 2. 模板相关 (Templates API)

```typescript
import { templatesApi } from '@/api';

// 获取所有模板
const response = await templatesApi.getAll();

// 获取单个模板
const response = await templatesApi.getById(id);

// 按分类获取模板
const response = await templatesApi.getByCategory(category);
```

### 3. 圈子相关 (Circles API)

```typescript
import { circlesApi, buddiesApi } from '@/api';

// 获取所有圈子
const response = await circlesApi.getAll();

// 获取单个圈子
const response = await circlesApi.getById(id);

// 加入圈子
const response = await circlesApi.join(id);

// 获取所有好友
const response = await buddiesApi.getAll();
```

### 4. 日历和习惯 (Calendar & Habits API)

```typescript
import { calendarApi, habitsApi } from '@/api';

// 获取日历数据
const response = await calendarApi.getData();

// 更新日历
const response = await calendarApi.updateDay(day, hasActivity, activityType);

// 获取所有习惯
const response = await habitsApi.getAll();

// 切换习惯完成状态
const response = await habitsApi.toggle(id);
```

### 5. 通知和徽章 (Notifications & Badges API)

```typescript
import { notificationsApi, badgesApi, rhythmApi } from '@/api';

// 获取所有通知
const response = await notificationsApi.getAll();

// 标记通知为已读
const response = await notificationsApi.markAsRead(id);

// 获取所有徽章
const response = await badgesApi.getAll();

// 获取周节奏数据
const response = await rhythmApi.getWeek();

// 获取月节奏数据
const response = await rhythmApi.getMonth();
```

## 响应格式

所有 API 返回统一的响应格式：

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Service 层

Service 层已更新为使用 API 接口：

```typescript
import { planService } from '@/services';

// 所有方法都是异步的
const plans = await planService.getPlans();
const plan = await planService.getPlanById(id);
const newPlan = await planService.createPlan(planData);
```

## Hooks 层

Hooks 已更新为支持异步加载：

```typescript
import { usePlanManagement } from '@/hooks';

const { plans, loading, handleCreatePlan, refreshPlans } = usePlanManagement();

// 创建计划
await handleCreatePlan(planData);

// 手动刷新
await refreshPlans();
```

## Mock 数据

Mock 数据位于 `src/api/mock-server.ts`，模拟了真实的网络延迟（300ms）。

## 切换到真实 API

当后端 API 准备好后，只需将各个 API 文件中的 `USE_MOCK` 设置为 `false`：

```typescript
const USE_MOCK = false; // 使用真实 API
```
