# @qimenjs/composable

**层级**: 第 2 层  
**状态**: 重构中（消费者迁移未完成）  
**依赖**: logger, async

## 概述

composable 包提供能力注入机制，是 QimenJS 能力系统的核心。通过 `ComposableBase` 正常类 + `withAbilities` / `withDefinitions` 独立函数，实现能力的声明、注入和生命周期管理，天然保留原型链和 `instanceof`。

## 核心概念

### 新架构（当前）

| 组件 | 说明 |
|------|------|
| **ComposableBase** | 正常 class，构造器自动初始化 logger / abilityStates / cleanups |
| **withAbilities** | 向已有类注入能力（原地修改原型，保留 instanceof） |
| **withDefinitions** | 向已有类注入非能力定义（body 方法、getter/setter、普通值） |

```typescript
class MyManager extends ComposableBase {
    domain = 'default';
    fetch() { this.emit('fetch'); }
}
withAbilities(MyManager, [EventAbility, DomainAbility]);

new MyManager() instanceof ComposableBase // true
```

### 旧架构（已移除）

| 组件 | 说明 | 移除原因 |
|------|------|----------|
| `createForgedClass` | 原型工厂函数，纯函数 + 原型复制 | `with` 方法在继承链中断裂 |
| `ComposableBase.with()` | 语法糖，内部调 createForgedClass | 同上 |
| `initForgedState` | 手动初始化实例内置状态 | ComposableBase 构造器自动初始化 |

旧架构的 bug：`A = ComposableBase.with([...])` → `B extends A` → `C extends B` → `C.with([...])` 时，C 的自身方法丢失，因为 `with` 闭包只记录创建时的能力数组，不感知 `extends` 子类新增的原型方法。

### 内置功能（不可选）

ComposableBase 内置以下功能，所有子类实例自动拥有：

| 方法 | 签名 | 说明 |
|------|------|------|
| `abilityState` | `abilityState<T>(key, creator?): T \| undefined` | 获取/创建能力私有状态，per-instance 隔离 |
| `setAbilityState` | `setAbilityState<T>(key, value): void` | 设置能力私有状态 |
| `onCleanup` | `onCleanup(callback): void` | 注册释放回调，dispose 时逆序执行 |
| `onBeforeDispose` | `onBeforeDispose(): void` | 释放前置钩子（可覆写，dispose 最先调用） |
| `onDisposed` | `onDisposed(): void` | 释放后置钩子（可覆写，dispose 最后调用） |
| `dispose` | `dispose(): void` | 释放：onBeforeDispose → onCleanup → 清理状态 → onDisposed |
| `logger` | `logger: ILogger` | 日志记录器 |

内置方法不可被能力覆盖。

### AbilityDefinition

能力定义为普通对象（`Record<string | symbol, any>`），属性/方法通过 `withAbilities` 复制到宿主原型：

| 属性类型 | 形式 | 复制行为 |
|----------|------|----------|
| 方法 | `fn()` | 直接作为宿主原型方法 |
| getter/setter | `{ get() {...}, set(v) {...} }` | 直接作为 descriptor 的 get/set |
| 普通值 | 跳过 | 不复制到原型 |

方法中的 `this` 自动指向宿主实例，无需手动绑定。

### withAbilities vs withDefinitions

| 特性 | withAbilities | withDefinitions |
|------|---------------|-----------------|
| 跳过 `__` 前缀 key | ✅ | ❌ |
| 过滤非函数/非 accessor 值 | ✅ | ❌（普通值也复制） |
| 维护 `abilities` 数组 | ✅ | ❌ |
| 典型用途 | 注入能力 | 注入 body 定义 |

### DebounceAbility（系统能力）

防抖已从 ComposableBase 内置方法迁移为独立能力 `DebounceAbility`，位于 `@qimenjs/system-abilities` 包。需要防抖功能的类需显式声明此能力。

## API 参考

### ComposableBase

```typescript
class ComposableBase {
    logger: any;
    constructor();
    abilityState(key: string, creator?: () => any): any | undefined;
    setAbilityState(key: string, value: any): void;
    onCleanup(callback: () => void): void;
    onBeforeDispose(): void;
    onDisposed(): void;
    dispose(): void;
}
```

