# 实体事件最佳实践

## 核心概念

### entityKey 是实例级标识

entityKey 标识一个实体实例，不是实体类。同一个实体类可以有多个实例：

```typescript
// entityType = 'users'（实体类级）
// entityKey = 'users:dropdown' / 'users:admin'（实例级）
```

### 结构化 entityKey

格式：`entityType` 或 `entityType:scope`

- `users` — 单实例场景
- `users:dropdown` — 多实例场景，scope 区分用途
- `users:admin` — 同上

框架从 `users:dropdown` 拆出 `users` 找到实体类，`dropdown` 作为实例标识。

## 实体定义

### 声明 entityType

```typescript
// ✅ 正确：static entityType 声明实体类型
class UserEntityManager extends BaseEntityManager {
    static entityType = 'users';
    static url = '/api/users';
    // ...
}

// ❌ 错误：忘记声明 entityType，运行时会 throw
class UserEntityManager extends BaseEntityManager {
    // 运行时报错：UserEntityManager must declare static entityType
}
```

### 注册实体类型

```typescript
// ✅ 推荐：实体类自注册，简洁无外部引用
UserEntityManager.register();
RoleEntityManager.register();

// 等价于
entityDispatchCenter.registerType('users', UserEntityManager);
entityDispatchCenter.registerType('roles', RoleEntityManager);
```

## 实例生命周期

### connect / disconnect

```typescript
// 组件初始化时 connect
const mgr = entityDispatchCenter.connect('users:dropdown');
mgr.list({ page: 1 });

// 组件销毁时 disconnect
entityDispatchCenter.disconnect('users:dropdown');
```

### refCount 语义

refCount 管理实例生命周期，不是复用：

```
组件 A connect('users:dropdown') → refCount=1, 创建实例
组件 B connect('users:dropdown') → refCount=2, 同一实例
组件 A disconnect              → refCount=1, 实例不销毁
组件 B disconnect              → refCount=0, 实例销毁
```

## 发送实体事件

### 使用 entityEmit

```typescript
// ✅ 正确：直接发实体事件到 EntityEventBus
this.entityEmit('created', newItem);
this.entityEmit('list:loading', true);
this.entityEmit('list:success', ctx);

// ❌ 错误：不要用 this.emit（那是 EventAbility，不走 EntityEventBus）
this.emit('created', data);
```

### 事件自动带 entityKey

`entityEmit` 内部自动用 `this.entityKey` 作为 source，组件订阅时按 entityKey 过滤：

```
mgr.entityEmit('listed', data)
  → EntityEventBus.entityEmit({ event: 'listed', source: 'users:dropdown', data })
  → 组件 listens: [{ entity: true, events: { listed: 'onUsersLoaded' } }] 收到
```

## 组件消费实体

### 声明 entityKey

```typescript
// ✅ 正确：组件声明 entityKey，与实体实例绑定
class UserDropdownComponent extends Component {
    entityKey = 'users:dropdown';

    listens = [
        { entity: true, events: { listed: 'onUsersLoaded' } },
    ];
}

// ❌ 错误：两个组件用同一个 entityKey 但期望不同数据
// 下拉和管理界面用同一个 'users'，listed 事件互相干扰
class UserDropdownComponent extends Component {
    entityKey = 'users';  // 冲突！
}
class UserAdminComponent extends Component {
    entityKey = 'users';  // 冲突！
}
```

### 直接调用实体方法

```typescript
// ✅ 正确：组件直接调 mgr 方法
const mgr = entityDispatchCenter.connect('users:dropdown');
mgr.list({ page: 1, size: 10 });

// ❌ 错误：不要通过 EntityEventBus 发命令事件
EntityEventBus.entityEmit('users:dropdown', 'list', { page: 1 });
```

## 命名约定

### entityType 命名

```typescript
// ✅ 推荐：小写复数名词
static entityType = 'users';
static entityType = 'roles';
static entityType = 'products';

// ❌ 不推荐：PascalCase 或单数
static entityType = 'User';
static entityType = 'user';
```

### scope 命名

```typescript
// ✅ 推荐：小写，语义化
'users:dropdown'    // 下拉选择
'users:admin'       // 管理界面
'roles:selector'    // 角色选择器
'products:search'   // 搜索结果

// ❌ 不推荐：数字编号或无意义
'users:1'
'users:instance'
```

## 完整示例

```typescript
// 1. 定义实体类
class UserEntityManager extends BaseEntityManager {
    static entityType = 'users';
    static url = '/api/users';
    static permissions = { list: true, create: true, delete: 'remove' };

    async list(params: ListParams) {
        const options = await this.buildOptions(ENTITY_ACTION.LIST, params);
        return this.fetch(ENTITY_ACTION.LIST, options);
    }

    async create(data: Partial<IUser>) {
        const options = await this.buildOptions(ENTITY_ACTION.CREATE, {}, data, { method: 'POST' });
        return this.fetch(ENTITY_ACTION.CREATE, options);
    }
}

// 2. 注册（应用启动时）
UserEntityManager.register();

// 3. 组件使用
class UserAdminComponent extends Component {
    entityKey = 'users:admin';

    listens = [
        { entity: true, events: {
            listed: 'onUsersLoaded',
            'list:loading': 'onLoadingChange',
        }},
    ];

    onAfterInit() {
        const mgr = entityDispatchCenter.connect(this.entityKey);
        mgr.list({ page: 1, size: 20 });
    }

    onUsersLoaded(ctx: any) { /* ... */ }
    onLoadingChange(ctx: any) { /* ... */ }

    dispose() {
        entityDispatchCenter.disconnect(this.entityKey);
        super.dispose();
    }
}
```