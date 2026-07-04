# @qimenjs/composable

**层级**: 第 2 层  
**状态**: 完成  
**测试**: 通过  
**依赖**: logger, async

## 概述

composable 包提供了可组合能力系统，是 OrbitJS 的核心机制之一。通过 `AbilityDefinition` 纯对象 + `ComposableBase` 原型链复制，实现能力的声明、注入和生命周期管理。

## 核心概念

### AbilityDefinition

能力定义为普通对象（`Record<string | symbol, any>`），属性/方法通过 `Object.defineProperty` 直接复制到宿主实例：

| 属性类型 | 形式 | 复制行为 |
|----------|------|----------|
| 方法 | `fn()` | `bind(this)` 后作为宿主方法 |
| getter/setter | `{ get() {...}, set(v) {...} }` | 直接作为 descriptor 的 get/set |
| 普通值 | `42` / `'hello'` | 直接作为 value |

方法中的 `this` 自动指向宿主实例，无需手动绑定。

### ComposableBase

抽象基类，提供能力注入和生命周期管理：

```typescript
import { ComposableBase, type AbilityDefinition } from '@qimenjs/composable';

// 1. 定义能力
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

// 2. 声明宿主
class MyHost extends ComposableBase {
    static readonly abilities = [CounterAbility];
}

// 3. 使用
const host = new MyHost() as any;
host.increment();  // count: 1
host.increment();  // count: 2
host.dispose();    // 清理所有状态
```

## API 参考

### ComposableBase 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `abilityState` | `abilityState<T>(key: string, creator?: () => T): T \| undefined` | 获取/创建能力私有状态，per-host 隔离 |
| `setAbilityState` | `setAbilityState<T>(key: string, value: T): void` | 设置能力私有状态 |
| `debounce` | `debounce<A>(key: string, fn: A, wait?: number, immediate?: boolean): A & { cancel() }` | 获取/创建防抖函数，per-host 隔离 |
| `onCleanup` | `onCleanup(callback: () => void): void` | 注册清理回调，dispose 时逆序执行 |
| `getStatic` | `getStatic<T>(key: string \| symbol): T \| undefined` | 获取类级缓存（跨实例共享） |
| `setStatic` | `setStatic<T>(key: string \| symbol, value: T): void` | 设置类级缓存 |
| `dispose` | `dispose(): void` | 销毁：清理回调 → 取消防抖 → 清空状态 |
| `host` | `get host(): this` | 返回宿主自身（语义属性） |

### 静态属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `abilities` | `readonly AbilityDefinition[]` | 声明所需能力列表 |

### 类型导出

| 类型 | 说明 |
|------|------|
| `AbilityDefinition` | 能力定义类型，`Record<string \| symbol, any>` |
| `IComposableBase` | ComposableBase 接口 |
| `IExposeResult` | 暴露清单接口 |
| `IComposable` | 旧版兼容接口（@deprecated） |

## 能力继承

子类通过 `static readonly abilities` 声明能力，ComposableBase 自动从原型链收集：

```typescript
class Parent extends ComposableBase {
    static readonly abilities: readonly AbilityDefinition[] = [AbilityA];
}

class Child extends Parent {
    static readonly abilities: readonly AbilityDefinition[] = [AbilityB];
}

// Child 实例同时拥有 AbilityA 和 AbilityB
const child = new Child() as any;
child.methodA();  // 来自 AbilityA
child.methodB();  // 来自 AbilityB
```

## 目录结构

```
src/composable/
├── ComposableBase.ts      # 核心基类
├── index.ts               # 统一导出
└── types/
    └── composable.ts      # 类型定义
```

## 设计决策

- **纯对象而非类**：Ability 是普通对象，不需要实例化，不需要 `new`，不需要 `expose()` 方法
- **原型链复制而非代理**：属性直接复制到宿主实例，访问无中间层开销
- **宿主统一管理状态**：`abilityState()` / `debounce()` / `onCleanup()` 由宿主统一管理，能力无需关心生命周期
- **key 命名约定**：`abilityState` 的 key 建议使用 `AbilityName:stateName` 格式避免冲突