正常类定义，子类 `extends` 后 `super()` 即可，不需要手动初始化。

### withAbilities

```typescript
function withAbilities(target: any, abilities: readonly AbilityDefinition[]): void
```

向已有类注入能力（原地修改原型），保留原型链和 instanceof。

### withDefinitions

```typescript
function withDefinitions(target: any, definitions: Record<string, any>): void
```

向已有类注入非能力定义（body 方法、getter/setter、普通值属性）。

### 类型导出

| 类型 | 说明 |
|------|------|
| `AbilityDefinition` | 能力定义类型，`Record<string \| symbol, any>` |
| `InferAbilities` | 从能力数组自动推导交叉类型 |
| `IComposableBase` | 强类实例接口 |

## 使用示例

### 实体管理类：extends + withAbilities

```typescript
import { ComposableBase, withAbilities } from '@/composable';

class CoreEntityManager extends ComposableBase {
    domain = 'default';
    abstract entityName: string;
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

### 组件系统：extends + withAbilities + withDefinitions

```typescript
class TemplateComponent extends ComposableBase {
    tag = 'div';
    el!: HTMLElement;
    nodeMap: Record<string, any> = {};
}
withAbilities(TemplateComponent, TEMPLATE_COMPONENT_ABILITIES);

// 内部类（template-factory 创建）
const InnerClass = class extends TemplateComponent {};
withAbilities(InnerClass, extraAbilities);
withDefinitions(InnerClass, bodyDef);
```

## 目录结构

```
src/composable/
├── ComposableBase.ts      # 正常类定义（构造器自动初始化）
├── forge.ts               # withAbilities / withDefinitions
├── index.ts               # 统一导出
└── types/
    ├── ability.ts         # 能力类型定义
    └── composable.ts      # 接口类型定义
```

## 设计决策

- **正常类而非工厂函数**：`ComposableBase` 是正常 class，子类 `extends` 后 `super()` 即可，天然保留原型链和 `instanceof`
- **独立函数而非静态方法**：`withAbilities` / `withDefinitions` 是独立函数，不再挂载在类上，避免 `with` 在继承链中断裂
- **内置方法不可覆盖**：abilityState / onCleanup / onBeforeDispose / onDisposed / dispose 等内置方法受保护，能力无法覆盖
- **debounce 迁移为能力**：DebounceAbility 从 ComposableBase 剥离，按需组合
- **移除 getStatic/setStatic**：用闭包变量或构造函数静态属性替代
- **移除 setupAbilities**：运行时注入不再需要，所有能力在类定义时确定
- **纯对象而非类**：Ability 是普通对象，不需要实例化
- **宿主统一管理状态**：`abilityState()` / `onCleanup()` 由宿主统一管理，能力无需关心生命周期
- **key 命名约定**：`abilityState` 的 key 建议使用 `AbilityName:stateName` 格式避免冲突

## 变更历史

### 2026-07-23
- 移除 `createForgedClass`、`initForgedState`、`ForgedConstructor` 导出
- 移除 `copyCallerPrototype`、内置方法独立导出（abilityState/setAbilityState/onCleanup/onBeforeDispose/onDisposed/dispose）
- `ComposableBase` 恢复为正常 class 定义，构造器自动初始化
- 新增 `withAbilities` 独立函数（向已有类注入能力）
- 新增 `withDefinitions` 独立函数（向已有类注入非能力定义）
- 导出 `ABILITY_STATES_KEY` / `CLEANUPS_KEY` Symbol keys
- 修复 `with` 方法在继承链中断裂的 bug（根本解决：移除 `with` 方法）

### 2026-07-22
- 重构为原型工厂函数架构（createForgedClass）
- ComposableBase 从 class 改为 const 语法糖
- debounce 迁移为 DebounceAbility（移至 system-abilities 包）
- 移除 getStatic / setStatic / setupAbilities / applyOverrides
- 移除 host 属性（原型复制模式下 this 即宿主，host 无语义价值）
- 内置方法不可被能力覆盖
- 新增 onBeforeDispose / onDisposed 可覆写钩子
- 提取 initForgedState()
- 修复 copyPrototypeMethods / copyStaticMethods 不遍历原型链的 bug
