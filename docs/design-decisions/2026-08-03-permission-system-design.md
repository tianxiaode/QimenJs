# 权限系统设计

## 背景

权限系统需要明确：事件总线归属、权限码定义模式、组件自动权限控制流程、后端权限转换。此前权限事件挂载在 GlobalEventBus，权限码定义和组件绑定方式不统一。

## 决策

### 1. 权限事件并入 SystemEventBus

权限变更是系统级事件，与 `theme:change` 同级别，并入 `src/events/SystemEventBus.ts`。

不采用独立权限总线，理由：
- 权限事件低频，不存在总线竞争
- 跨域感知是刚需（entity、component、overlay 都需感知权限变化）
- 独立总线增加桥接成本，无可靠性收益

### 2. 权限码三层格式

```
1段: action                → 全局权限 (admin, superuser)
2段: entity:action         → 默认域实体权限 (users:create)
3段: domain:entity:action  → 跨域权限 (abp:product:create)
```

**default 域省略前缀**：默认后端的权限码不写 `default:`，直接 `entity:action`。

### 3. 组件权限声明与自动收集

在 `TplNodeFieldDef` 中增加 `permission` 字段，`withTemplate` 编译阶段自动收集权限集：

```typescript
// TplNodeFieldDef
permission?: string;  // 'create' | 'users:create' | 'abp:product:create'

// 编译产物
static permissionSet: Set<string>;  // 自动收集，和 contentProperties 同级
```

### 4. 自动权限控制（与 i18n/theme 同构）

```
编译阶段:  withTemplate → 收集 permissionSet → 挂到 static
实例阶段:  PermissionAbility → permissionSet 非空 → 自动订阅 SystemEventBus('permission:change')
变更阶段:  onPermissionChange() → 逐级验证 → 控制 node 状态
```

开发者只需在模板声明 `permission: 'create'`，剩余全自动。

### 5. 逐级验证策略

对每个 permission 声明，按层级逐步验证，**任一匹配即通过**：

```
permission: 'create', entityKey: 'users', domain: 'default'

验证链:
1. 'create'           → 匹配？通过
2. 'users:create'     → 匹配？通过
3. 都不匹配           → 按 behavior 拒绝（disable/hide/readonly）
```

此策略无需区分 action 与全局权限的语义，由权限码本身决定：
- 全局权限 `admin` 被注册 → 第 1 级命中
- 实体权限 `users:create` 中 `create` 不会被单独注册 → 自然落到第 2 级
- 两者都注册 → 任一命中即通过

### 6. 后端权限转换

不同后端返回不同格式，由 `data-processor-abp` / `data-processor-spring` 中的 PermissionTransformer 转换为系统格式：

```
ABP:    "Users.Create"      → transformer → "users:create"
Spring: "ROLE_USER_CREATE"  → transformer → "users:create"
```

系统内部权限码统一为小写 `domain:entity:action` 格式，转换是后端适配层职责。

## 完整流程

```
1. 后端返回原始权限 → PermissionTransformer 转换为 domain:entity:action
2. PermissionRegistrar.register(transformedPermissions)
3. → SystemEventBus('permission:change', grantedSet)
4. 组件 PermissionAbility 自动监听（编译时已收集 permissionSet）
5. 遍历 permissionSet，逐级验证：
   - 1段: action → 先查 action，再查 entityKey:action
   - 2段: entity:action → 先查 entity:action，再查 domain:entity:action
   - 3段: domain:entity:action → 直接查
6. 匹配结果 → 按 behavior 控制 node 状态（disable/hide/readonly）
```

## 影响

- `src/events/SystemEventBus.ts` — 增加权限事件定义
- `src/permission` — PermissionRegistrar 改用 SystemEventBus
- `src/component-core` — TplNodeFieldDef 增加 permission 字段，withTemplate 收集 permissionSet
- `src/component-core/abilities` — PermissionAbility 自动订阅与逐级验证
- `data-processor-abp` / `data-processor-spring` — 增加 PermissionTransformer

## 替代方案

- **独立权限总线**：增加桥接成本，无实际收益，已否决
- **纯声明式合并**（entityKey 决定语义）：混合场景下全局权限与 action 无法区分，已否决
- **必须写全权限码**：CRUD 场景冗余，已否决，改为逐级验证兜底