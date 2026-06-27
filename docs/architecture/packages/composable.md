# @orbitjs/composable

**层级**: 第 1 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过（30/30）  
**覆盖率**: ~65%（核心类 90%+）

## 概述

可组合能力系统，提供能力注入和管理的基础功能。通过预编译机制实现高性能的能力注入，避免运行时原型链爬取。

## 功能

- **ComposableBase** - 可组合基类，提供能力注入功能
- **AbilityBase** - 能力基类，提供 `expose()` API 定义能力
- **ComposableRegistrar** - 能力注册器（继承 RegistrarBase），管理预编译缓存
- **DescriptorFactory** - 描述符工厂，提供便捷的属性描述符创建方法
- **DebounceAbilityBase** - 防抖能力基类
- **预编译能力** - 性能优化，避免运行时原型链爬取

## 依赖

```typescript
dependencies: {
  '@orbitjs/logger': 'L0',  // 日志
  '@orbitjs/async': 'L0',   // 异步工具（DebounceAbilityBase 使用）
  '@orbitjs/registry': 'L1', // 注册器基类（ComposableRegistrar 继承 RegistrarBase）
}
```

## 目录结构

```
src/composable/
├── types/
│   └── composable.ts       # 类型定义（含 AbilityConstructor）
├── ComposableBase.ts       # 可组合基类
├── AbilityBase.ts          # 能力基类
├── ComposableRegistrar.ts  # 能力注册器
├── DescriptorFactory.ts    # 描述符工厂
├── DebounceAbilityBase.ts  # 防抖能力基类
└── index.ts                # 入口
```

## 使用示例

### 定义能力

```typescript
import { AbilityBase, type IExposeResult } from '@orbitjs/composable';

class EventAbility extends AbilityBase {
    readonly name = 'Event';
    
    protected expose(): IExposeResult {
        const scope = globalEventBus.createEventScope();
        
        return {
            eventScope: { get: () => scope },
            on: (event, handler) => scope.on(event, handler),
            emit: (event, data) => scope.emit(event, data),
        };
    }
    
    protected onDispose() {
        this.eventScope?.dispose();
    }
}
```

### 使用能力

```typescript
import { ComposableBase, type AbilityConstructor } from '@orbitjs/composable';

class MyComponent extends ComposableBase {
    static readonly abilities: readonly AbilityConstructor[] = [EventAbility, CacheAbility];
    
    constructor() {
        super();
        // 现在可以使用 this.on, this.emit, this.cache 等
    }
}
```

### 继承能力

```typescript
import { ComposableBase, type AbilityConstructor } from '@orbitjs/composable';

class Parent extends ComposableBase {
    static readonly abilities: readonly AbilityConstructor[] = [EventAbility];
}

class Child extends Parent {
    static readonly abilities: readonly AbilityConstructor[] = [CacheAbility];
}

// Child 实例同时拥有 EventAbility 和 CacheAbility 的能力
```

### 注册能力

```typescript
import { ComposableRegistrar } from '@orbitjs/composable';

const registrar = ComposableRegistrar.getInstance();

// 注册能力类（可选立即预编译）
registrar.register(EventAbility, { immediate: true });

// 获取预编译能力（自动预编译 + 缓存）
const precompiled = registrar.get(EventAbility);

// 注销能力
registrar.unregister('Event');
```

## API

### ComposableBase

```typescript
abstract class ComposableBase implements IComposableBase {
    static readonly abilities: readonly AbilityConstructor[];
    logger: ILogger;
    [key: string]: any;
    
    constructor();  // 自动收集能力并注入
    
    getStatic<T>(key: string | symbol): T | undefined;
    setStatic<T>(key: string | symbol, value: T): void;
    dispose(): void;  // 按装配逆序执行销毁函数
    
    protected collectAbilities(): AbilityConstructor[];  // 从原型链收集能力（去重+缓存）
    protected setupAbilities(): void;  // 自动装配能力
    protected applyOverrides(): void;  // 子类可重写以自定义功能
}
```

### AbilityBase

```typescript
abstract class AbilityBase implements IPrecompilableAbility {
    abstract readonly name: string;
    protected host: any;
    
    protected abstract expose(): IExposeResult;
    protected onDispose(): void;
    
    precompile(): IPrecompiledAbility;
}
```

### ComposableRegistrar

