# State 消除改造计划：将 State 数据字段迁移到 Manager

## 1. 改造目标

**消除 State 层**，将 State 上的数据字段（`sourceData`, `items`, `loading`, `search` 等）和业务方法直接迁移到 Manager 上。Ability 中通过 `this` 直接访问这些字段，天然是实例级别的，不存在共享问题。

### 改造前架构

```
Manager (操作 Ability)
  └── state: FlatLocalEntityState  ← 独立对象，持有数据字段
        ├── sourceData: Map
        ├── items: IEntity[]
        ├── loading: boolean
        ├── search: TSearch
        └── [State Ability 注入的方法]
```

### 改造后架构

```
Manager (数据字段 + 操作 Ability)
  ├── sourceData: Map          ← 直接在 Manager 上
  ├── items: IEntity[]
  ├── loading: boolean
  ├── search: TSearch
  └── [State Ability 注入的方法]  ← 通过 this 直接访问数据字段
```

## 2. 核心原则

1. **数据字段在 Manager 类上定义和初始化**，不在 Ability 定义中写 `sourceData: new Map()`
2. **Ability 只提供行为（方法/getter/setter）**，不提供数据字段的初始值
3. **Ability 中通过 `this` 访问数据字段**，天然实例隔离
4. **改造分步进行，每步可独立验证**

## 3. 改造分步计划

### 阶段一：Local 系列改造（FlatLocal）

#### 步骤 1.1：在 LocalCrudEntityManager 上定义数据字段

**文件**: `src/entity/manager/managers.ts`

在 `LocalCrudEntityManager` 类上直接定义原 `FlatLocalEntityState` 的数据字段：

```typescript
export abstract class LocalCrudEntityManager<...> extends BaseEntityManager<...> {
    // 数据字段（原 FlatLocalEntityState 的属性）
    isRemote: false = false;
    sourceData = new Map<string | number, IEntity>();
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;

    // 不再需要 state getter
    // state 相关逻辑全部在 this 上
}
```

同样处理 `LocalReadonlyEntityManager`。

#### 步骤 1.2：改造 FlatLocalStateAbility — 移除数据字段定义

**文件**: `src/entity/abilities/manager/local/FlatLocalStateAbility.ts`

移除 Ability 中的数据字段初始值：

```typescript
// 改造前（有问题：值在 Ability 定义对象上，被所有实例共享）
export const FlatLocalStateAbility: AbilityDefinition = {
    isRemote: false,
    sourceData: new Map<string | number, any>(),  // ← 共享！
    loading: false,
    items: [] as any[],
    ...
};

// 改造后（Ability 只提供行为）
export const FlatLocalStateAbility: AbilityDefinition = {
    // 不再包含数据字段初始值
    // 数据字段由 Manager 类定义

    // 计算属性保留
    isEmpty: { get() { return this.items.length === 0; } },
    total: { get() { return this.items.length; } },
    ...

    // 方法保留
    async refreshView() { ... },
    ...
};
```

#### 步骤 1.3：改造 Local 操作 Ability — 从 this.state 改为 this

**文件**: `src/entity/abilities/manager/local/LocalListAbility.ts`

```typescript
// 改造前
async list() {
    const { state } = this;
    const options = await this.buildOptions('list', state.toParams(), null, {});
    const context = await this.fetch('list', options);
    await state.updateData(context.data.list || []);
    this.emit('listed', state.items);
    return state.items;
}

// 改造后
async list() {
    const options = await this.buildOptions('list', this.toParams(), null, {});
    const context = await this.fetch('list', options);
    await this.updateData(context.data.list || []);
    this.emit('listed', this.items);
    return this.items;
}
```

同样改造：
- `LocalGetAbility.ts` — `state.sourceData` → `this.sourceData`
- `FlatLocalMutationAbility.ts` — `state.addItem` → `this.addItem`
- `FlatLocalDeleteAbility.ts` — `state.softDelete` → `this.softDelete`

#### 步骤 1.4：移除 Local Manager 的 state 属性

**文件**: `src/entity/manager/managers.ts`

从 `LocalReadonlyEntityManager` 和 `LocalCrudEntityManager` 中移除 `state` getter/setter。

#### 步骤 1.5：更新 BaseEntityManager

**文件**: `src/entity/manager/BaseEntityManager.ts`

- `state` 属性改为可选或移除（根据子类需要）
- `dispose()` 方法中清理 Manager 自身的数据字段

#### 步骤 1.6：验证 & 提交

运行测试，确保 Local 相关功能正常。

---

### 阶段二：Remote Flat 系列改造（FlatRemote）

#### 步骤 2.1：在 Remote Manager 上定义数据字段

**文件**: `src/entity/manager/managers.ts`

在 `RemoteReadonlyEntityManager` 和 `RemoteCrudEntityManager` 上定义原 `FlatRemoteEntityState` 的数据字段：

