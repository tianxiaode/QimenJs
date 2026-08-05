# 实体管理与权限系统

> 实体管理是 QimenJS 的数据层核心，通过继承链组合不同能力实现本地/远程、只读/CRUD、扁平/树形等数据管理模式。权限系统通过事件驱动实现运行时权限控制，组件自动响应权限变更。

## 实体管理

### 管理器继承链

```
ComposableBase
  └── CoreEntityManager (抽象)          ← 核心能力：事件总线、Domain、Schema、权限、请求编排
        └── BaseEntityManager (抽象)     ← 增加 fetch/buildOptions、数据填充、生命周期钩子
              ├── LocalReadonlyEntityManager   ← 本地只读（FlatLocalState + LocalList + LocalGet）
              ├── LocalCrudEntityManager       ← 本地 CRUD（+ FlatLocalMutation + FlatLocalDelete）
              ├── RemoteReadonlyEntityManager  ← 远程只读（SchemaProxy + Cache + Dirty + 分页 + 远程查询）
              ├── RemoteCrudEntityManager      ← 远程 CRUD（+ RemoteCreate/Update/Delete/Toggle）
              └── RemoteTreeEntityManager      ← 远程树形（TreeManager + TreeRemoteState）
```

### CoreEntityManager 核心能力

通过 `CORE_ENTITY_ABILITIES` 组合：

| 能力 | 作用 |
|------|------|
| EntityEventBusAbility | 实体事件总线（`entityEmit`/`entityOn`） |
| DebounceAbility | 防抖 |
| DomainAbility | 域配置访问（`domain`/`getDomainConfig`） |
| SystemAbility | 系统配置 |
| SchemaAbility | Schema 定义 |

### 实体事件与组件协同

#### DataDispatchCenter

实体实例的调度中心，管理实体的注册、连接和断开：

```
CoreEntityManager.register() → DataDispatchCenter 注册实体类
组件.connect(entityKey)       → 获取/创建实体实例（引用计数管理）
组件.disconnect(entityKey)    → 减少引用计数，归零时 dispose
```

#### 事件流

```
Entity → emitEvent(buildRequestEvent(action, status))
    → EntityEventBus
    → 组件的 onEntityError / onEntityLoading / onEntityActionSuccess
```

#### eventMap 机制

将命令事件映射到方法名：

```typescript
eventMap = {
    [CMD.LIST]: 'list',
    [CMD.CREATE]: 'create',
    [CMD.UPDATE]: 'update',
    [CMD.DELETE]: 'delete',
};
```

构造时自动绑定：`entityOn(entityKey, eventName, handler)`。

### 实体与后端联系

#### 请求编排

```
CoreEntityManager.request(action, options)
  → requirePermission(action)           // 权限检查
  → buildRequestContext(action)         // 构建 RequestContext（含 Schema、Domain、Identity）
  → execute:
      1. executeDataProcessor('pre', context)   // 前道数据处理器
      2. HttpExecutor.execute(context)           // HTTP 管道执行
      3. executeDataProcessor('post', context)   // 后道数据处理器
```

#### BaseEntityManager.fetch

在 `request` 基础上增加：
- loading 状态管理
- 事件发射（LOADING/SUCCESS/ERROR）
- `populateResponseData()` - 响应数据填充
- `onBeforeFetch` / `onAfterFetch` 钩子

### defaultEntityErrorHandler 和 defaultEntityLoadingHandler

这两个是 `Component` 原型上的方法，提供实体操作的默认 UI 反馈：

```typescript
// 默认错误处理 - 空实现
defaultEntityErrorHandler(_ctx: any, _domain: string): void {}

// 默认加载处理 - 控制 loading 显示
defaultEntityLoadingHandler(_entityKey: string, isLoading: boolean): void {
    if (isLoading) this.showLoading();
    else this.hideLoading();
}
```

#### 全局覆盖

