# ComposableBase 最佳实践

## 1. 两种能力注入模式

ComposableBase 支持两种能力注入模式：**动态注入**和**强类锻造（forge）**。

### 1.1 动态注入模式

通过 `static abilities` 声明能力，构造时 `setupAbilities()` 将每个能力的属性/方法逐个 `Object.defineProperty` 复制到实例上。

```typescript
class MyHost extends ComposableBase {
    static readonly abilities = [EventAbility, DomainAbility];
}
// 每次实例化都执行 Object.defineProperty，能力在实例上
```

**适用场景**：运行时动态注入能力（如渲染器注入 `LayoutNode.abilities`）。

**缺点**：每次实例化都要逐属性复制，能力越多开销越大。

### 1.2 强类锻造模式（推荐用于框架内部）

通过 `ComposableBase.forge(abilities)` 将能力合并到原型上，所有实例共享，构造时跳过 `setupAbilities()`。

```typescript
// 第一步：forge 合并能力到原型，得到中间类
const ForgedMyHost = ComposableBase.forge([EventAbility, DomainAbility]);

// 第二步：从中间类 extends，写自然的 class body
class MyHost extends ForgedMyHost {
    loading = false;
    fetch() { this.emit('fetch'); }  // this 类型正确，无需 as any
}
```

**适用场景**：框架内部类（ComponentBase、EntityManager 等），能力在编译期已知。

**优点**：
- 能力在原型上共享，实例化零开销
- class body 中 `this` 类型自然正确
- 支持 `abstract` 属性/方法
- 支持 getter/setter 覆写

### 1.3 forge 模式的接口声明技巧

forge 返回的中间类只有 `ComposableBase` 的类型信息，能力方法在类型上不可见。推荐做法：**在中间类上用 `export interface` 声明能力接口，派生类自动获得完整类型，不需要再声明 interface**。

```typescript
// 第一步：forge 合并能力，得到中间类
const ForgedEntityManager = ComposableBase.forge(
    [EventAbility, DomainAbility, SchemaAbility],
);

// 第二步：在中间类上声明能力接口（注意是 ForgedEntityManager，不是 CoreEntityManager）
export interface ForgedEntityManager extends ISchemaAbility {
    on(event: string, handler: EventHandler): () => void;
    emit(event: string, data?: any): void;
    readonly domainConfig: DomainConfig;
    // ... 其他能力方法
}

// 第三步：派生类自动拥有完整类型，不需要再 export interface
export abstract class CoreEntityManager extends ForgedEntityManager {
    domain: string = 'default';
    abstract entityName: string;
    // this.on / this.emit / this.domainConfig 类型全部正确
}
```

**关键点**：
- `export interface ForgedEntityManager` 与 `const ForgedEntityManager = ComposableBase.forge(...)` 同名，TypeScript 自动声明合并
- 派生类 `CoreEntityManager extends ForgedEntityManager` 自动继承接口，无需重复声明
- `abstract` 属性不要放在 interface 中（interface 不支持 `abstract`），直接在 class 中声明即可
- `forge` 不需要传 `name` 参数，中间类和最终类是不同的东西

### 1.4 链式 forge

forge 返回的强类自身也有 `forge` 方法，可以链式合并更多能力：

```typescript
const WithEvent = ComposableBase.forge([EventAbility]);
const WithDomain = WithEvent.forge([DomainAbility]);
// 等价于
const WithBoth = ComposableBase.forge([EventAbility, DomainAbility]);
```

### 1.5 何时用哪种模式

| 场景 | 推荐模式 |
|------|----------|
| 框架内部类（ComponentBase、EntityManager） | forge |
| 能力在编译期已知 | forge |
| 运行时动态注入能力（如渲染器） | 动态注入 |
| 用户自定义组件 | 动态注入（简单）或 forge（性能敏感） |

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
class MyHost extends ComposableBase {
    static readonly abilities = [EventAbility, DomEventsAbility];  // EventAbility 在前
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
class MyHost extends ComposableBase {
    // 如果 AbilityA 和 AbilityB 都有 'method'，AbilityB 的生效
    static readonly abilities = [AbilityA, AbilityB];
}
```

利用这个特性可以实现能力覆盖/定制。

## 10. 继承链中 abilities 的收集

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

## 11. dispose 后不要继续使用

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
| 框架内部类用动态注入 | 用 `forge()` 强类锻造 |
| forge 后在派生类重复声明 interface | 在中间类上声明一次，派生类自动继承 |
| abstract 属性放在 interface 中 | 直接在 class 中声明 |
| forge 传最终类名作为 name | 不需要传 name，中间类和最终类是不同的东西 |