```typescript
export abstract class RemoteCrudEntityManager<...> extends BaseEntityManager<...> {
    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
    total: number = 0;
    page: number = 1;
    pageSize: number = 20;
    pages: number = 0;
    hasMore: boolean = false;
    pageSizes: number[] = [10, 20, 50];
}
```

#### 步骤 2.2：改造 FlatRemoteStateAbility — 从代理 state 改为直接访问

**文件**: `src/entity/abilities/manager/remote/FlatRemoteStateAbility.ts`

```typescript
// 改造前（代理 state）
export const FlatRemoteStateAbility: AbilityDefinition = {
    loading: { get() { return this.state.loading; } },
    items: { get() { return this.state.items; } },
    ...
};

// 改造后（不再需要代理，数据直接在 this 上）
// FlatRemoteStateAbility 可以大幅简化或直接删除
// 因为 loading/items 等已经在 Manager 自身上
```

#### 步骤 2.3：改造 Remote 操作 Ability

- `FlatRemoteListAbility.ts` — `this.state.updateData()` → `this.updateData()`
- `FlatRemoteQueryAbility.ts` — `this.state.page` → `this.page`
- `RemoteCreateAbility.ts` / `RemoteUpdateAbility.ts` / `RemoteDeleteAbility.ts` / `RemoteToggleAbility.ts` — 类似改造

#### 步骤 2.4：移除 Remote Manager 的 state 属性

#### 步骤 2.5：验证 & 提交

---

### 阶段三：Tree Remote 系列改造

#### 步骤 3.1：在 RemoteTreeEntityManager 上定义数据字段

```typescript
export abstract class RemoteTreeEntityManager<...> extends BaseEntityManager<...> {
    isRemote: true = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
    total: number = 0;
    expandedIds: Set<string | number> = new Set();
}
```

#### 步骤 3.2：改造 TreeRemoteStateAbility

同 FlatRemoteStateAbility，简化或删除。

#### 步骤 3.3：改造 Tree 操作 Ability

- `TreeManagerAbility.ts` — `this.state.toggleExpand()` → `this.toggleExpand()`
- Tree 相关 State Ability（TreePathAbility 等）— 保持不变，它们注入方法到宿主

#### 步骤 3.4：验证 & 提交

---

### 阶段四：清理 State 层

#### 步骤 4.1：删除 State 类文件

- `src/entity/state/FlatLocalEntityState.ts`
- `src/entity/state/FlatRemoteEntityState.ts`
- `src/entity/state/TreeRemoteEntityState.ts`
- `src/entity/state/BaseEntityState.ts`
- `src/entity/state/index.ts`

#### 步骤 4.2：清理 State Ability 文件

以下 State Ability 已被 FlatLocalStateAbility 合并，如果 FlatLocalStateAbility 也已改造完成，可考虑是否保留原文件：

- `src/entity/abilities/state/base/StateSchemaAbility.ts` — 逻辑已在 FlatLocalStateAbility 的 schemaGetters 中
- `src/entity/abilities/state/base/StateCacheAbility.ts` — 逻辑已在 FlatLocalStateAbility 的 cacheMethods 中
- `src/entity/abilities/state/base/StateDirtyAbility.ts` — 逻辑已在 FlatLocalStateAbility 的 dirtyMethods 中
- `src/entity/abilities/state/mutation/StateLocalMutationAbility.ts` — 逻辑已在 FlatLocalStateAbility 的 mutationMethods 中
- `src/entity/abilities/state/search/StateSearchAbility.ts` — 逻辑已在 FlatLocalStateAbility 的 searchMethods 中

Tree 相关 State Ability 需要保留（它们注入到 Manager 上）：
- `TreePathAbility.ts`
- `TreeLifecycleAbility.ts`
- `TreeSearchAbility.ts`
- `TreeViewAbility.ts`

#### 步骤 4.3：更新类型定义

**文件**: `src/entity/types/index.ts`

- 移除 `IBaseEntityState`, `IFlatLocalEntityState`, `IFlatRemoteEntityState`, `ITreeRemoteEntityState` 等接口
- 更新 `IBaseEntityManager` 接口（移除 `state` 属性）
- 更新相关 Ability 接口

#### 步骤 4.4：更新测试

- 修改所有引用 State 类的测试文件
- 改为直接测试 Manager

#### 步骤 4.5：最终验证 & 提交

---

## 4. 关键改造细节

### 4.1 ComposableBase 的 setupAbilityDefinition 行为

当前 `setupAbilityDefinition` 对普通值的处理：

```typescript
// 普通值
return {
    value,           // ← 直接用 Ability 定义中的值
    writable: true,
    configurable: true,
    enumerable: true
};
```