```typescript
class ComposableRegistrar extends RegistrarBase<AbilityStorage> {
    readonly name = 'ComposableRegistrar';
    
    register(AbilityClass: AbilityConstructor, options?: { immediate?: boolean }): void;
    unregister(name: string): void;
    get(AbilityClass: AbilityConstructor): IPrecompiledAbility | undefined;
    has(name: string): boolean;
    getAllNames(): string[];
    clearCaches(): void;
    clear(): void;
}
```

### 核心类型

```typescript
// 能力类构造函数类型
type AbilityConstructor = new () => IPrecompilableAbility;

// 预编译能力接口
interface IPrecompiledAbility {
    readonly name: string;
    readonly descriptorFactories: Map<string | symbol, DescriptorFactoryFn>;
    readonly createDisposer?: DisposerFactoryFn;
}

// 暴露清单接口
interface IExposeResult {
    [key: string | symbol]: ExposeValue;
}
```

## 测试状态

### 测试覆盖

| 文件 | 语句覆盖 | 分支覆盖 | 函数覆盖 |
|------|----------|----------|----------|
| AbilityBase.ts | 100% | 90% | 100% |
| ComposableBase.ts | 92% | 85% | 100% |
| ComposableRegistrar.ts | 54% | 28% | 67% |
| DebounceAbilityBase.ts | 30% | 0% | 0% |
| DescriptorFactory.ts | 3% | 0% | 0% |

### 通过的测试（30个）

**AbilityBase（16个）**
- ✅ precompile - should create precompiled ability with name
- ✅ precompile - should create descriptor factories for all exposed properties
- ✅ precompile - should handle symbol properties
- ✅ precompile - should handle getter/setter properties
- ✅ descriptor factories - should create working descriptors for simple values
- ✅ descriptor factories - should create working descriptors for methods
- ✅ descriptor factories - should create working descriptors for getter/setter
- ✅ disposer - should create disposer function
- ✅ disposer - should call onDispose when disposer is called

**ComposableBase（6个）**
- ✅ constructor - should initialize with a logger
- ✅ static abilities - should inject abilities from static property
- ✅ static abilities - should inject multiple abilities
- ✅ inheritance - should collect abilities from prototype chain
- ✅ inheritance - should handle class with no abilities
- ✅ getStatic and setStatic - should store and retrieve static values
- ✅ getStatic and setStatic - should return undefined for non-existent keys
- ✅ dispose - should dispose without errors

**ComposableRegistrar（9个）**
- ✅ get - should return precompiled ability and cache it
- ✅ get - should return cached result on second call
- ✅ get - should handle multiple ability classes
- ✅ has - should return false before get is called
- ✅ has - should return true after get is called
- ✅ getAllNames - should return empty array initially
- ✅ getAllNames - should return all cached ability names
- ✅ clearCaches - should clear all caches
- ✅ clear - should clear all data

**index（3个）**
- ✅ should export ComposableBase
- ✅ should export AbilityBase
- ✅ should allow creating composable with abilities

## 遗留工作

- [ ] 提高 ComposableRegistrar 测试覆盖率（当前 54%）
- [ ] 编写 DebounceAbilityBase 测试（当前 30%）
- [ ] 编写 DescriptorFactory 测试（当前 3%）
- [ ] 提高整体覆盖率到 80%+

## 设计决策

- [2026-06-15-composable-refactoring](../../design-decisions/2026-06-15-composable-refactoring.md) - Composable 系统重构
- [2026-06-15-registrar-architecture](../../design-decisions/2026-06-15-registrar-architecture.md) - 注册器架构统一

## 变更历史

### 2026-06-27
- 修复 ComposableRegistrar 缺少 `register()`/`unregister()` 抽象方法实现
- 新增 `AbilityConstructor` 类型，替代 `typeof AbilityBase`（解决抽象类不能 new 和静态属性协变问题）
- ComposableBase.abilities 类型改为 `readonly AbilityConstructor[]`
- 删除 src/composable/ 下旧编译产物（.js/.d.ts），解决 Jest 加载旧代码问题
- 所有测试通过（30/30）

### 2026-06-15
- 重构 ComposableRegistrar 从 RegistrarBase 派生
- 添加 ComposableEntry 类型
- 更新导入路径
- 测试部分失败，需要重写

### 之前
- 实现 AbilityBase 和 ComposableBase
- 实现预编译能力
- 实现 expose() API
