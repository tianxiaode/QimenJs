# @qimenjs/composable

**层级**: 第 2 层  
**状态**: 重构中  
**测试**: 待更新

## 构建历史

### 2026-07-22
- 重构为原型工厂函数架构（createForgedClass）
- ComposableBase 从 class 改为 const 语法糖
- debounce 迁移为 DebounceAbility（移至 system-abilities 包）
- 移除 getStatic / setStatic / setupAbilities / applyOverrides
- 内置方法（abilityState / onCleanup / dispose）不可被能力覆盖
- IComposableBase 接口更新

### 2026-07-01
- 完成 AbilityDefinition 迁移：15 个 Manager Ability 从 class 迁移为纯对象
- 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar 旧版代码

### 2026-07-01（早期）
- 实现 Per-Host Ability 私有状态（abilityStates）
- 修复多宿主共享 Ability 实例时的隔离问题

## 当前架构

### 核心机制

| 导出 | 说明 |
|------|------|
| `createForgedClass` | 原型工厂函数（核心机制） |
| `ComposableBase` | 语法糖，`ComposableBase.with()` 委托 createForgedClass |

### 内置方法（所有强类实例自动拥有）

| 方法 | 说明 |
|------|------|
| `abilityState(key, creator?)` | 获取/创建能力私有状态（per-instance 隔离） |
| `setAbilityState(key, value)` | 设置能力私有状态 |
| `onCleanup(callback)` | 注册清理回调（dispose 时逆序执行） |
| `dispose()` | 释放：清理回调 → 取消防抖 → 清空状态 |
| `host` | 返回宿主自身 |
| `logger` | 日志记录器 |

### 目录结构

```
src/composable/
├── ComposableBase.ts      # 语法糖
├── forge.ts               # 原型工厂函数
├── index.ts               # 统一导出
└── types/
    ├── ability.ts         # 能力类型定义
    └── composable.ts      # 接口类型定义
```

## 参考资料

- [包文档：composable](../../architecture/packages/composable.md)
- [能力系统使用指南](../../guides/with-abilities-guide.md)
