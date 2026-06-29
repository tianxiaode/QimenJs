# @orbitjs/entity

**层级**: 第 4 层  
**状态**: ⚠️ 开发中  
**测试**: ⚠️ 部分覆盖（2 个测试文件，1711 全量通过）  
**覆盖率**: -

## 概述

实体管理包，提供实体管理功能。采用 Manager + State 双层架构，Manager 负责远程通信和生命周期，State 负责本地数据管理。

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
│ + CRUD abilities    │            │ StateMutationAbility│
│                     │            │ + Tree abilities    │
└─────────────────────┘            └─────────────────────┘
```

## 目录结构

```
src/entity/
├── abilities/
│   ├── manager/              # Manager 专用能力
│   │   ├── SchemaAbility.ts  # Schema 代理（自动注册+延迟编译）
│   │   ├── local/            # 本地实体能力
│   │   │   ├── FlatLocalDeleteAbility.ts
│   │   │   ├── FlatLocalMutationAbility.ts
│   │   │   ├── FlatLocalStateAbility.ts
│   │   │   ├── LocalGetAbility.ts
│   │   │   └── LocalListAbility.ts
│   │   └── remote/           # 远程实体能力
│   │       ├── FlatRemoteQueryAbility.ts
│   │       ├── FlatRemoteStateAbility.ts
│   │       ├── RemoteCreateAbility.ts
│   │       ├── RemoteDeleteAbility.ts
│   │       ├── RemoteGetAbility.ts
│   │       ├── RemoteUpdateAbility.ts
│   │       ├── RemoteToggleAbility.ts
│   │       ├── TreeManagerAbility.ts
│   │       └── TreeRemoteStateAbility.ts
│   └── state/                # State 专用能力
│       ├── base/             # 基础能力
│       │   ├── StateCacheAbility.ts
│       │   ├── StateDirtyAbility.ts
│       │   └── StateSchemaAbility.ts
│       ├── mutation/         # 变更能力
│       │   └── StateLocalMutationAbility.ts
│       ├── search/           # 搜索能力
│       │   └── StateSearchAbility.ts
│       └── tree/             # 树能力
│           ├── TreeLifecycleAbility.ts
│           ├── TreePathAbility.ts
│           ├── TreeSearchAbility.ts
│           └── TreeViewAbility.ts
├── manager/
│   ├── CoreEntityManager.ts  # 核心管理器（schema 直接引用，自动注册）
│   ├── BaseEntityManager.ts  # 基础管理器（fetch/buildOptions）
│   └── managers.ts           # 具体 Manager 子类
├── state/
│   ├── BaseEntityState.ts    # 基础状态（Schema/Cache/Dirty）
│   ├── FlatLocalEntityState.ts
│   ├── FlatRemoteEntityState.ts
│   └── TreeRemoteEntityState.ts
└── types/
    └── index.ts              # 类型定义
```

## 依赖

```typescript
dependencies: {
  '@orbitjs/composable': 'L1',
  '@orbitjs/http': 'L3',
  '@orbitjs/system-abilities': 'L3',
  '@orbitjs/events': 'L1',
  '@orbitjs/cache': 'L1',
  '@orbitjs/registry': 'L1',
  '@orbitjs/async': 'L0',
  '@orbitjs/context': 'L0',
  '@orbitjs/schema': 'L2',
}
```

## 构建历史

### 2026-06-29
- ✅ **目录结构重组**：abilities/ 按 manager/state 分离，state 下再分 base/search/mutation/tree
- ✅ **BaseEntityState 移除 StateSearchAbility**：搜索能力下放到具体 State 类
- ✅ **SchemaAbility 简化为代理模式**：编译逻辑移至 SchemaRegistrar
- ✅ **Manager schema 改为直接引用**：`schemaKey: string` → `schema: RegistrSchema`，自动注册
- ✅ **StateLocalMutationAbility 多项 bug 修复**：softDelete/hasChanges/confirmDelete/rollbackDelete
- ✅ **StateSearchAbility 修复**：matchKeyword 关键词为空时返回 true
- ✅ **全部 Ability 子类迁移到 expose(proxy) API**

### 2026-06-28
- ✅ SchemaRegistrar 延迟编译
- ✅ 移除 IEntity 泛型参数
- ✅ RegistrSchema 类型修复

## 测试状态

### 现有测试

| 测试文件 | 状态 | 说明 |
|----------|------|------|
| FlatLocalEntityState.test.ts | ✅ 23/23 | 本地平面状态完整测试 |
| SchemaGetter.test.ts | ✅ | Schema getter 测试 |

### 缺少的测试

- [ ] FlatRemoteEntityState 测试
- [ ] TreeRemoteEntityState 测试
- [ ] Manager 各能力测试（LocalList, LocalGet, RemoteCreate 等）
- [ ] ComposableBase + AbilityBase 集成测试

## 已知问题

### 1. StateSchemaAbility 未简化
- **原因**: 仍为 15 个逐字段 getter，每个重复 `proxy.host as IBaseEntityState`
- **方案**: 直接暴露 `schema` getter 或聚合为 `schemaKeys`/`schemaTree` 分组
- **优先级**: 中

### 2. Ability 实例共享问题
- **原因**: ComposableRegistrar 缓存 Ability 实例，多宿主共享私有属性
- **影响**: `_changes`/`_deleteSnapshots` 等在多实例间共享
- **当前缓解**: hostRef 闭包隔离 getter/setter，onDispose 不设 null
- **优先级**: 低（当前单实例场景无影响）

## 遗留工作

- [ ] 简化 StateSchemaAbility
- [ ] 编写 FlatRemoteEntityState 测试
- [ ] 编写 TreeRemoteEntityState 测试
- [ ] 编写 Manager 能力测试
- [ ] 评估 Ability 实例共享问题的解决方案
