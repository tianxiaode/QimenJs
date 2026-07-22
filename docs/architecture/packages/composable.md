# @qimenjs/composable

**层级**: 第 2 层  
**状态**: 重构中  
**依赖**: logger, async

## 概述

composable 包提供原型工厂函数 `createForgedClass`，是 QimenJS 能力系统的核心机制。通过 `AbilityDefinition` 纯对象 + 原型复制，实现能力的声明、注入和生命周期管理。

`ComposableBase` 是工厂函数的语法糖，用于 `class extends` 写法。

## 核心概念

### 双层架构

| 层级 | 机制 | 适用场景 |
|------|------|----------|
| **createForgedClass** | 原型工厂函数，纯函数 + 原型复制 | 组件（无继承链，平铺组装） |
| **ComposableBase.with()** | 语法糖，内部调 createForgedClass | EntityManager 等需要 `extends` 的类 |

### 内置功能（不可选）

工厂函数内置以下功能，所有强类实例自动拥有：

| 方法 | 签名 | 说明 |
|------|------|------|
| `abilityState` | `abilityState<T>(key, creator?): T \| undefined` | 获取/创建能力私有状态，per-instance 隔离 |
| `setAbilityState` | `setAbilityState<T>(key, value): void` | 设置能力私有状态 |
| `onCleanup` | `onCleanup(callback): void` | 注册释放回调，dispose 时逆序执行 |
| `dispose` | `dispose(): void` | 释放：清理回调 → 取消防抖 → 清空状态 |
| `host` | `get host(): this` | 返回宿主自身 |
| `logger` | `logger: ILogger` | 日志记录器 |

内置方法不可被能力覆盖。

### AbilityDefinition

能力定义为普通对象（`Record<string | symbol, any>`），属性/方法通过 `Object.defineProperty` 复制到宿主原型：

| 属性类型 | 形式 | 复制行为 |
|----------|------|----------|
| 方法 | `fn()` | 直接作为宿主原型方法 |
| getter/setter | `{ get() {...}, set(v) {...} }` | 直接作为 descriptor 的 get/set |
| 普通值 | 跳过 | 不复制到原型 |

方法中的 `this` 自动指向宿主实例，无需手动绑定。

### DebounceAbility（系统能力）

防抖已从 ComposableBase 内置方法迁移为独立能力 `DebounceAbility`，位于 `@qimenjs/system-abilities` 包。需要防抖功能的类需显式声明此能力。

## API 参考

### createForgedClass

```typescript
function createForgedClass<A extends readonly AbilityDefinition[]>(
    abilities: A
): ForgedConstructor<any, A>
```

创建强类：纯函数 → 初始化内置状态 → 注入能力到原型。

### ComposableBase

```typescript
const ComposableBase = {
    with<A extends readonly AbilityDefinition[]>(...abilities: A): ForgedConstructor<any, A>
}
```

语法糖，等价于 `createForgedClass(abilities)`。

### 类型导出

| 类型 | 说明 |
|------|------|
| `AbilityDefinition` | 能力定义类型，`Record<string \| symbol, any>` |
| `ForgedConstructor` | 强类构造函数类型，含 `with()` 链式方法 |
| `InferAbilities` | 从能力数组自动推导交叉类型 |
| `IComposableBase` | 强类实例接口 |

## 使用示例

### 组件：直接用工厂函数

```typescript
import { createForgedClass } from '@/composable';

const InnerClass = createForgedClass([EventAbility, DomEventsAbility]);
const instance = new InnerClass();
instance.on('click', handler);  // 能力方法
instance.dispose();             // 内置方法
```

### 类继承：ComposableBase.with() 语法糖

```typescript
import { ComposableBase } from '@/composable';

class MyManager extends ComposableBase.with([EventAbility, DomainAbility]) {
    domain = 'default';
    fetch() { this.emit('fetch'); }
}
```

### 链式 with()

```typescript
class MyManager extends ComposableBase.with([EventAbility]).with([DomainAbility]) {
    // 等价于 ComposableBase.with([EventAbility, DomainAbility])
}
```

## 目录结构

```
src/composable/
├── ComposableBase.ts      # 语法糖（ComposableBase.with）
├── forge.ts               # 原型工厂函数（createForgedClass）
├── index.ts               # 统一导出
└── types/
    ├── ability.ts         # 能力类型定义
    └── composable.ts      # 接口类型定义
```

## 设计决策

- **原型工厂而非类继承**：`createForgedClass` 创建纯函数 + 原型复制，无继承链污染
- **内置方法不可覆盖**：abilityState / onCleanup / dispose 等内置方法受保护，能力无法覆盖
- **debounce 迁移为能力**：DebounceAbility 从 ComposableBase 剥离，按需组合
- **移除 getStatic/setStatic**：工厂模式下用闭包变量或构造函数静态属性替代
- **移除 setupAbilities**：运行时注入不再需要，所有能力在类创建时确定
- **纯对象而非类**：Ability 是普通对象，不需要实例化
- **宿主统一管理状态**：`abilityState()` / `onCleanup()` 由宿主统一管理，能力无需关心生命周期
- **key 命名约定**：`abilityState` 的 key 建议使用 `AbilityName:stateName` 格式避免冲突

## 变更历史

### 2026-07-22
- 重构为原型工厂函数架构（createForgedClass）
- ComposableBase 从 class 改为 const 语法糖
- debounce 迁移为 DebounceAbility（移至 system-abilities 包）
- 移除 getStatic / setStatic / setupAbilities / applyOverrides
- 内置方法（abilityState / onCleanup / dispose）不可被能力覆盖
- IComposableBase 接口更新：移除 getStatic/setStatic，新增 abilityState/setAbilityState/onCleanup/dispose
