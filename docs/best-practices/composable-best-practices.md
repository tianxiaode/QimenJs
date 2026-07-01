# ComposableBase 最佳实践

## 1. 能力定义：纯对象，不要用类

能力必须是普通对象（`AbilityDefinition`），不要用类。

```typescript
// 正确
const MyAbility: AbilityDefinition = {
    method() { /* ... */ },
    property: {
        get() { /* ... */ },
        set(v) { /* ... */ },
    },
};

// 错误 - 不要用类
class MyAbility extends AbilityBase {  // AbilityBase 已移除
    protected expose() { /* ... */ }
}
```

**原因**：纯对象更简洁，不需要实例化，不需要 `expose()` 方法，不需要 `proxy` 中间层。

## 2. abilityState key 命名：使用 `AbilityName:stateName` 格式

```typescript
// 正确 - 带命名空间
const CounterAbility: AbilityDefinition = {
    count: {
        get() {
            return this.abilityState('CounterAbility:count', () => 0);
        },
    },
};

// 错误 - 太短，容易冲突
const CounterAbility: AbilityDefinition = {
    count: {
        get() {
            return this.abilityState('count', () => 0);  // 可能与其他能力冲突
        },
    },
};
```

## 3. 私有状态用 abilityState，不要用闭包变量

```typescript
// 正确 - per-host 隔离
const CounterAbility: AbilityDefinition = {
    count: {
        get() {
            return this.abilityState('CounterAbility:count', () => 0);
        },
    },
    increment() {
        const current = this.abilityState('CounterAbility:count', () => 0)!;
        this.setAbilityState('CounterAbility:count', current + 1);
    },
};

// 错误 - 闭包变量在多宿主间共享
let count = 0;  // 所有宿主共享同一个 count！
const CounterAbility: AbilityDefinition = {
    increment() { count++; },
};
```

**原因**：`abilityState` 由宿主统一管理，每个宿主实例有独立的 Map，`dispose()` 时自动清空。

## 4. 清理资源用 onCleanup，不要手动管理

```typescript
// 正确 - 自动清理
const TimerAbility: AbilityDefinition = {
    _initTimer() {
        const timer = setInterval(() => { /* ... */ }, 1000);
        this.onCleanup(() => clearInterval(timer));
    },
};

// 错误 - 手动管理容易遗漏
const TimerAbility: AbilityDefinition = {
    _initTimer() {
        this._timer = setInterval(() => { /* ... */ }, 1000);
    },
    // 忘记在 dispose 中清理 → 内存泄漏
};
```

## 5. 防抖用 debounce，不要自己实现

```typescript
// 正确
const SearchAbility: AbilityDefinition = {
    search(keyword: string) {
        return this.debounce('SearchAbility:search', () => {
            // 执行搜索
        }, 300);
    },
};

// 错误 - 手动管理防抖
let debounceTimer: any;
const SearchAbility: AbilityDefinition = {
    search(keyword: string) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => { /* ... */ }, 300);
    },
};
```

**原因**：`debounce()` 由宿主统一管理，`dispose()` 时自动 `cancel()`。

## 6. 能力间依赖通过宿主属性传递

```typescript
// EventAbility 提供 eventScope
const EventAbility: AbilityDefinition = {
    eventScope: {
        get() {
            return this.abilityState('EventAbility:scope', () => {
                const scope = globalEventBus.createEventScope();
                this.onCleanup(() => scope.dispose());
                return scope;
            });
        },
    },
    on(event: string, handler: any) {
        return this.eventScope.on(event, handler);
    },
};

// DomEventsAbility 依赖 EventAbility 的 eventScope
const DomEventsAbility: AbilityDefinition = {
    bind(target: EventTarget, semantic: any, options?: any) {
        const adapter = this.abilityState('DomEventsAbility:adapter', () => createEventAdapter());
        return adapter.bind(target, semantic, this.eventScope, options, this);
        // this.eventScope 来自 EventAbility
    },
};

// 声明顺序：被依赖的能力先声明
class MyHost extends ComposableBase {
    static readonly abilities = [EventAbility, DomEventsAbility];  // EventAbility 在前
}
```

## 7. getter/setter 用描述符对象，不要用方法模拟

```typescript
// 正确 - getter/setter 描述符
const LabelAbility: AbilityDefinition = {
    label: {
        get() { return this._label; },
        set(v: string) { this._label = v; },
    },
};

// 错误 - 用方法模拟
const LabelAbility: AbilityDefinition = {
    getLabel() { return this._label; },
    setLabel(v: string) { this._label = v; },
};
```

**原因**：getter/setter 描述符在 `Object.defineProperty` 时直接作为 descriptor，语义更清晰。

## 8. 能力声明顺序影响覆盖

后声明的能力覆盖先声明的同名属性：

```typescript
class MyHost extends ComposableBase {
    // 如果 AbilityA 和 AbilityB 都有 'method'，AbilityB 的生效
    static readonly abilities = [AbilityA, AbilityB];
}
```

利用这个特性可以实现能力覆盖/定制。

## 9. 继承链中 abilities 的收集

ComposableBase 从原型链收集所有 `abilities`，子类只需声明自己的能力：

```typescript
class BaseManager extends ComposableBase {
    static readonly abilities: readonly AbilityDefinition[] = [EventAbility, DomainAbility];
}

class EntityManager extends BaseManager {
    // 只声明新增能力，EventAbility 和 DomainAbility 自动继承
    static readonly abilities: readonly AbilityDefinition[] = [SystemAbility];
}
```

## 10. dispose 后不要继续使用

```typescript
const host = new MyHost() as any;
host.dispose();
// 不要再调用 host 的任何方法或访问属性
// 状态已清空，防抖已取消，事件已解绑
```

## 反模式清单

| 反模式 | 正确做法 |
|--------|----------|
| 用类定义能力 | 用纯对象 |
| 闭包变量存储状态 | `abilityState()` |
| 手动管理定时器/事件清理 | `onCleanup()` |
| 手动实现防抖 | `debounce()` |
| 短 key 命名 abilityState | `AbilityName:stateName` |
| 用方法模拟 getter/setter | 描述符对象 `{ get, set }` |
| dispose 后继续使用 | 避免使用已销毁的实例 |
