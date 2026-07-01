# @orbitjs/entity

**层级**: 第 4 层  
**状态**: 完成  
**测试**: 通过  
**覆盖率**: ~83%（分支）

## 概述

实体管理框架，提供实体管理功能。采用 Manager + State 双层架构，Manager 负责远程通信和生命周期，State 负责本地数据管理。所有 Ability 均为 AbilityDefinition 纯对象。

## 架构

```
Manager（管理器）                    State（状态）
┌─────────────────────┐            ┌─────────────────────┐
│ CoreEntityManager   │            │ BaseEntityState     │
│ - schema: Schema    │───schema──→│ - schema: Schema    │
│ - compiledSchema    │            │ - sourceData: Map   │
│ - entityName        │            │ - items: IEntity[]  │
│ - url               │            │ - search: TSearch   │
├─────────────────────┤            ├─────────────────────┤
│ SchemaAbility       │            │ StateSchemaAbility  │
│ EventAbility        │            │ StateCacheAbility   │
│ DomainAbility       │            │ StateDirtyAbility   │
│ SystemAbility       │            │ StateSearchAbility  │
│ FlatRemoteStateAbil │──this──→   │ StateMutationAbility│
│ TreeRemoteStateAbil │──this──→   │ + Tree abilities    │
│ + CRUD abilities    │            │                     │
└─────────────────────┘            └─────────────────────┘
```

> 注：所有 Ability 均为 AbilityDefinition 纯对象，方法中 `this` 直接指向宿主，不再使用 proxy 中间层。

## 目录结构

```
src/entity/
├── abilities/
│   ├── manager/              # Manager 专用能力（AbilityDefinition）
│   │   ├── local/            # 本地实体能力
│   │   └── remote/           # 远程实体能力
│   └── state/                # State 专用能力（AbilityDefinition）
│       ├── base/
│       ├── mutation/
│       ├── search/
│       └── tree/
├── manager/
│   ├── CoreEntityManager.ts
│   ├── BaseEntityManager.ts
│   └── managers.ts
├── state/
│   ├── BaseEntityState.ts
│   ├── FlatLocalEntityState.ts
│   ├── FlatRemoteEntityState.ts
│   └── TreeRemoteEntityState.ts
└── types/
    └── index.ts
```

## 依赖

```
@orbitjs/composable (L2)
@orbitjs/schema (L2)
@orbitjs/context (L1)
@orbitjs/http (L3)
@orbitjs/cache (L1)
@orbitjs/error (L0)
@orbitjs/system-abilities (L3)
@orbitjs/data-processor (L3)
@orbitjs/registry (L1)
@orbitjs/utils (L0)
```

## 构建历史

### 2026-07-01
- 完成 15 个 Manager Ability 从 class 迁移为 AbilityDefinition 纯对象
- 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar 旧版代码
- State 文件中 `AbilityType[]` → `AbilityDefinition[]`
- Ability 实例共享问题已通过 AbilityDefinition 迁移彻底解决

### 2026-06-30
- FlatRemoteStateAbility/FlatRemoteQueryAbility/TreeRemoteStateAbility 修复
- StateDirtyAbility.isDirty() 修复
- TreeRemoteEntityState 单元测试（29 个用例）
- Manager 能力测试（15 个用例）
- FlatRemoteStateAbility/TreeRemoteStateAbility 从 State 迁移到 Manager

### 2026-06-29
- 目录结构重组：abilities/ 按 manager/state 分离
- SchemaAbility 简化为代理模式
- StateLocalMutationAbility 多项 bug 修复
- 全部 Ability 子类迁移到 expose(proxy) API

## 防抖策略

| 操作类型 | 策略 | 说明 |
|----------|------|------|
| 读操作（list/getAll/expand/refresh） | 防抖 | 合并短时间内的多次调用 |
| 写操作（create/update/delete） | loading 锁 | 拒绝并发，不合并 |
| toggle | leading 防抖 | 首次立即执行 + 乐观更新 |
| save（本地批量提交） | trailing 防抖 | 延迟执行，合并多次变更 |
| 视图刷新（refreshView） | 50ms 防抖 | 高频数据变更时合并渲染 |

## 遗留工作

- 更多 Manager 能力测试（FlatRemoteListAbility, RemoteUpdateAbility, RemoteDeleteAbility 等）

## 参考资料

- [包文档：composable](../../architecture/packages/composable.md)
- [ComposableBase 最佳实践](../../best-practices/composable-best-practices.md)
