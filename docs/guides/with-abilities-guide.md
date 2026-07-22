# 能力系统使用指南

## 概述

QimenJS 的能力系统基于 `AbilityDefinition` 纯对象 + 原型工厂函数 `createForgedClass`。能力是普通对象，通过工厂函数注入到强类原型上。`ComposableBase.with()` 是工厂函数的语法糖，用于 `class extends` 写法。

## 两种使用模式

### 原型工厂函数（组件推荐）

```typescript
import { createForgedClass } from '@/composable';

const InnerClass = createForgedClass([EventAbility, DomEventsAbility]);
const instance = new InnerClass();
instance.on('click', handler);
instance.dispose();
```

### ComposableBase.with() 语法糖（EntityManager 推荐）

```typescript
import { ComposableBase } from '@/composable';

class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) {
    domain = 'default';
    fetch() { this.emit('fetch'); }
}
```

## 内置功能

所有强类实例自动拥有以下内置方法（不可被能力覆盖）：

| 方法 | 说明 |
|------|------|
| `abilityState(key, creator?)` | 获取/创建能力私有状态 |
| `setAbilityState(key, value)` | 设置能力私有状态 |
| `onCleanup(callback)` | 注册释放回调 |
| `dispose()` | 释放资源 |
| `host` | 宿主自身引用 |
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

class MyManager extends ComposableBase.with([EventAbility, DebounceAbility]) {
    search(keyword: string) {
        return this.debounce('MyManager:search', () => {
            // 执行搜索
        }, 300);
    }
}
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
const instance = new InnerClass();
// 1. 构造 → 内置状态初始化 → 能力方法可用
// 2. 使用 → 方法/getter/setter 可用
instance.dispose();
// 3. 销毁 → 清理回调 → 取消防抖 → 清空状态
```

## 能力冲突

多个能力定义同名属性时，后声明的覆盖先声明的：

```typescript
const AbilityA: AbilityDefinition = { value: 'A' };
const AbilityB: AbilityDefinition = { value: 'B' };

const Cls = createForgedClass([AbilityA, AbilityB]);
const instance = new Cls();
(instance as any).value;  // 'B'
```

## this 指向

能力方法中的 `this` 自动指向宿主实例：

```typescript
const Ability: AbilityDefinition = {
    method() {
        this.host;          // 宿主自身
        this.abilityState;  // 内置方法
        this.logger;        // 内置日志
    },
};
```
