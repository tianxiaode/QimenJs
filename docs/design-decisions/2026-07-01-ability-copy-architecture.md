# Ability 纯复制架构讨论

## 背景

当前 Ability 系统采用 `AbilityBase` → `expose(host)` → `precompile()` → `createDescriptors(host)` 的机制：

1. Ability 类实例化后由 `ComposableRegistrar` 缓存（单例共享）
2. `expose(host)` 在 factory 阶段调用，通过闭包变量实现 per-host 私有状态隔离
3. 方法通过 `bind(host)` 绑定到宿主
4. `onDispose(host)` 负责清理私有状态和副作用

这套机制存在以下问题：
- **复杂度高**：expose → precompile → createDescriptors → defineProperty 链路长
- **host 参数传递繁琐**：每个 Ability 的 expose 都要接收 host，DebounceAbilityBase 还需要额外的 `getDebouncedActionFor(host, ...)` 
- **私有状态管理分散**：有的用闭包变量，有的用 WeakMap，有的用 `this._xxx`（有隔离风险）
- **onDispose 逻辑重复**：每个有私有状态的 Ability 都要手动实现清理

## 决策（讨论中）

**核心思路**：Ability 不再是类实例，而是普通对象（属性+方法的集合），直接复制到宿主上。`this` 自然指向宿主，私有状态由宿主统一管理。

### 模式对比

**当前模式**：
```typescript
class StateDirtyAbility extends AbilityBase {
    protected expose(host: any): IExposeResult {
        const snapshots = new Map();  // 闭包私有状态
        return {
            isDirty: { get: () => /* 用 snapshots */ },
        };
    }
    protected onDispose(host: any) {
        this._snapshots.clear();  // 手动清理
    }
}
```

**纯复制模式**：
```typescript
const StateDirtyAbility = {
    isDirty: { get() {
        const snapshots = this.abilityState('StateDirty:snapshots', () => new Map());
        // ...
    }},
};
// 不需要 onDispose，宿主 dispose 时 abilityStates 整体清空
```

## 原因

### 1. AbilityBase 可以直接复制到宿主

当用 `Object.defineProperty` 把方法复制到宿主上时，普通函数的 `this` 就是宿主。当前代码已经做了 `bind(host)`（`AbilityBase.ts:126-133`），效果等价。

**28 个子类验证**：
- **20 个纯代理 Ability**（StateSchemaAbility、SchemaAbility、DomainAbility、所有 CRUD Ability 等）：零私有状态，直接可用
- **4 个有私有状态的 Ability**（StateDirtyAbility、StateCacheAbility、StateLocalMutationAbility、DomEventsAbility）：需要宿主管理私有状态
- **2 个已用 WeakMap 的**（EventAbility、DebounceAbilityBase）：需要迁移到宿主管理模式

### 2. 局部变量用宿主方法获取和创建

宿主提供 `abilityState(key, creator?)` 方法：
- 存在则返回
- 不存在则调用 creator 创建并存储
- 宿主 dispose 时 `abilityStates.clear()` 一行清空

```typescript
// ComposableBase
private _abilityStates = new Map<string, any>();
abilityState(key: string, creator?: () => any) {
    if (!this._abilityStates.has(key) && creator) {
        this._abilityStates.set(key, creator());
    }
    return this._abilityStates.get(key);
}
```

### 3. DebounceAbilityBase 可以放弃

防抖 map 也挂在宿主上，不再需要单独的基类：

```typescript
const FlatLocalMutationAbility = {
    save() {
        const debouncedSave = this.abilityState('debouncedSave', 
            () => debounce(() => this._doSave(), 500));
        debouncedSave();
    },
};
```

也可以保留一个工具函数 `getOrCreateDebounced(this, key, fn, wait)` 来复用防抖逻辑，避免散落各处。

### 4. 大部分 Ability 不再需要 onDispose

私有状态由宿主管理 → 宿主 dispose 时直接清空 → 大部分 Ability 不需要清理逻辑。

**少数有副作用的场景**（需要注册清理回调）：
- StateCacheAbility：`CacheFactory.release(provider.id, true)` — 通知缓存工厂释放资源
- 防抖函数：`debounced.cancel()` — 取消待执行的定时器
- EventAbility：`scope.dispose()` — 解绑事件监听
- DomEventsAbility：解绑 DOM 事件

解决方案：Ability 注册 cleanup 回调到宿主：
```typescript
const StateCacheAbility = {
    cache() {
        const provider = this.abilityState('cache:provider', () => CacheFactory.create(...));
        this.onCleanup(() => CacheFactory.release(provider.id, true));
    },
};
```

宿主 dispose 时先执行 cleanup 回调，再 clear abilityStates。

## 影响

### 可以移除的机制
- `AbilityBase` 类
- `DebounceAbilityBase` 类
- `expose(host)` 方法
- `precompile()` / `createDescriptors()` / `createDisposer()` 工厂链
- `ComposableRegistrar` 的预编译缓存逻辑
- `onDispose(host)` 方法（大部分场景）

### 需要新增的机制
- `ComposableBase.abilityState(key, creator?)` — 私有状态管理
- `ComposableBase.onCleanup(callback)` — 副作用清理注册
- Ability 从类变为普通对象的定义方式
- `setupAbilities()` 改为直接复制属性/方法到宿主

### 需要改造的文件
- 28 个 Ability 子类全部重写
- `ComposableBase` — 新增 abilityState/onCleanup，简化 setupAbilities
- `ComposableRegistrar` — 简化或移除
- 相关测试全部更新

## 替代方案

### 方案 A：Symbol key 直接挂在宿主上
```typescript
const _snapshotsKey = Symbol('snapshots');
class StateDirtyAbility {
    isDirty() {
        if (!this[_snapshotsKey]) this[_snapshotsKey] = new Map();
    }
}
```
- 优点：最简单，不需要宿主提供方法
- 缺点：Symbol 分散在各 Ability 中，宿主无法统一管理；语义不够清晰

### 方案 B：宿主提供 abilityState 方法（推荐）
- 优点：语义清晰，宿主统一管理，dispose 一行搞定
- 缺点：ComposableBase 多两个方法

### 方案 C：保持当前架构，仅修复隔离问题
- 把 4 个有风险的 Ability 改为 WeakMap 模式
- 优点：改动最小
- 缺点：不解决根本的复杂性问题

## 实施细节（待定）

1. 在 ComposableBase 中实现 `abilityState()` 和 `onCleanup()`
2. 将 28 个 Ability 子类从类改为普通对象
3. 简化 `setupAbilities()` 为直接复制
4. 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar 预编译逻辑
5. 更新所有测试

## 后续工作

- [ ] 确定私有状态管理方案（abilityState vs Symbol）
- [ ] 确定防抖工具函数是否保留
- [ ] 确定普通对象的 Ability 定义格式（plain object vs 仍用 class 但不继承 AbilityBase）
- [ ] 实施改造
