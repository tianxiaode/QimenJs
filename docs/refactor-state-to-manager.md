# State 消除改造：将 State 数据字段迁移到 Manager

## 改造进度

- [x] 阶段一：Local 系列改造（FlatLocal）
- [x] 阶段二：Remote Flat 系列改造（FlatRemote）
- [x] 阶段三：Tree Remote 系列改造
- [x] 阶段四：清理 State 层（删除 State 类文件和旧 State Ability 文件）
- [x] 阶段五：目录结构重构（abilities/ 重组）
- [x] 阶段六：修复 UrlBuilder 保留原始 request.url
- [x] 阶段七：集成测试注释更新

## 已完成工作总结

### 核心改造

**消除 State 层**，将 State 上的数据字段和业务方法直接迁移到 Manager 上。Ability 中通过 `this` 直接访问这些字段，天然实例隔离。

#### 改造前架构

```
Manager (操作 Ability)
  └── state: FlatLocalEntityState  ← 独立对象，持有数据字段
        ├── sourceData: Map
        ├── items: IEntity[]
        ├── loading: boolean
        ├── search: TSearch
        └── [State Ability 注入的方法]
```

#### 改造后架构

```
Manager (数据字段 + 操作 Ability)
  ├── sourceData: Map          ← 直接在 Manager 上
  ├── items: IEntity[]
  ├── loading: boolean
  ├── search: TSearch
  └── [Ability 注入的方法]     ← 通过 this 直接访问数据字段
```

### 目录结构重构

```
abilities/
  core/           ← 原 state/base（SchemaProxyAbility, CacheAbility, DirtyAbility）
  mutation/       ← 原 state/mutation（LocalMutationAbility）
  search/         ← 原 state/search（SearchAbility）
  tree/           ← 原 state/tree（TreePathAbility, TreeLifecycleAbility, TreeSearchAbility, TreeViewAbility）
  local/          ← 原 manager/local（FlatLocalStateAbility 等）
  remote/         ← 原 manager/remote（FlatRemoteStateAbility 等）
  SchemaAbility.ts
```

### 文件重命名

| 旧名 | 新名 |
|------|------|
| StateSchemaAbility | SchemaProxyAbility |
| StateCacheAbility | CacheAbility |
| StateDirtyAbility | DirtyAbility |
| StateLocalMutationAbility | LocalMutationAbility |
| StateSearchAbility | SearchAbility |

### 已删除文件

- `src/entity/state/` 整个目录（BaseEntityState, FlatLocalEntityState, FlatRemoteEntityState, TreeRemoteEntityState）
- `src/entity/abilities/state/` 整个目录
- `src/entity/abilities/manager/` 整个目录
- 4 个引用 State 类的测试文件

### Bug 修复

- **UrlBuilder 覆盖原始 url**：UrlBuilder 之前完全从 pathParams + baseUrl 重建 URL，忽略了 request.url。修复后优先使用原始 url（拼接 baseUrl），否则回退到 pathParams 构建。

### 提交记录

1. `feae115` - docs: 添加 State 消除改造计划文档
2. `756f751` - refactor: State 消除改造 - 数据字段迁移到 Manager
3. `909a528` - test: 更新测试文件适配 State 消除改造
4. `fe00ce9` - refactor: 重构 abilities 目录结构
5. `1dd217f` - fix: UrlBuilder 保留原始 request.url 而非覆盖
6. `1fb140f` - chore: 更新集成测试注释，移除已删除 State 类的引用

### 测试状态

2422/2422 全部通过

---

## 后续计划

### 1. 类型定义清理

`src/entity/types/index.ts` 中仍存在以 `State` 命名的接口（如 `IStateSchemaAbility`, `IStateCacheAbility`, `IStateDirtyAbility`），应重命名为与新 Ability 名一致：

- `IStateSchemaAbility` → `ISchemaProxyAbility`
- `IStateCacheAbility` → `ICacheAbility`
- `IStateDirtyAbility` → `IDirtyAbility`

同时检查是否有其他 `IState*` 接口需要清理。

### 2. FlatLocalStateAbility 拆分评估

当前 `FlatLocalStateAbility` 仍然是一个大型聚合 Ability，内部通过 `schemaGetters`、`cacheMethods`、`dirtyMethods`、`mutationMethods`、`searchMethods` 合并。这些方法现在已独立为 `SchemaProxyAbility`、`CacheAbility`、`DirtyAbility`、`LocalMutationAbility`、`SearchAbility`。

评估是否可以将 `FlatLocalStateAbility` 拆分为只保留 `isEmpty`/`total`/`refreshView`/`edit`/`rollback` 等核心方法，将其他方法委托给独立的 Ability。这样 Local Manager 的 abilities 列表会更清晰：

```typescript
// 改造前
static readonly abilities = [FlatLocalStateAbility, LocalListAbility, ...];

// 改造后
static readonly abilities = [
    SchemaProxyAbility, CacheAbility, DirtyAbility, LocalMutationAbility, SearchAbility,
    FlatLocalStateAbility,  // 只保留核心方法
    LocalListAbility, ...
];
```

### 3. FlatRemoteStateAbility / TreeRemoteStateAbility 简化

当前 `FlatRemoteStateAbility` 提供了 `updateData`、`updateItem`、`isValidPage`、`deleteFromItems`、`refreshView`、`edit`、`rollback` 等方法。这些方法直接操作 Manager 数据字段，不再代理 state。评估是否可以进一步拆分或简化。

### 4. BaseEntityManager 数据字段类型精确化

当前 `BaseEntityManager` 定义了 `items: IEntity[] = []`、`sourceData: Map<string | number, IEntity> = new Map()` 等字段，但 Local 和 Remote Manager 的字段不完全相同（如 Remote 有 `total`/`page`/`pageSize`，Local 没有）。考虑是否需要将公共字段下放到各子类，BaseEntityManager 只保留真正公共的部分。

### 5. dispose 逻辑审查

State 消除后，`dispose()` 逻辑从 `state.dispose()` 变为直接清理 Manager 字段。需要审查所有 Manager 子类的 dispose 是否正确清理了所有数据字段，特别是 `expandedIds`（Tree）、`pageSizes`（Remote）等。

### 6. 文档和示例更新

- 更新 README 或使用文档中关于 State 的描述
- 更新 API 文档中 Manager 的属性列表
- 如果有示例代码引用了 `manager.state.xxx`，需要更新为 `manager.xxx`
