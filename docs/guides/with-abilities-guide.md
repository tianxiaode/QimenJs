# 能力系统使用指南

## 概述

QimenJS 的能力系统基于 `AbilityDefinition` 纯对象 + `ComposableBase.use()` / `ComposableBase.define()` 静态方法。能力是普通对象，通过静态方法注入到类原型上。`ComposableBase` 是正常类，子类 `extends` 后 `super()` 即可，天然保留原型链和 `instanceof`。

## 使用模式

### extends ComposableBase + use()（推荐）

```typescript
import { ComposableBase } from '@/composable';
import type { InferAbilities } from '@/composable';

class MyManager extends ComposableBase {
    domain = 'default';
    fetch() { this.emit('fetch'); }
}

const MY_ABILITIES = [EventAbility, DomainAbility] as const;
MyManager.use(MY_ABILITIES);

// 声明合并：让 TypeScript 知道 MyManager 实例拥有能力注入的方法
export interface MyManager extends InferAbilities<typeof MY_ABILITIES> {}

new MyManager() instanceof ComposableBase // true
```

### 多层继承 + 逐层注入能力

```typescript
import type { InferAbilities } from '@/composable';

class CoreEntityManager extends ComposableBase {
    domain = 'default';
}

const CORE_ABILITIES = [EventAbility, DomainAbility, SystemAbility, SchemaAbility] as const;
CoreEntityManager.use(CORE_ABILITIES);
export interface CoreEntityManager extends InferAbilities<typeof CORE_ABILITIES> {}

class BaseEntityManager extends CoreEntityManager {
    async fetch(action, options) { /* ... */ }
}

class LocalReadonlyEntityManager extends BaseEntityManager {
    isRemote = false;
    items: IEntity[] = [];
}

const LOCAL_READONLY_ABILITIES = [FlatLocalStateAbility, LocalListAbility, LocalGetAbility] as const;
LocalReadonlyEntityManager.use(LOCAL_READONLY_ABILITIES);
export interface LocalReadonlyEntityManager extends InferAbilities<typeof LOCAL_READONLY_ABILITIES> {}
```

### define()：注入 body 定义

```typescript
class MyComponent extends TemplateComponent {}
MyComponent.use([EventAbility]);
MyComponent.define({
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
MyManager.use([EventAbility, DebounceAbility]);

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
Cls.use([AbilityA, AbilityB]);

const instance = new Cls();
instance.value();  // 'B'
```

## this 指向

能力方法中的 `this` 自动指向宿主实例。能力方法需添加 `this: any` 类型标注以避免 TypeScript 类型错误：

```typescript
const Ability: AbilityDefinition = {
    method(this: any) {
        this.abilityState;  // 内置方法
        this.logger;        // 内置日志
    },
};
```

> **注意**：`this: any` 是编译期类型标注，运行时 `this` 仍正确指向宿主实例。这是因为 use() 将方法注入到类原型上，调用时 `this` 自然绑定到实例。

## use() vs define()

| 特性 | use() | define() |
|------|-------|----------|
| 跳过 `__` 前缀 key | ✅ | ❌ |
| 过滤非函数/非 accessor 值 | ✅ | ❌（普通值也复制） |
| 维护 `abilities` 数组 | ✅ | ❌ |
| 典型用途 | 注入能力 | 注入 body 定义 |

## InferAbilities 声明合并

`use()` 在运行时将能力方法注入到类原型，但 TypeScript 无法自动感知这些方法。通过 `InferAbilities` + 声明合并解决：

```typescript
const ABILITIES = [EventAbility, DomainAbility] as const;
MyClass.use(ABILITIES);

// 让 TS 知道 MyClass 实例拥有 EventAbility 和 DomainAbility 注入的方法
export interface MyClass extends InferAbilities<typeof ABILITIES> {}
```

**关键**：能力数组必须用 `as const` 断言，否则 `InferAbilities` 无法推导具体类型。

## 旧 API 迁移指南

### ComposableBase.with() → extends + use() + InferAbilities

```typescript
// 旧
class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) { }

// 新
const MY_ABILITIES = [EventAbility, DomainAbility] as const;
class MyManager extends ComposableBase { }
MyManager.use(MY_ABILITIES);
export interface MyManager extends InferAbilities<typeof MY_ABILITIES> {}
```

### withAbilities → use()

```typescript
// 旧
withAbilities(MyClass, [EventAbility, DomainAbility]);

// 新
MyClass.use([EventAbility, DomainAbility]);
```

### withDefinitions → define()

```typescript
// 旧
withDefinitions(MyClass, bodyDef);

// 新
MyClass.define(bodyDef);
```

### createForgedClass → extends ComposableBase + use()

```typescript
// 旧
const InnerClass = createForgedClass([EventAbility, DomEventsAbility]);

// 新
const InnerClass = class extends ComposableBase {};
InnerClass.use([EventAbility, DomEventsAbility]);
```

### initForgedState → 不再需要

```typescript
// 旧
const instance = Object.create(InnerClass.prototype);
initForgedState(instance);

// 新
const instance = new InnerClass(); // 构造器自动初始化
```
