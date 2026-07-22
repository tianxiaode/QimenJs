# 能力系统使用指南

## 概述

QimenJS 的能力系统基于 `AbilityDefinition` 纯对象 + `withAbilities` / `withDefinitions` 独立函数。能力是普通对象，通过函数注入到类原型上。`ComposableBase` 是正常类，子类 `extends` 后 `super()` 即可，天然保留原型链和 `instanceof`。

## 使用模式

### extends ComposableBase + withAbilities（推荐）

```typescript
import { ComposableBase, withAbilities } from '@/composable';

class MyManager extends ComposableBase {
    domain = 'default';
    fetch() { this.emit('fetch'); }
}
withAbilities(MyManager, [EventAbility, DomainAbility]);

new MyManager() instanceof ComposableBase // true
```

### 多层继承 + 逐层注入能力

```typescript
class CoreEntityManager extends ComposableBase {
    domain = 'default';
}
withAbilities(CoreEntityManager, [EventAbility, DomainAbility, SystemAbility, SchemaAbility]);

class BaseEntityManager extends CoreEntityManager {
    async fetch(action, options) { /* ... */ }
}

class LocalReadonlyEntityManager extends BaseEntityManager {
    isRemote = false;
    items: IEntity[] = [];
}
withAbilities(LocalReadonlyEntityManager, [FlatLocalStateAbility, LocalListAbility, LocalGetAbility]);
```

### withDefinitions：注入 body 定义

```typescript
class MyComponent extends TemplateComponent {}
withAbilities(MyComponent, [EventAbility]);
withDefinitions(MyComponent, {
    type: 'MyComponent',
    onAfterInit(props) { /* ... */ },
    update(props) { /* ... */ },
});
```

## 内置功能

所有 ComposableBase 子类实例自动拥有以下内置方法（不可被能力覆盖）：

| 方法 | 说明 |
|------|------|
| `abilityState(key, creator?)` | 获取/创建能力私有状态 |
| `setAbilityState(key, value)` | 设置能力私有状态 |
| `onCleanup(callback)` | 注册释放回调 |
| `onBeforeDispose()` | 释放前置钩子（可覆写） |
| `onDisposed()` | 释放后置钩子（可覆写） |
| `dispose()` | 释放资源（onBeforeDispose → onCleanup → 清理状态 → onDisposed） |
| `logger` | 日志记录器 |

## 定义能力

能力是普通对象，包含方法、getter/setter：

```typescript
import type { AbilityDefinition } from '@qimenjs/composable';

// 方法
const GreetAbility: AbilityDefinition = {
    greet() {
        return `Hello, ${this.name}!`;
    },
};

// getter/setter
const LabelAbility: AbilityDefinition = {
    label: {
        get() { return this._label; },
        set(v: string) { this._label = v; },
    },
};
```

## 私有状态

能力通过 `abilityState()` 管理私有状态，每个实例独立隔离：

```typescript
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
```

**key 命名约定**：使用 `AbilityName:stateName` 格式避免冲突。

## 防抖

防抖通过 `DebounceAbility` 提供，需要显式声明：

```typescript
import { DebounceAbility } from '@/system-abilities';

class MyManager extends ComposableBase {}
withAbilities(MyManager, [EventAbility, DebounceAbility]);

// 使用
const mgr = new MyManager();
mgr.debounce('MyManager:search', () => { /* 执行搜索 */ }, 300);
```

宿主 `dispose()` 时自动取消所有防抖函数。

## 清理回调

能力通过 `onCleanup()` 注册清理回调，宿主 `dispose()` 时逆序执行：

```typescript
const TimerAbility: AbilityDefinition = {
    _initTimer() {
        const timer = setInterval(() => { /* ... */ }, 1000);
        this.onCleanup(() => clearInterval(timer));
    },
};
```

## 生命周期

```typescript
const instance = new MyManager();
// 1. 构造 → super() 自动初始化内置状态 → 能力方法可用
// 2. 使用 → 方法/getter/setter 可用
instance.dispose();
// 3. 销毁 → 清理回调 → 取消防抖 → 清空状态
```

## 能力冲突

多个能力定义同名属性时，后声明的覆盖先声明的：

```typescript
const AbilityA: AbilityDefinition = { value() { return 'A'; } };
const AbilityB: AbilityDefinition = { value() { return 'B'; } };

class Cls extends ComposableBase {}
withAbilities(Cls, [AbilityA, AbilityB]);

const instance = new Cls();
instance.value();  // 'B'
```

## this 指向

能力方法中的 `this` 自动指向宿主实例：

```typescript
const Ability: AbilityDefinition = {
    method() {
        this.abilityState;  // 内置方法
        this.logger;        // 内置日志
    },
};
```

## withAbilities vs withDefinitions

| 特性 | withAbilities | withDefinitions |
|------|---------------|-----------------|
| 跳过 `__` 前缀 key | ✅ | ❌ |
| 过滤非函数/非 accessor 值 | ✅ | ❌（普通值也复制） |
| 维护 `abilities` 数组 | ✅ | ❌ |
| 典型用途 | 注入能力 | 注入 body 定义 |

## 旧 API 迁移指南

### ComposableBase.with() → extends + withAbilities

```typescript
// 旧
class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) { }

// 新
class MyManager extends ComposableBase { }
withAbilities(MyManager, [EventAbility, DomainAbility]);
```

### createForgedClass → extends ComposableBase + withAbilities

```typescript
// 旧
const InnerClass = createForgedClass([EventAbility, DomEventsAbility]);

// 新
const InnerClass = class extends ComposableBase {};
withAbilities(InnerClass, [EventAbility, DomEventsAbility]);
```

### initForgedState → 不再需要

```typescript
// 旧
const instance = Object.create(InnerClass.prototype);
initForgedState(instance);

// 新
const instance = new InnerClass(); // 构造器自动初始化
```
