# Mock API 测试说明

## 问题排查

### 1. 数据持久化验证

Mock 数据库使用单例模式，在应用运行期间数据会持久化。可以通过以下方式验证：

```typescript
// 在 mock-server.ts 中已添加 console.log
console.log('Plan created:', newPlan);
console.log('Total plans:', db.getPlans().length);
```

### 2. 页面刷新机制

PlanScreen 使用 `useFocusEffect` 在页面获得焦点时自动刷新：

```typescript
useFocusEffect(
  React.useCallback(() => {
    console.log('PlanScreen focused, refreshing plans...');
    refreshPlans();
  }, [refreshPlans])
);
```

### 3. 创建流程

1. 用户填写表单 → 点击完成
2. 调用 `handleCreatePlan` → 调用 API
3. Mock API 保存到单例数据库
4. 返回成功 → `navigation.goBack()`
5. PlanScreen 获得焦点 → 触发 `useFocusEffect`
6. 调用 `refreshPlans()` → 重新加载数据
7. 显示更新后的列表

## 调试步骤

1. 打开开发者工具查看 Console 日志
2. 创建计划时应该看到：
   - "Plan created: {...}"
   - "Total plans: X"
3. 返回列表页时应该看到：
   - "PlanScreen focused, refreshing plans..."
4. 检查列表是否显示新计划

## 常见问题

### 问题：创建后列表没有更新
**可能原因**：
- useFocusEffect 没有触发
- refreshPlans 没有正确调用 API
- Mock 数据库没有正确保存

**解决方案**：
- 检查 Console 日志
- 确认 useFocusEffect 被触发
- 验证 Mock 数据库单例是否正常工作

### 问题：数据在刷新后丢失
**可能原因**：
- 模块热重载导致单例重置
- 应用完全重启

**解决方案**：
- 这是正常行为，Mock 数据只在应用运行期间持久化
- 生产环境需要使用真实的持久化存储（如 AsyncStorage 或后端数据库）
