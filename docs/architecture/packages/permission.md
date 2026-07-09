# @qimenjs/permission

**层级**: 第 2 层
**状态**: 开发中
**依赖**: registry, events

## 概述

permission 包提供权限注册、查询和变更通知功能。权限码按域分组存储，格式为 `域:权限码`（如 `system:user:create`），数据变更时自动通过 GlobalEventBus 触发 `permission:change` 事件。

## 核心概念

### 权限码格式

权限码统一使用 `域:权限码` 格式，用 `:` 作为分隔符：

```
system:user:create
system:user:delete
business:order:approve
business:order:export
```

域前缀天然实现了权限的分组隔离，无需额外的域管理机制。

### 事件驱动

权限系统基于事件驱动：

1. 组件声明 `permission` 配置 → PermissionAbility 监听 `permission:change` 事件
2. 权限数据写入 PermissionRegistrar → 自动触发 `permission:change` 事件
3. PermissionAbility 收到事件 → 查询权限状态 → 控制组件行为

只有声明了 `permission` 的组件才会监听事件，避免事件风暴。

### 工厂函数

`createDomainPermissions` 创建域级权限定义工厂，统一返回数组：

```typescript
const sys = createDomainPermissions('system');
const biz = createDomainPermissions('business');

sys('user:create')                    // → ['system:user:create']
sys('user:create', 'user:delete')     // → ['system:user:create', 'system:user:delete']
biz('order:approve', 'order:export')  // → ['business:order:approve', 'business:order:export']
```

## API 参考

### PermissionRegistrar

继承自 `RegistrarBase<Map<string, Set<string>>>`，单例模式。

| 方法 | 签名 | 说明 |
|------|------|------|
| `initEventBus` | `(eventBus: GlobalEventBus): void` | 注入事件总线，必须在注册权限前调用 |
| `register` | `(domain: string, ...codes: string[]): void` | 注册单个域的权限 |
| `registerBatch` | `(entries: PermissionEntry[]): void` | 批量注册，只触发一次事件 |
| `unregister` | `(domain: string, ...codes: string[]): void` | 注销单个域的权限 |
| `unregisterBatch` | `(entries: PermissionEntry[]): void` | 批量注销，只触发一次事件 |
| `has` | `(code: string): boolean` | 查询权限，自动按 `:` 拆分域和权限码 |
| `hasAll` | `(codes: string[]): boolean` | 查询是否拥有全部权限 |
| `hasAny` | `(codes: string[]): boolean` | 查询是否拥有任一权限 |
| `getByDomain` | `(domain: string): string[]` | 获取指定域的所有权限码 |
| `clearDomain` | `(domain: string): void` | 清除指定域的所有权限 |
| `getDomains` | `(): string[]` | 获取所有已注册的域名称 |
| `getDomainSize` | `(domain: string): number` | 获取指定域的权限数量 |

### createDomainPermissions

```typescript
function createDomainPermissions(domain: string): (...codes: string[]) => string[]
```

### 类型导出

| 类型 | 说明 |
|------|------|
| `PermissionEntry` | 批量注册项，`{ domain: string; codes: string[] }` |
| `PermissionChangePayload` | 变更事件载荷，`{ domains: string[]; type: 'register' \| 'unregister' \| 'clear' \| 'load' }` |
| `PERMISSION_CHANGE_EVENT` | 事件名常量，`'permission:change'` |
| `PERMISSION_SEPARATOR` | 分隔符常量，`':'` |

## 使用示例

### 初始化

```typescript
import { PermissionRegistrar } from '@qimenjs/permission';
import { globalEventBus } from '@qimenjs/event';

const registrar = PermissionRegistrar.getInstance();
registrar.initEventBus(globalEventBus);
```

### 注册权限

```typescript
// ABP 风格：随配置加载
registrar.registerBatch([
    { domain: 'system', codes: ['user:create', 'user:delete', 'user:export'] },
    { domain: 'business', codes: ['order:approve', 'order:export'] },
]);

// 单个域注册
registrar.register('system', 'role:assign');
```

### 在 LayoutNode 中使用

```typescript
const sys = createDomainPermissions('system');

{
    type: ComponentTypes.BUTTON,
    permission: {
        code: sys('user:delete'),
        behavior: 'hidden',
    }
}
```

### 查询权限

```typescript
registrar.has('system:user:create');  // true
registrar.has('system:user:export');  // true
registrar.has('system:admin:config'); // false

registrar.hasAll(['system:user:create', 'system:user:delete']); // true
registrar.hasAny(['system:user:create', 'system:admin:config']); // true

registrar.getByDomain('system'); // ['user:create', 'user:delete', 'user:export', 'role:assign']
```

## 目录结构

```
src/permission/
├── PermissionRegistrar.ts       # 权限注册表
├── createDomainPermissions.ts   # 域级权限工厂函数
├── types.ts                     # 类型定义
└── index.ts                     # 统一导出
```

## 设计决策

### 1. 权限码自带域前缀

**原因**：
- 统一格式 `域:权限码`，查询和注册都简单直接
- 不需要额外的域隔离机制
- 工厂函数自动拼接，使用时无需关心格式

### 2. 注册表直接触发事件

**原因**：
- 权限注册和事件通知是一件事，不需要拆成 Registrar + Manager 两个类
- 数据变更时自动触发，开发者无需手动触发事件
- 批量操作只触发一次事件，避免频繁通知

### 3. EventBus 通过 initEventBus 注入

**原因**：
- RegistrarBase 单例模式要求无参构造
- 注入方式比构造函数参数更灵活，应用启动时调用一次即可

### 4. code 字段统一为 string[]

**原因**：
- 工厂函数统一返回数组，使用方式一致
- 不需要区分单个权限和多个权限的场景
- matchMode 控制匹配逻辑，code 格式无需变化

## 依赖关系

```
permission (L2)
  ├─ registry (L1)
  └─ events (L1)
```