```typescript
Component.setDefaultHandler({
    error: (ctx, domain) => { showToast(t(ctx.error.code, true)); },
    loading: (entityKey, isLoading) => { /* 自定义 loading */ },
});
```

#### 调用链（带钩子）

```
onEntityError(ctx, domain)
  → onBeforeEntityError?.()  // 返回 false 可阻止
  → defaultEntityErrorHandler(ctx, domain)
  → onAfterEntityError?.()

onEntityLoading(entityKey, isLoading)
  → onBeforeEntityLoading?.()
  → defaultEntityLoadingHandler(entityKey, isLoading)
  → onAfterEntityLoading?.()
```

## 权限系统

### 架构

```
PermissionRegistrar (单例, extends RegistrarBase)
  → registerDomain(domain, config)    // 注册域级权限
  → registerBatch(entries)            // 批量注册权限码
  → hasPermission(query)              // 查询权限
  → emitChange(payload)               // 通过 SystemEventBus 广播变更
```

### 权限如何通过事件运作

```
PermissionRegistrar.registerBatch(entries)
  → emitChange(payload)
  → SystemEventBus.emit('permission:change', ctx)

step-bind-permission (组件初始化时)
  → SystemEventBus.on('permission:change', callback)
  → callback → applyPermission(instance, permissionNodes, entityKey, domain)
  → 遍历 permissionNodes，查询 PermissionRegistrar.hasPermission(query)
  → 根据结果：
      granted → 移除 disabled/hidden/q-permission-denied
      denied  → 设置 disabled + 添加 q-permission-denied
```

### 组件如何识别和自动应用权限

#### 编译时识别

`TplNode` 中声明 `permission` 字段的节点，编译时被收集到 `permissionNodes` 数组。

#### permission 字段格式

| 格式 | 解析结果 |
|------|---------|
| `permission: true` | 自动推导 action（取 nodeMap[name].action，或从 name 去掉 Btn/Button/Action 后缀并小写） |
| `permission: 'create'` | `{ action: 'create', entityKey, domain }` |
| `permission: 'users:create'` | `{ entityKey: 'users', action: 'create', domain }` |
| `permission: 'system:users:create'` | `{ domain: 'system', entityKey: 'users', action: 'create' }` |

#### 自动应用效果

- **无权限** → 元素添加 `disabled` 属性 + `q-permission-denied` CSS 类
- **有权限** → 移除 `disabled` + 移除 `q-permission-denied`

### 实体管理如何使用权限

#### 权限检查

```typescript
// CoreEntityManager.request() 中
requirePermission(action) {
    if (!PermissionRegistrar.getInstance().hasPermission({
        domain: this.domain,
        entityKey: this.entityKey,
        action,
    })) {
        throw new KernelError('ENTITY_PERMISSION_DENIED');
    }
}
```

#### 查询机制

```typescript
hasPermission(query: PermissionQuery): boolean
```

- `query.domain` 指定 → 使用该域的 `validate` 函数
- `query.domain` 未指定 → 遍历所有域，任一匹配即通过

**默认验证器**：
1. 先查 `granted.has(query.action)` — 精确匹配
2. 再查 `granted.has('entityKey:action')` — 组合匹配

#### 域级权限工厂

```typescript
import { createDomainPermissions } from '@qimenjs/permission';

const sys = createDomainPermissions('system');
sys('user:create')  // → ['system:user:create']
```

统一为权限码添加域前缀，避免跨域冲突。

### 权限变更响应

权限变更时，组件自动重新应用权限：

1. `PermissionRegistrar` 通过 `SystemEventBus` 广播 `permission:change`
2. 组件在 `bindPermission` 步骤中订阅此事件
3. 变更时自动调用 `applyPermission()` 重新检查
4. 组件销毁时清理 `_permissionOffs` 中的取消订阅函数

## 参见

- [事件系统](./event-system.md)
- [HTTP 管道与平台适配](./http-pipeline.md)
- [注册表系统](./registry-system.md)