这意味着如果 Ability 中写了 `sourceData: new Map()`，这个 Map 对象会被 `Object.defineProperty` 设置到宿主实例上。**由于是每次构造新实例时执行**，所以实际上每个实例会获得同一个 Map 引用（因为 Ability 定义对象是模块级单例）。

**这就是为什么数据字段不能放在 Ability 定义中**，而必须在 Manager 类上定义。

### 4.2 Manager 类上定义数据字段的优势

```typescript
class LocalCrudEntityManager extends BaseEntityManager {
    sourceData = new Map<string | number, IEntity>();  // 每个实例独立
}
```

TypeScript 类字段初始化等价于在构造函数中赋值，每个实例都会创建新的 Map，天然隔离。

### 4.3 Ability 中访问数据字段

Ability 方法通过 `this` 访问宿主（Manager）上的字段：

```typescript
const FlatLocalStateAbility: AbilityDefinition = {
    async refreshView() {
        // this 指向 Manager 实例
        const allData = Array.from(this.sourceData.values());
        this.items = this.applySort(filtered);
    }
};
```

### 4.4 dispose 处理

Manager 的 dispose 需要清理自身数据字段：

```typescript
dispose(): void {
    this.sourceData?.clear();
    this.items = [];
    this.item = null;
    this.search = null as any;
    this.loading = false;
    super.dispose();
}
```

## 5. 风险与注意事项

1. **测试覆盖**：每个阶段完成后必须运行完整测试
2. **Tree Ability 复杂度**：TreePathAbility 等内部使用 `abilityState` 存储 nodes/hierarchy，改造时需确保这些状态仍然正确初始化
3. **缓存能力**：StateCacheAbility 依赖 `this.schema` 和 `this.cacheTTL`，改造后这些字段需在 Manager 上可访问
4. **分页状态**：FlatRemote 的分页字段（page, pageSize, pages 等）迁移到 Manager 后，需确保 FlatRemoteQueryAbility 正确访问
5. **类型安全**：改造过程中注意保持 TypeScript 类型正确

## 6. 文件变更清单

### 需要修改的文件

| 文件 | 改造内容 |
|------|----------|
| `src/entity/manager/managers.ts` | 在 Manager 类上定义数据字段，移除 state 属性 |
| `src/entity/manager/BaseEntityManager.ts` | 移除/调整 state 抽象属性，更新 dispose |
| `src/entity/abilities/manager/local/FlatLocalStateAbility.ts` | 移除数据字段初始值 |
| `src/entity/abilities/manager/local/LocalListAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/local/LocalGetAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/local/FlatLocalMutationAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/local/FlatLocalDeleteAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/remote/FlatRemoteStateAbility.ts` | 简化或删除 |
| `src/entity/abilities/manager/remote/FlatRemoteListAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/remote/FlatRemoteQueryAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/remote/RemoteGetAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/remote/RemoteCreateAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/remote/RemoteUpdateAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/remote/RemoteDeleteAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/remote/RemoteToggleAbility.ts` | `this.state` → `this` |
| `src/entity/abilities/manager/remote/TreeRemoteStateAbility.ts` | 简化或删除 |
| `src/entity/abilities/manager/remote/TreeManagerAbility.ts` | `this.state` → `this` |
| `src/entity/types/index.ts` | 更新接口定义 |

### 可能需要删除的文件

| 文件 | 说明 |
|------|------|
| `src/entity/state/BaseEntityState.ts` | State 基类，不再需要 |
| `src/entity/state/FlatLocalEntityState.ts` | 已迁移到 Manager |
| `src/entity/state/FlatRemoteEntityState.ts` | 已迁移到 Manager |
| `src/entity/state/TreeRemoteEntityState.ts` | 已迁移到 Manager |
| `src/entity/state/index.ts` | State 导出文件 |
| `src/entity/abilities/state/base/StateSchemaAbility.ts` | 已合并到 FlatLocalStateAbility |
| `src/entity/abilities/state/base/StateCacheAbility.ts` | 已合并到 FlatLocalStateAbility |
| `src/entity/abilities/state/base/StateDirtyAbility.ts` | 已合并到 FlatLocalStateAbility |
| `src/entity/abilities/state/mutation/StateLocalMutationAbility.ts` | 已合并到 FlatLocalStateAbility |
| `src/entity/abilities/state/search/StateSearchAbility.ts` | 已合并到 FlatLocalStateAbility |

### 需要保留的文件

| 文件 | 说明 |
|------|------|
| `src/entity/abilities/state/tree/TreePathAbility.ts` | 注入到 Manager，保留 |
| `src/entity/abilities/state/tree/TreeLifecycleAbility.ts` | 注入到 Manager，保留 |
| `src/entity/abilities/state/tree/TreeSearchAbility.ts` | 注入到 Manager，保留 |
| `src/entity/abilities/state/tree/TreeViewAbility.ts` | 注入到 Manager，保留 |
