# @orbitjs/system-abilities

**层级**: 第 3 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: 28.25%

## 概述

系统能力包，提供可组合的系统能力类，用于扩展类的功能。

## 功能

- **EventAbility** - 事件能力，提供事件监听和发射功能
- **DomEventsAbility** - DOM 事件能力，提供手势事件处理功能
- **DomainAbility** - 域配置能力，提供域配置访问功能
- **SystemAbility** - 系统配置能力，提供系统配置访问功能

## 能力注册

提供 `registerSystemAbilities()` 函数，将所有系统能力注册到 ComposableRegistrar。

## 依赖

- `@orbitjs/composable` - 可组合基类
- `@orbitjs/events` - 事件总线
- `@orbitjs/event-dom` - DOM 事件处理
- `@orbitjs/registry` - 注册表

## 使用示例

```typescript
import { registerSystemAbilities, EventAbility } from '@orbitjs/system-abilities';
import { ComposableRegistrar } from '@orbitjs/composable';

// 注册所有系统能力
registerSystemAbilities();

// 获取能力实例
const registrar = ComposableRegistrar.getInstance();
const eventAbility = registrar.getPrecompiled(EventAbilityEntry.name);
```

## API

```typescript
// 注册系统能力
function registerSystemAbilities(registrar?: ComposableRegistrar): void;

// 能力入口
interface ComposableEntry {
    name: string;
    description: string;
    deps?: string[];
    abilityClass: any;
}

// 能力名称常量
const EventAbilityName = 'EventAbility';
const DomEventsAbilityName = 'DomEventsAbility';
const DomainAbilityName = 'DomainAbility';
const SystemAbilityName = 'SystemAbility';
```

## 能力类

### EventAbility
提供事件监听、一次性监听和事件发射的能力。

```typescript
class EventAbility extends AbilityBase {
    on(event: string, handler: Function): void;
    once(event: string, handler: Function): void;
    emit(event: string, data?: any): void;
}
```

### DomEventsAbility
提供 DOM 手势事件处理能力。

```typescript
class DomEventsAbility extends AbilityBase {
    bind(target: any, semantic: GestureSemantic, scope: any, options?: any): any;
}
```

### DomainAbility
提供域配置访问能力。

```typescript
class DomainAbility extends AbilityBase {
    getDomainConfig(): DomainConfig | undefined;
}
```

### SystemAbility
提供系统配置访问能力。

```typescript
class SystemAbility extends AbilityBase {
    getSystemConfig(): SystemConfig | undefined;
}
```

## 测试状态

- ✅ 1 个测试套件通过
- ✅ 11 个测试全部通过
- ⚠️ 代码覆盖率 28.25%（仅测试核心功能）

## 变更历史

### 2026-06-26
- 修正所有模块引用，使用 `@/` 代替 `@orbitjs/`
- 创建能力注册函数 `registerSystemAbilities()`
- 创建完整的类型定义
- 编写单元测试
- 所有测试通过

### 初始版本
- 实现各种能力类
- 提供能力入口定义
