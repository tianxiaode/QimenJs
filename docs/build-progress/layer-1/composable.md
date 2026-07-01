# @orbitjs/composable

**层级**: 第 2 层  
**状态**: 完成  
**测试**: 通过  
**覆盖率**: ~90%（分支）

## 构建历史

### 2026-07-01
- 完成 AbilityDefinition 迁移：15 个 Manager Ability 从 class 迁移为纯对象
- 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar 旧版代码
- 简化 ComposableBase 为纯 AbilityDefinition 架构
- 移除 setupLegacyAbility、isAbilityDefinition、DISPOSERS_KEY、AbilityType 等旧版分支
- 清理 10 个测试文件中的旧版引用
- 删除 3 个旧版测试文件（AbilityBase.test.ts、ComposableRegistrar.test.ts、DebounceAbilityBase.test.ts）

### 2026-07-01（早期）
- 实现 Per-Host Ability 私有状态（abilityStates）
- 修复多宿主共享 Ability 实例时的隔离问题
- ComposableIntegration 集成测试全部通过

### 2026-06-29
- 修复 AbilityBase `this` 绑定系统性 bug
- 引入 AbilityProxy 代理对象
- 全部 29 个 Ability 子类迁移到 expose(proxy) API

### 2026-06-27
- 修复 ComposableRegistrar 抽象方法缺失
- 新增 AbilityConstructor 类型
- 删除旧编译产物

### 2026-06-15
- 重构 ComposableRegistrar 从 RegistrarBase 派生
- 重写单元测试

## 当前架构

### 核心类型

| 类型 | 说明 |
|------|------|
| `AbilityDefinition` | 能力定义类型，`Record<string \| symbol, any>` |
| `ComposableBase` | 可组合基类，提供能力注入和生命周期管理 |
| `IComposableBase` | ComposableBase 接口 |

### ComposableBase API

| 方法 | 说明 |
|------|------|
| `abilityState(key, creator?)` | 获取/创建能力私有状态（per-host 隔离） |
| `setAbilityState(key, value)` | 设置能力私有状态 |
| `debounce(key, fn, wait?, immediate?)` | 获取/创建防抖函数（per-host 隔离） |
| `onCleanup(callback)` | 注册清理回调（dispose 时逆序执行） |
| `getStatic(key)` / `setStatic(key, value)` | 类级缓存（跨实例共享） |
| `dispose()` | 销毁：清理回调 → 取消防抖 → 清空状态 |

### 目录结构

```
src/composable/
├── ComposableBase.ts      # 核心基类
├── index.ts               # 统一导出
└── types/
    └── composable.ts      # 类型定义
```

## 已解决问题

- AbilityBase/DebounceAbilityBase 类模式 → AbilityDefinition 纯对象模式
- ComposableRegistrar 预编译缓存 → 不再需要
- 多宿主隔离问题 → abilityState per-host Map
- proxy.host/proxy.self → this 直接指向宿主

## 参考资料

- [包文档：composable](../../architecture/packages/composable.md)
- [ComposableBase 最佳实践](../../best-practices/composable-best-practices.md)
- [能力系统使用指南](../../guides/with-abilities-guide.md)
