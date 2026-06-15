# @orbitjs/composable

**层级**: 第 1 层  
**状态**: ⚠️ 重构中  
**测试**: ⚠️ 部分通过（6/13）  
**覆盖率**: ~60%

## 概述

可组合能力系统，提供能力注入和管理的基础功能。

## 功能

- **ComposableBase** - 可组合基类，提供能力注入功能
- **AbilityBase** - 能力基类，提供能力定义 API
- **ComposableRegistrar** - 能力注册器，管理所有能力
- **Ability 装饰器** - 声明类需要的能力
- **预编译能力** - 性能优化，避免运行时原型链爬取

## 依赖

```typescript
dependencies: {
  '@orbitjs/logger': 'L0',  // 日志
  '@orbitjs/async': 'L0',   // 异步工具
}
```

## 目录结构

```
src/composable/
├── types/
│   ├── composable.ts       # 类型定义
│   └── index.ts
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
import { AbilityBase } from '@orbitjs/composable';

class EventAbility extends AbilityBase {
    readonly name = 'Event';
    
    protected expose() {
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
import { ComposableBase, Ability } from '@orbitjs/composable';

@Ability('Event', 'Cache')
class MyComponent extends ComposableBase {
    constructor() {
        super();
        // 现在可以使用 this.on, this.emit, this.cache 等
    }
}
```

### 注册能力

```typescript
import { ComposableRegistrar } from '@orbitjs/composable';

const registrar = ComposableRegistrar.getInstance();

registrar.register(
    { name: 'Event', ctor: EventAbility },
    EventAbility,
    { immediate: true }  // 立即预编译
);
```

## API

### ComposableBase

```typescript
abstract class ComposableBase {
    logger: ILogger;
    
    getStatic<T>(key: string | symbol): T | undefined;
    setStatic<T>(key: string | symbol, value: T): void;
    dispose(): void;
}
```

### AbilityBase

```typescript
abstract class AbilityBase {
    abstract readonly name: string;
    
    protected abstract expose(): IExposeResult;
    protected onDispose(): void;
    
    precompile(): IPrecompiledAbility;
}
```

### ComposableRegistrar

```typescript
class ComposableRegistrar extends RegistrarBase {
    register(entry, abilityClass, options?): void;
    unregister(name: string): void;
    get(name: string): IAbilityRegistrationEntry | undefined;
    getPrecompiled(name: string): IPrecompiledAbility | undefined;
    getRecursive(names: string[]): ComposableEntry[];
    has(name: string): boolean;
    getAllNames(): string[];
}
```

## 测试状态

### 通过的测试（6个）
- ✅ ComposableBase constructor
- ✅ ComposableBase getStatic and setStatic
- ✅ ComposableBase Ability decorator

### 失败的测试（7个）
- ❌ AbilityBase attach - 测试代码需要更新
- ❌ AbilityBase dispose - 测试代码需要更新
- ❌ ComposableBase setupAbilities - 测试代码需要更新
- ❌ ComposableBase dispose - 测试代码需要更新

### 问题
1. 测试代码为旧版本编写，需要重写
2. AbilityBase 需要实现 `name` 属性
3. ComposableBase 的一些内部方法不存在

## 已知问题

### 问题 1：测试覆盖率低
- **原因**: 测试代码为旧版本编写
- **影响**: 无法验证功能正确性
- **解决方案**: 重写测试
- **优先级**: 高

### 问题 2：API 变化
- **原因**: 重构导致 API 变化
- **影响**: 旧代码可能不兼容
- **解决方案**: 更新文档和示例
- **优先级**: 中

## 遗留工作

- [ ] 重写单元测试
- [ ] 提高测试覆盖率到 80%+
- [ ] 更新使用文档
- [ ] 添加更多示例
- [ ] 性能测试

## 设计决策

- [2026-06-15-composable-refactoring](../../design-decisions/2026-06-15-composable-refactoring.md) - Composable 系统重构
- [2026-06-15-registrar-architecture](../../design-decisions/2026-06-15-registrar-architecture.md) - 注册器架构统一

## 变更历史

### 2026-06-15
- 重构 ComposableRegistrar 从 RegistrarBase 派生
- 添加 ComposableEntry 类型
- 更新导入路径
- 测试部分失败，需要重写

### 之前
- 实现 AbilityBase 和 ComposableBase
- 实现预编译能力
- 实现 expose() API
