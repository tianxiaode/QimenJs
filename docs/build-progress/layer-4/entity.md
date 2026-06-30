# @orbitjs/entity

**层级**: 第 4 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过（分支覆盖率 83.38%）  
**覆盖率**: 83.38%（分支）

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
│ FlatRemoteStateAbil │──proxy──→  │ StateMutationAbility│
│ TreeRemoteStateAbil │──proxy──→  │ + Tree abilities    │
│ + CRUD abilities    │            │                     │
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

### 2026-06-30
- ✅ **FlatRemoteStateAbility/FlatRemoteQueryAbility/TreeRemoteStateAbility expose() 修复**：将 `proxy.host` 访问从 expose() 函数体移入闭包内部，修复 precompile 阶段 proxy.host 为 null 的问题
- ✅ **StateDirtyAbility.isDirty() 修复**：将 `idField` 提取移到 `if (!item)` 检查之后，dispose 后无参调用不再抛 TypeError
- ✅ **TreeRemoteEntityState 单元测试**：新增 29 个测试用例，覆盖初始化/refreshView/ingest/树操作/isDirty/资源清理
- ✅ **Manager 能力测试**：新增 15 个测试用例，覆盖 SchemaAbility/LocalGetAbility/RemoteCreateAbility
- ✅ **Ability 实例共享问题评估**：推荐方案 C（WeakMap Per-Host State），详见已知问题
- ✅ **FlatRemoteStateAbility/TreeRemoteStateAbility 从 State 迁移到 Manager**：这两个能力按命名规范属于 Manager 层，将 state 属性代理到 Manager 实例上，不应注入到 State 自身。从 FlatRemoteEntityState/TreeRemoteEntityState 的 abilities 中移除，添加到 RemoteReadonlyEntityManager/RemoteCrudEntityManager/RemoteTreeEntityManager

### 2026-06-29
- ✅ **目录结构重组**：abilities/ 按 manager/state 分离，state 下再分 base/search/mutation/tree
- ✅ **BaseEntityState 移除 StateSearchAbility**：搜索能力下放到具体 State 类
- ✅ **SchemaAbility 简化为代理模式**：编译逻辑移至 SchemaRegistrar
- ✅ **Manager schema 改为直接引用**：`schemaKey: string` → `schema: RegistrSchema`，自动注册
- ✅ **StateLocalMutationAbility 多项 bug 修复**：softDelete/hasChanges/confirmDelete/rollbackDelete
- ✅ **StateSearchAbility 修复**：matchKeyword 关键词为空时返回 true
- ✅ **全部 Ability 子类迁移到 expose(proxy) API**
- ✅ **StateSchemaAbility 简化**：提取 `getSchema(proxy)` 辅助方法，消除 15 处重复代码
- ✅ **refreshView 实现**：FlatRemote 替换数组引用；TreeRemote 默认实现（被 TreeViewAbility 覆盖）
- ✅ **FlatRemoteEntityState (this as any) 修复**：Ability 注入方法用 `!` 声明
- ✅ **防抖架构三层调整**：DOM 事件层 + Manager 层 + State 层
- ✅ **RemoteDeleteAbility 加 loading 锁**：防止并发删除
- ✅ **TreeManagerAbility 实际使用防抖**：expand 200ms leading, refresh 300ms leading

### 2026-06-28
- ✅ SchemaRegistrar 延迟编译
- ✅ 移除 IEntity 泛型参数
- ✅ RegistrSchema 类型修复

## 测试状态

### 现有测试

| 测试文件 | 状态 | 说明 |
|----------|------|------|
| FlatLocalEntityState.test.ts | ✅ 23/23 | 本地平面状态完整测试 |
| FlatRemoteEntityState.test.ts | ✅ 16/16 | 远程平面状态测试 |
| TreeRemoteEntityState.test.ts | ✅ 29/29 | 树形远程状态测试 |
| ManagerAbilities.test.ts | ✅ 15/15 | Manager 能力测试（SchemaAbility/LocalGet/RemoteCreate） |
| SchemaGetter.test.ts | ✅ | Schema getter 测试 |

### 缺少的测试

- [ ] ComposableBase + AbilityBase 集成测试
- [ ] 更多 Manager 能力测试（FlatRemoteListAbility, RemoteUpdateAbility, RemoteDeleteAbility 等）
- [ ] StateLocalMutationAbility 独立测试

## 已知问题

### 1. Ability 实例共享问题
- **原因**: ComposableRegistrar 缓存 Ability 实例，多宿主共享私有属性
- **影响**: `_changes`/`_deleteSnapshots` 等在多实例间共享；`ability.host` 在多实例下不稳定
- **当前缓解**: hostRef 闭包隔离 getter/setter，onDispose 不设 null
- **推荐方案**: 方案 C（WeakMap Per-Host State）—— 在 AbilityBase 中增加 `WeakMap<object, Map<string, any>>`，以宿主为 key 存储独立状态
- **优先级**: 低（当前单实例场景无影响）

## 防抖策略

| 操作类型 | 策略 | 说明 |
|----------|------|------|
| 读操作（list/getAll/expand/refresh） | 防抖 | 合并短时间内的多次调用 |
| 写操作（create/update/delete） | loading 锁 | 拒绝并发，不合并 |
| toggle | leading 防抖 | 首次立即执行 + 乐观更新 |
| save（本地批量提交） | trailing 防抖 | 延迟执行，合并多次变更 |
| 视图刷新（refreshView） | 50ms 防抖 | 高频数据变更时合并渲染 |

## 遗留工作

- [ ] 更多 Manager 能力测试（FlatRemoteListAbility, RemoteUpdateAbility, RemoteDeleteAbility 等）
- [ ] ComposableBase + AbilityBase 集成测试
- [ ] 实现 Ability 实例共享问题的 WeakMap 方案
