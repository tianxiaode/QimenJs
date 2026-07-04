# @qimenjs/system-abilities

**层级**: 第 3 层  
**状态**: 完成  
**测试**: 通过  
**依赖**: events, composable, registry, event-dom

## 概述

system-abilities 包提供系统级能力集合，所有能力均为 `AbilityDefinition` 纯对象，通过 `ComposableBase` 注入宿主。

## 能力列表

### EventAbility

提供事件监听、一次性监听和事件发射能力。每个宿主拥有独立的事件作用域（event scope）。

```typescript
import { EventAbility } from '@qimenjs/system-abilities';

class MyHost extends ComposableBase {
    static readonly abilities = [EventAbility];
}

const host = new MyHost() as any;
host.on('click', (data) => console.log(data));
host.emit('click', { x: 100, y: 200 });
host.dispose();  // 自动清理事件作用域
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `eventScope` | getter | 获取当前事件作用域（自动创建） |
| `on` | `on(event: string, handler: EventHandler)` | 监听事件 |
| `once` | `once(event: string, handler: EventHandler)` | 一次性监听 |
| `emit` | `emit(event: string, data?: any)` | 发射事件 |

### DomainAbility

提供域（Domain）配置信息访问能力。通过 `DomainRegistrar` 单例获取配置，并利用静态缓存提升性能。

```typescript
import { DomainAbility } from '@qimenjs/system-abilities';

class MyHost extends ComposableBase {
    static readonly abilities = [DomainAbility];
    domain = 'my-domain';  // 设置域名称
}

const host = new MyHost() as any;
const config = host.domainConfig;  // 自动从 DomainRegistrar 获取并缓存
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `domainConfig` | getter → `DomainConfig` | 获取域配置（自动缓存） |

### SystemAbility

提供系统级配置访问能力。通过 `SystemRegistrar` 单例获取配置。

```typescript
import { SystemAbility } from '@qimenjs/system-abilities';

class MyHost extends ComposableBase {
    static readonly abilities = [SystemAbility];
}

const host = new MyHost() as any;
const allConfig = host.systemConfig();        // 全量配置
const apiBase = host.systemConfig('apiBase');  // 指定键
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `systemConfig` | `systemConfig<K>(key?: K)` | 获取系统配置 |

### DomEventsAbility

提供 DOM 事件绑定能力，创建事件适配器处理手势事件。依赖 `EventAbility` 提供的 `eventScope`。

```typescript
import { EventAbility, DomEventsAbility } from '@qimenjs/system-abilities';

class MyHost extends ComposableBase {
    static readonly abilities = [EventAbility, DomEventsAbility];
}

const host = new MyHost() as any;
host.bind(element, 'tap', { handler: (e) => console.log(e) });
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `bind` | `bind(target, semantic, options?)` | 绑定 DOM 事件到目标元素 |

## 目录结构

```
src/system-abilities/
├── index.ts
├── system/
│   ├── EventAbility.ts       # 事件能力
│   ├── DomainAbility.ts      # 域能力
│   ├── SystemAbility.ts      # 系统能力
│   ├── DomEventsAbility.ts   # DOM 事件能力
│   └── index.ts
├── types/
│   ├── abilities.ts
│   └── index.ts
└── interfaces/
    └── index.ts
```

## 设计说明

- 所有能力均为 `AbilityDefinition` 纯对象，不使用类继承
- `EventAbility` 是基础能力，`DomEventsAbility` 依赖其 `eventScope`
- 能力方法中的 `this` 自动指向宿主，可直接访问 `this.abilityState()`、`this.onCleanup()` 等
- 事件作用域在宿主 `dispose()` 时自动清理（通过 `onCleanup` 注册）
