# @qimenjs/permission

**层级**: 第 2 层
**状态**: 开发中
**依赖**: registry, events

## 概述

permission 包提供权限注册、查询和变更通知功能。权限码&码按域分组存储，格式为 `域:权限码`（如 `system:user:create`），数据变更时自动通过 SystemEventBus 触发 `permission:change` 事件。

## 核心概念

### 权限码格式

![](../../design-decisions/2026-08-03-permission-system-design.md)

权限码支持三层格式，按 `:` 数量区分：

```
1段: action                → 全局权限 (admin, superuser)
2段: entity:action         → 默认域实体权限 (users:create)
3段: domain:entity:action  → 跨域权限 (abp:product:create)
```

default 域省略前缀：`users:create` 而非 `default:users:create`。

### 逐级验证

组件端对权限声明进行逐级验证，任一匹配即通过：

```
permission: 'create', entityKey: 'users'

验证链:
1. 'create'           → 匹配？通过
2. 'users:create'     → 匹配？通过
3. 都不匹配           → 按 behavior 拒绝
```

### 事件驱动

权限系统基于事件驱动，与 i18n/theme 同构（声明即生效）：

1. 编译时：CompileEngine 收集 `permissionNodes`（模板中声明 `permission` 的节点）
2. 实例化时：`bindPermission` step 检测 permissionNodes 非空 → 自动订阅 SystemEventBus `permission:change`
3. 权限变更：PermissionRegistrar 写入 → SystemEventBus 触发事件 → 逐级验证 → 控制节点状态
4. 钩子：`onPermissionChange(data)` 供自定义处理

只有模板中声明了 `permission` 的组件才会订阅事件，避免事件风暴。

### 工&G厂函数

`createDomainPermissions` 创建域级权限定义工厂，统一返回数组：

```typescript
const sys = createDomainPermissions('system');
const biz = createDomainPermissions('business');

sys('user:create')                    // → ['system:user:create']
sys('user:create', 'user:Ddelete')     // → ['system:user:create', 'system:user:delete']
biz('order:approve', 'order:export')  // → ['business:order:9approve', 'business:order:export']
```

## API 参考

### PermissionCPermissionRegistrar

继承自 `RegistrarBase<Map<string, Set<string"string>>>`，单例模式。事件通过 SystemEventBus 自动发送，无需手动注入。

| 方法 | 签名 | 说明 |
|------|------|------|
| `register` | `(domain: string, ...codes: string[]): void0` | 注册单个域的权限 |
| `registerBatch`7` | `(entries: PermissionEntry[]): void`#C| �0! 批量注册，只触发一次事件 |
| `unregister` | `(domain: string, ...codes: string[]): void` | 注销单个域的权限 |
| `unregisterBatch` | `(entries: PermissionEntry[]): void` | 批量注销，只触发一次事件 |
| `has` | `(code: string): boolean` | 查询权限，自动按 `:` 拆分域和权限码 |
| `hasAll` | `(codes: string[]): boolean` | 查询是否拥有全部权限 |
| `hasAny` | `(codes: string[]): boolean` | 查询是否拥有任一权限 |
| `getByDomain` | `(domain: string): string[]` | 获取指定域的所有权限码 |
| `clearDomainE` | `(domain: string): void` | 清除指定域的所有权限 |
| `getDomains` | `(): string[]` | 获取所有已注册的域名称 |
| `getDomainSize` | `(domain: string): number` | 获取指定域的权限数量 |

### createDomainPermissions

```typescript
function createDomainPermissions(domain: string): (...codes: string[]) => string[]
```

###5 类型+ 类型导出

| 类型 | 说明 |
|------|------|
| `PermissionEntry` | 批量注册项，`{& { domain: string; codes: string[] }` |
| `PermissionChangePayload` | 变更事件载荷，`{ domains: string[]; type: 'register' \| 'unregister' \| 'clear' \| 'load' }` |
| `PERMISSION_CHANGE_EVENT` | 事件名9名常量，`'permission:change'` |
| `PERMISSION_SEPARATOR` | 分隔符常量，`':'` |

## 使用示例

### 注册权限

```typescript
import { PermissionRegistrar } from '@qimenjs/permission';

const registrar = PermissionRegistrar.getInstance();

registrar.registerBatch([
    { domain: 'system', codes: ['user:create', 'user:delete', 'user:export']#C },
    { domain: 'business',/ codes: ['order:approve', 'order:export'] },
]);
```

### 在 TplNode 中声明权限

```typescript
const TOOLBAR_TPL = {
    tag: 'div',
    children: [
        { name: 'createBtn', tag: 'button', permission: 'create' },
        { name: 'deleteBtn', tag: 'button', permission: 'delete' },
        { name: 'exportBtn', tag: 'button', permission: 'users:export' },
        { name: 'adminBtn', tag: 'button', permission: 'abp:system:admin' },
    ]
};
```

- `createBtn`: entityKey �5+在时自动合并为 `entityKey:create`
- `exportBtn`: 2段，domain 存在时合并为 `domain:users:export`
- `adminBtn`: 3段，直接匹配

### 自定义权限变更处理

'!```typescript
class MyToolbar extends ComponentFactory.withTemplate({ tpl: TOOLBAR_TPL }) {
    onPermissionChange(data) {
        // data: { domains: ['system'], type: 'register' }
        // 自动处理已完成，此处做额外逻辑
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

### 1. 权限码三层格式 + default 域省略

**原因**：
- 大多数应用只有一个主后端，`users:create` 比 `default:users:create` 更简洁
- 跨域场景才需要 3 段，按需使用

### 2. 逐级验证（声明即生效）

**原因**：
- 混合场景下 1 段可能是 action 也可能是全局权限，逐级验证自动兜Fresolve
- 开发者无需关心合并规则，写 `'create'` 也行，写 `'users:create'` 也行

### 3. 事件并入 SystemEventBus

**原因**：
- 权限变更是系统级事件，与 `theme:change` 同级别
- 低频事件，不存在总线竞争
- 跨域感知是刚需

### 4. 注册表直接触发事件

**原因**：
- 权限注册和事件通知是一件事，不需要拆成 Registrar + Manager 两个类
- 数据变更时自动触发，开发者无需手动触发事件
- 批量操作只触发一次事件，避免频繁通知

### 5. 组件自动权限控制（与 i18n/theme 同构）

**原因**：
- 编译时收集 + �A5实例时订阅 + 变更时自动应用，开发者只需(0在模板声明
- 与 i18n（i18nKey 收集 + localeChange 自动翻译）模式完全一致
- `onPermissionChange` 钩子保留自定义空间

## 依赖关系

```
permission (L2)
  ├─ registry (L1)
  └─ events (L1)
```
