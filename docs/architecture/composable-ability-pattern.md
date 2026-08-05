# ComposableBase 能力模式

> QimenJS 的核心架构模式：通过纯对象能力（Ability）注入，实现行为组合与状态隔离。

## 概述

ComposableBase 是 QimenJS 所有可组合类的基类，提供**能力注入**（Ability Injection）机制。能力是纯对象（非 class），通过原型混入（mixin）方式注入到宿主类，实现：

- **行为共享**：方法通过原型共享，零内存开销
- **状态隔离**：每个实例拥有独立的 abilityState Map
- **类型安全**：`InferAbilities` 自动推导编译期类型
- **生命周期管理**：`onCleanup` + `dispose` 自动释放资源

## 核心 API

| API | 类型 | 说明 |
|-----|------|------|
| `static use(abilities)` | 静态方法 | 原地修改原型注入能力，返回 this |
| `static with(abilities)` | 静态方法 | 创建派生类并注入能力，返回新类 |
| `static define(definitions)` | 静态方法 | 原地注入非能力定义（body 方法/值） |
| `abilityState(key, creator?)` | 实例方法 | 获取 per-instance 状态，支持惰性创建 |
| `setAbilityState(key, value)` | 实例方法 | 直接设置 per-instance 状态 |
| `onCleanup(callback)` | 实例方法 | 注册清理回调，dispose 时 LIFO 逆序执行 |
| `dispose()` | 实例方法 | 释放资源：`onBeforeDispose → onCleanup → abilityState.cancel() → onDisposed` |
| `logger` | 实例属性 | `Logger.for(this.constructor.name)`，构造时自动创建 |

## use() vs with()

| 特性 | `use()` | `with()` |
|------|---------|----------|
| 修改目标 | 原地修改 `this.prototype` | 创建 `class extends this`，修改 `Derived.prototype` |
| 返回值 | `this`（原类） | `Derived`（新类） |
| 原类是否受影响 | 是 | 否 |
| 适用场景 | 类定义后追加能力 | 函数式组合，不污染原类 |

```typescript
// use() - 原地注入
class MyManager extends ComposableBase {}
MyManager.use([EventAbility, DomainAbility]);

// with() - 派生组合
class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) {}
```

## AbilityDefinition 结构

能力是**纯对象**（`Record<string | symbol, any>`），包含三类成员：

```typescript
const MyAbility: AbilityDefinition = {
    // 1. 方法 - 直接复制到原型
    doSomething() { /* this 指向宿主实例 */ },

    // 2. getter/setter 访问器 - 通过 defineProperty 注入
    label: {
        get() { return this.abilityState('MyAbility:label', () => 'default'); },
        set(v: string) { this.setAbilityState('MyAbility:label', v); },
    },

    // 3. Symbol 键方法 - 也会复制到原型
    [Symbol.for('my-symbol')]() { /* ... */ },
};
```

**注入机制**（`forge.ts` → `withAbilities`）：

1. `flattenAbilities`：用 `Object.getOwnPropertyDescriptors` 提取描述符，跳过 `__` 前缀 key，过滤非函数/非 accessor 值
2. `applyAbilities`：accessor 对象 → `defineProperty`，函数 → 直接赋值到原型
3. **内置方法保护**：`abilityState`/`setAbilityState`/`onCleanup`/`dispose` 等核心方法不可被能力覆盖

## abilityState 状态隔离

```typescript
// 存储：Symbol 键的 per-instance Map
Object.defineProperty(this, ABILITY_STATES_KEY, {
    value: new Map<string, any>(),
    enumerable: false,
    configurable: true,
});

// 访问：惰性创建
abilityState(key: string, creator?: () => any): any | undefined {
    const states = this[ABILITY_STATES_KEY];
    if (!states.has(key) && creator) {
        states.set(key, creator());  // 仅首次调用
    }
    return states.get(key);
}
```

**key 命名规范**：`AbilityName:stateName`，避免不同能力间的 key 冲突。

## dispose 生命周期

```
dispose()
  → onBeforeDispose()          ← 前置钩子，子类可覆写
  → onCleanup (LIFO 逆序)     ← 后注册的先清理，独立 try-catch
  → abilityState.cancel()      ← 有 cancel() 方法的对象自动调用
  → onDisposed()               ← 后置钩子
```

## InferAbilities 类型推导

```typescript
// 三层推导链
InferAbilities<[A, B]>
  → UnionToIntersection<InferAbility<A> | InferAbility<B>>
  → InferAbility<A> & InferAbility<B>  // 交叉类型

// 使用：声明合并
export interface Component extends InferAbilities<typeof COMPONENT_ABILITIES> {}
```

`ForgedConstructor` 支持 `with()` 链式调用的累积类型推导。

## 内置能力一览

### 系统能力（`@qimenjs/system-abilities`）

| 能力 | 作用 |
|------|------|
| EventAbility | 事件作用域管理（`eventScope`） |
| DomEventsAbility | DOM 事件绑定（`bind()`） |
| ComponentEventBusAbility | 组件事件总线（`componentEmit`/`componentOn`） |
| EntityEventBusAbility | 实体事件总线（`entityEmit`/`entityOn`） |
| OverlayEventBusAbility | 浮动层事件总线 |
| DragEventBusAbility | 拖放事件总线 |
| RouteEventBusAbility | 路由事件总线 |
| SystemEventBusAbility | 系统事件总线 |
| FileEventBusAbility | 文件事件总线 |
| DomainAbility | 域配置访问（`domain`/`getDomainConfig`） |
| SystemAbility | 系统配置访问 |
| DebounceAbility | 防抖（`debounce()`） |

### 组件核心能力（`@qimenjs/component-core`）

| 能力 | 作用 |
|------|------|
| NodeQueryAbility | DOM 查询（`querySelector`/`querySelectorAll`） |
| NodePropAbility | 节点属性操作（`_markNodeDirty`/`_flushNodeProps`） |
| CommonPropsAbility | 通用属性（`visible`/`disabled`/`readonly`/`loading` 等） |
| AnimationAbility | 动画控制 |
| BadgeAbility | 徽标管理（`updateBadge`/`showBadge`/`hideBadge`） |
| FloatAbility | 浮动层管理 |
| DragAbility | 拖拽能力 |
| LifecycleAbility | 生命周期钩子（`onMounted`/`onUpdated`/`onResize` 等） |

### 组件 UI 能力（`@qimenjs/component-abilities`）

| 能力 | 作用 |
|------|------|
| ArrowAbility | 箭头方向渲染 |
| GroupSelectAbility | 分组选择 |
| SizeAbility | 尺寸管理 |
| ResizeAbility | 调整大小 |
| IndicatorAbility | 指示器 |
| OverflowAbility | 溢出处理 |

## 与其他系统的关系

- **Component**：`extends ComposableBase`，通过 `use(COMPONENT_ABILITIES)` 注入所有组件能力
- **EntityManager**：通过 `ComposableBase.with(CORE_ENTITY_ABILITIES)` 派生组合
- **Router**：通过 `ComposableBase.with([SystemEventBusAbility, RouteEventBusAbility])` 组合
- **事件总线**：各总线能力通过 `EventAbility` 的 `eventScope` 依赖传递

## 参见

- [ComposableBase 最佳实践](../best-practices/composable-best-practices.md)
- [事件系统](./event-system.md)
- [实体管理](./entity-management.md)