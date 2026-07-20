# ComposableBase 最佳实践

## 1. 两种能力注入模式

ComposableBase 支持两种能力注入模式：**`with()` 原型固化**和**`setupAbilities()` 运行时注入**。

### 1.1 `with()` 原型固化模式（推荐）

通过 `ComposableBase.with(abilities)` 将能力合并到原型上，所有实例共享，零实例化开销。`InferAbilities` 自动从能力数组推导接口，无需手动声明 `export interface`。

```typescript
class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) {
    domain = 'default';
    fetch() { this.emit('fetch'); }  // this.on / this.emit 类型自动推导
}
```

**适用场景**：编译期已知能力的所有场景。

**优点**：
- 能力在原型上共享，实例化零开销
- `InferAbilities` 自动推导接口，不需要 `export interface`
- class body 中 `this` 类型自然正确
- 支持 `abstract` 属性/方法
- 支持 getter/setter 覆写

### 1.2 `setupAbilities()` 运行时注入模式

通过 `host.setupAbilities(definitions)` 在运行时将能力注入到实例上。支持单个能力或数组。

```typescript
const host = new MyHost();
host.setupAbilities(someAbility);              // 单个
host.setupAbilities([ability1, ability2]);      // 数组
```

**适用场景**：运行时才知道能力的场景（如 JSON 定义、渲染器动态注入）。

**注意**：每次调用都执行 `Object.defineProperty`，能力在实例上而非原型上，有性能开销。

### 1.3 链式 `with()`

`with()` 返回的强类自身也有 `with` 方法，可以链式合并更多能力：

```typescript
class MyManager extends ComposableBase.with([EventAbility]).with([DomainAbility]) {
    // 等价于 ComposableBase.with([EventAbility, DomainAbility])
}
```

### 1.4 何时用哪种模式

| 场景 | 推荐模式 |
|------|----------|
| 框架内部类（ComponentBase、EntityManager） | `with()` |
| 能力在编译期已知 | `with()` |
| 运行时动态注入能力（JSON 定义、渲染器） | `setupAbilities()` |

## 2. 能力定义：纯对象，不要用类

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

## 3. abilityState key 命名：使用 `AbilityName:stateName` 格式

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

## 4. 私有状态用 abilityState，不要用闭包变量

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

## 5. 清理资源用 onCleanup，不要手动管理

### 5.1 基本用法

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

### 5.2 跨模块解耦：onCleanup 替代直接依赖

当模块 A 需要在组件销毁时清理资源，但不想让组件直接依赖模块 A 时，用 `onCleanup` 注册回调：

```typescript
// ❌ 错误 — 组件直接 import 调度中心，强耦合
// TemplateComponent.ts
import { dragDispatchCenter } from '@/drag';
import { overlayDispatchCenter } from '@/overlay/dispatch';

class TemplateComponent {
    dispose() {
        dragDispatchCenter.disposeByComponent(this.id);
        overlayDispatchCenter.disposeByComponent(this.id);
    }
}

// ✅ 正确 — 调度中心在 handleInit 时注册 onCleanup，组件完全不知道调度中心存在
// DragDispatchCenter.ts
handleInit(componentId, data) {
    const component = data.component;
    component.onCleanup(() => this.disposeByComponent(componentId));
    // ...
}
```

**原理**：`ComposableBase.dispose()` 按注册逆序执行所有 cleanup 回调。组件销毁时自动触发，调度中心清理组件之外的外部资源（事件总线状态、OverlayRoot DOM、document 级监听等），而组件自身的 `component.bind`/`component.on` 由 eventScope.dispose() 自动清理。

**适用场景**：
- 调度中心（OverlayDispatchCenter、DragDispatchCenter）需要在组件销毁时清理外部资源
- 任何需要在组件生命周期内注册清理逻辑，但不想与组件耦合的模块
- 替代"组件发事件 → 调度中心监听"的复杂方案

## 6. 防抖用 debounce，不要自己实现

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

## 7. 能力间依赖通过宿主属性传递

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
class MyHost extends ComposableBase.with([EventAbility, DomEventsAbility]) {
    // EventAbility 在前
}
```

## 8. getter/setter 用描述符对象，不要用方法模拟

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

## 9. 能力声明顺序影响覆盖

后声明的能力覆盖先声明的同名属性：

```typescript
class MyHost extends ComposableBase.with([AbilityA, AbilityB]) {
    // 如果 AbilityA 和 AbilityB 都有 'method'，AbilityB 的生效
}
```

利用这个特性可以实现能力覆盖/定制。

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
| 框架内部类用 `setupAbilities()` | 用 `with()` 原型固化 |
| 手动声明 `export interface` 拼接能力接口 | `InferAbilities` 自动推导 |
| `static abilities` + `collectAbilities` | 已移除，用 `with()` |
