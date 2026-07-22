# ComposableBase 最佳实践

## 1. 两种使用模式

### 1.1 原型工厂函数（组件推荐）

通过 `createForgedClass` 直接创建强类，无继承链，纯原型组装：

```typescript
import { createForgedClass } from '@/composable';

const InnerClass = createForgedClass([EventAbility, DomEventsAbility]);
const instance = new InnerClass();
```

**适用场景**：组件等不需要 `extends` 的场景。

### 1.2 ComposableBase.with() 语法糖（EntityManager 推荐）

通过 `ComposableBase.with()` 创建强类，支持 `class extends`：

```typescript
import { ComposableBase } from '@/composable';

class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) {
    domain = 'default';
    fetch() { this.emit('fetch'); }
}
```

**适用场景**：需要 `extends` 写法的类（EntityManager、Router 等）。

### 1.3 链式 with()

`with()` 返回的强类自身也有 `with` 方法，可以链式合并更多能力：

```typescript
class MyManager extends ComposableBase.with([EventAbility]).with([DomainAbility]) {
    // 等价于 ComposableBase.with([EventAbility, DomainAbility])
}
```

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
            return this.abilityState('count', () => 0);
        },
    },
};
```

## 4. 私有状态用 abilityState，不要用闭包变量

```typescript
// 正确 - per-instance 隔离
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
let count = 0;
const CounterAbility: AbilityDefinition = {
    increment() { count++; },
};
```

**原因**：`abilityState` 由宿主统一管理，每个实例有独立的 Map，`dispose()` 时自动清空。

## 5. 清理资源用 onCleanup，不要手动管理

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
};
```

### 跨模块解耦：onCleanup 替代直接依赖

```typescript
// ✅ 正确 — 调度中心在 handleInit 时注册 onCleanup，组件完全不知道调度中心存在
// DragDispatchCenter.ts
handleInit(componentId, data) {
    const component = data.component;
    component.onCleanup(() => this.disposeByComponent(componentId));
}
```

## 6. 防抖用 DebounceAbility，需要显式声明

防抖已从 ComposableBase 内置方法迁移为独立能力，需要显式声明：

```typescript
import { DebounceAbility } from '@/system-abilities';

class MyManager extends ComposableBase.with([EventAbility, DebounceAbility]) {
    search(keyword: string) {
        return this.debounce('MyManager:search', () => {
            // 执行搜索
        }, 300);
    }
}
```

**原因**：防抖不是所有类都需要，迁移为能力后按需组合，减少不必要的依赖。

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
};

// DomEventsAbility 依赖 EventAbility 的 eventScope
const DomEventsAbility: AbilityDefinition = {
    bind(target, semantic, options?) {
        const adapter = this.abilityState('DomEventsAbility:adapter', () => createEventAdapter());
        return adapter.bind(target, semantic, this.eventScope, options, this);
    },
};

// 声明顺序：被依赖的能力先声明
class MyHost extends ComposableBase.with([EventAbility, DomEventsAbility]) {}
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

## 9. 能力声明顺序影响覆盖

后声明的能力覆盖先声明的同名属性：

```typescript
class MyHost extends ComposableBase.with([AbilityA, AbilityB]) {
    // 如果 AbilityA 和 AbilityB 都有 'method'，AbilityB 的生效
}
```

## 10. dispose 后不要继续使用

```typescript
const host = new MyHost() as any;
host.dispose();
// 不要再调用 host 的任何方法或访问属性
```

## 反模式清单

| 反模式 | 正确做法 |
|--------|----------|
| 用类定义能力 | 用纯对象 |
| 闭包变量存储状态 | `abilityState()` |
| 手动管理定时器/事件清理 | `onCleanup()` |
| 手动实现防抖 | `DebounceAbility` |
| 短 key 命名 abilityState | `AbilityName:stateName` |
| 用方法模拟 getter/setter | 描述符对象 `{ get, set }` |
| dispose 后继续使用 | 避免使用已销毁的实例 |
| 手动声明 `export interface` 拼接能力接口 | `InferAbilities` 自动推导 |
