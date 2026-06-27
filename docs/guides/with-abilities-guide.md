# WithAbilities 装饰器使用指南

## 概述

`WithAbilities` 装饰器提供了一种简洁的方式来为类添加能力（Abilities）。它会在装饰时自动注册能力类，并为目标类注入能力方法。

## 核心特性

1. **自动注册** - 无需手动注册能力类
2. **类型安全** - 完整的 TypeScript 类型支持
3. **组合能力** - 支持多个能力组合
4. **接口支持** - 提供能力接口方便类型标注

## 基本用法

### 1. 定义能力类

```typescript
import { AbilityBase, IExposeResult } from '@/composable';

export class EventAbility extends AbilityBase {
    // 能力名称（使用类名）
    readonly name = 'EventAbility';
    
    // 静态元数据
    static readonly description = '事件能力';
    static readonly deps: string[] = [];
    
    // 暴露能力方法
    protected expose(): IExposeResult {
        return {
            on: (event: string, handler: Function) => {
                // 实现逻辑
            },
            emit: (event: string, data?: any) => {
                // 实现逻辑
            }
        };
    }
}
```

### 2. 使用装饰器

```typescript
import { WithAbilities } from '@/composable';
import { EventAbility } from './EventAbility';
import { DomainAbility } from './DomainAbility';

// 使用装饰器（自动注册 + 添加能力）
@WithAbilities([EventAbility, DomainAbility])
class EntityManager {
    // 自动拥有能力方法
}

// 使用
const manager = new EntityManager();
manager.on('click', handler);  // ✅ 来自 EventAbility
manager.getDomain();           // ✅ 来自 DomainAbility
```

### 3. 类型标注

```typescript
import { IEventAbility, IDomainAbility } from '@/system-abilities';

// 定义组合接口
export interface IEntityManager 
    extends IEventAbility, IDomainAbility {}

// 使用接口标注
@WithAbilities([EventAbility, DomainAbility])
class EntityManager implements IEntityManager {
    // 类型安全的能力方法
}

const manager: IEntityManager = new EntityManager();
manager.on('click', handler);  // ✅ 类型安全
```

## 高级用法

### 1. 能力依赖

```typescript
// DomEventsAbility 依赖 EventAbility
export class DomEventsAbility extends AbilityBase {
    readonly name = 'DomEventsAbility';
    
    static readonly deps = ['EventAbility'];
    
    protected expose(): IExposeResult {
        return {
            bind: (target, semantic, handler) => {
                // 可以访问 this.host.eventScope
            }
        };
    }
}

// 使用时自动处理依赖
@WithAbilities([EventAbility, DomEventsAbility])
class MyComponent {
    // 两个能力都会被正确初始化
}
```

### 2. Getter/Setter 属性

```typescript
export class StateAbility extends AbilityBase {
    readonly name = 'StateAbility';
    
    private _state = { loading: false };
    
    protected expose(): IExposeResult {
        return {
            // Getter 属性
            loading: {
                get: () => this._state.loading
            },
            
            // Getter/Setter 属性
            state: {
                get: () => this._state,
                set: (value) => { this._state = value; }
            }
        };
    }
}

@WithAbilities([StateAbility])
class MyComponent {
    // 自动拥有 loading getter 和 state getter/setter
}

const component = new MyComponent();
console.log(component.loading);  // false
component.state = { loading: true };
```

### 3. 能力宿主接口

```typescript
import { IAbilityHost } from '@/composable';

@WithAbilities([EventAbility])
class MyComponent {
    // 自动实现 IAbilityHost
}

const component = new MyComponent() as IAbilityHost;

// 获取能力实例
const eventAbility = component.getAbility<EventAbility>('EventAbility');

// 检查能力是否存在
if (component.hasAbility('EventAbility')) {
    // ...
}

// 销毁所有能力
component.disposeAbilities();
```

### 4. 继承和组合

```typescript
// 基类
@WithAbilities([EventAbility])
class BaseComponent {
    // 拥有事件能力
}

// 派生类
@WithAbilities([DomainAbility])
class DerivedComponent extends BaseComponent {
    // 拥有事件能力 + 域能力
}

// 多个装饰器
@WithAbilities([EventAbility])
@WithAbilities([DomainAbility])
class MyComponent {
    // 拥有两个能力
}
```

## 系统能力接口

### 可用接口

```typescript
import {
    IEventAbility,        // 事件能力
    IDomEventsAbility,    // DOM事件能力
    IDomainAbility,       // 域能力
    ISystemAbility,       // 系统能力
    IEventDomainAbility,  // 事件 + 域
    IFullSystemAbility    // 完整系统能力
} from '@/system-abilities';
```

### 使用示例

```typescript
// 单个能力
@WithAbilities([EventAbility])
class MyComponent implements IEventAbility {
    // 类型安全的事件方法
}

// 多个能力
@WithAbilities([EventAbility, DomainAbility])
class EntityManager implements IEventDomainAbility {
    // 类型安全的事件 + 域方法
}

// 完整系统能力
@WithAbilities([
    EventAbility,
    DomEventsAbility,
    DomainAbility,
    SystemAbility
])
class CoreEntityManager implements IFullSystemAbility {
    // 拥有所有系统能力
}
```

## 最佳实践

### 1. 能力命名

```typescript
// ✅ 推荐：使用类名作为能力名
class EventAbility extends AbilityBase {
    readonly name = 'EventAbility';
}

// ❌ 不推荐：使用简短名称
class EventAbility extends AbilityBase {
    readonly name = 'Event';  // 容易冲突
}
```

### 2. 静态元数据

```typescript
// ✅ 推荐：提供完整的元数据
class EventAbility extends AbilityBase {
    readonly name = 'EventAbility';
    
    static readonly description = '事件能力：提供事件监听和发射能力';
    static readonly deps = ['EventBus'];
}

// ❌ 不推荐：缺少元数据
class EventAbility extends AbilityBase {
    readonly name = 'EventAbility';
    // 缺少 description 和 deps
}
```

### 3. 接口定义

```typescript
// ✅ 推荐：为每个能力定义接口
export interface IEventAbility {
    on(event: string, handler: Function): void;
    emit(event: string, data?: any): void;
}

// ✅ 推荐：定义组合接口
export interface IEventDomainAbility 
    extends IEventAbility, IDomainAbility {}

// ❌ 不推荐：直接使用 any
const manager: any = new EntityManager();
```

### 4. 能力销毁

```typescript
// ✅ 推荐：在组件销毁时清理能力
class MyComponent {
    destroy() {
        this.disposeAbilities();
    }
}

// ❌ 不推荐：忘记清理
class MyComponent {
    destroy() {
        // 忘记调用 disposeAbilities()
    }
}
```

## 迁移指南

### 从旧方式迁移

```typescript
// ❌ 旧方式：手动注册
import { registerAbility } from '@/system-abilities';

class EventAbility extends AbilityBase {
    readonly name = 'Event';
}

registerAbility(EventAbility);

@Ability('Event')
class MyComponent extends ComposableBase {
    // ...
}

// ✅ 新方式：自动注册
@WithAbilities([EventAbility])
class MyComponent {
    // 自动注册 + 添加能力
}
```

## 总结

`WithAbilities` 装饰器提供了：

1. **简化开发** - 无需手动注册能力
2. **类型安全** - 完整的 TypeScript 支持
3. **灵活组合** - 支持多个能力组合
4. **易于维护** - 清晰的接口定义

使用新方案可以显著减少样板代码，提高开发效率。
