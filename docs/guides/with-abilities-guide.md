# 能力系统使用指南

## 概述

QimenJS 的能力系统基于 `AbilityDefinition` 纯对象 + `ComposableBase` 原型链复制机制。能力（Ability）是普通对象，通过 `static readonly abilities` 声明，ComposableBase 在实例化时自动注入。

## 基本用法

### 定义能力

能力是普通对象，包含方法、getter/setter 或普通值：

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

// 普通值
const VersionAbility: AbilityDefinition = {
    version: '1.0.0',
};
```

### 使用能力

```typescript
import { ComposableBase } from '@qimenjs/composable';

class MyHost extends ComposableBase {
    static readonly abilities = [GreetAbility, LabelAbility];
    _label = 'default';
    constructor(public name: string) { super(); }
}

const host = new MyHost('World') as any;
host.greet();       // 'Hello, World!'
host.label;         // 'default'
host.label = 'new'; // setter
```

### 组合多个能力

```typescript
class FullHost extends ComposableBase {
    static readonly abilities = [GreetAbility, LabelAbility, VersionAbility];
}
```

### 能力继承

子类自动继承父类的所有能力：

```typescript
class BaseManager extends ComposableBase {
    static readonly abilities: readonly AbilityDefinition[] = [EventAbility];
}

class EntityManager extends BaseManager {
    static readonly abilities: readonly AbilityDefinition[] = [DomainAbility, SystemAbility];
}

// EntityManager 实例拥有 EventAbility + DomainAbility + SystemAbility
```

## 私有状态

能力通过 `abilityState()` 管理私有状态，每个宿主实例独立隔离：

```typescript
const CounterAbility: AbilityDefinition = {
    count: {
        get() {
            return this.abilityState('Counter:count', () => 0);
        },
    },
    increment() {
        const current = this.abilityState('Counter:count', () => 0)!;
        this.setAbilityState('Counter:count', current + 1);
    },
};

// 多实例隔离
const host1 = new MyHost() as any;
const host2 = new MyHost() as any;
host1.increment();
host1.count;  // 1
host2.count;  // 0
```

**key 命名约定**：使用 `AbilityName:stateName` 格式避免冲突。

## 防抖

能力通过 `debounce()` 管理防抖函数，每个宿主实例独立隔离：

```typescript
const SearchAbility: AbilityDefinition = {
    search(keyword: string) {
        return this.debounce('SearchAbility:search', () => {
            // 执行搜索
        }, 300);
    },
};
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
const host = new MyHost() as any;
// 1. 构造 → 能力自动注入
// 2. 使用 → 方法/getter/setter 可用
host.dispose();
// 3. 销毁 → 清理回调 → 取消防抖 → 清空状态
```

## 能力冲突

多个能力定义同名属性时，后声明的覆盖先声明的：

```typescript
const AbilityA: AbilityDefinition = { value: 'A' };
const AbilityB: AbilityDefinition = { value: 'B' };

class Host extends ComposableBase {
    static readonly abilities = [AbilityA, AbilityB];
}

const host = new Host() as any;
host.value;  // 'B'（AbilityB 覆盖了 AbilityA）
```

## this 指向

能力方法中的 `this` 自动指向宿主实例：

```typescript
const Ability: AbilityDefinition = {
    method() {
        // this === 宿主实例
        this.host;          // 宿主自身
        this.abilityState;  // 宿主方法
        this.logger;        // 宿主日志
        this.domain;        // 宿主属性
    },
};
```
