# 权限最佳实践

## 权限码命名

### 使用小写 + 冒号分隔

```typescript
// ✅ 正确
permission: 'create'
permission: 'users:create'
permission: 'abp:product:create'

// ❌ 错误：不要用 PascalCase 或其他分隔符
permission: 'Create'
permission: 'users.create'
permission: 'ABP:Product:Create'
```

### CRUD 场景用最简形式

在 entityKey 上下文中，只需写 action：

```typescript
// ✅ 推荐：entityKey 自动合并
{ name: 'createBtn', tag: 'button', permission: 'create' }
{ name: 'editBtn', tag: 'button', permission: 'update' }
{ name: 'deleteBtn', tag: 'button', permission: 'delete' }

// ❌ 不推荐：冗余写全
{ name: 'createBtn', tag: 'button', permission: 'users:create' }
```

### 跨域/跨实体场景写全

```typescript
// 跨域：ABP 系统的权限
{ name: 'syncBtn', tag: 'button', permission: 'abp:product:sync' }

// 无 entityKey 的功能权限
{ name: 'settingsBtn', tag: 'button', permission: 'settings:update' }

// 全局权限
{ name: 'adminBtn', tag: 'button', permission: 'admin' }
```

## 权限注册

### 使用 createDomainPermissions 工厂

```typescript
// ✅ 推荐：工厂函数保证格式一致
const sys = createDomainPermissions('system');
registrar.registerBatch([
    { domain: 'system', codes: sys('user:create', 'user:delete') },
]);

// ❌ 不推荐：手拼字符串容易出错
registrar.register('system', 'user:create', 'user:delete');
```

### 批量注册减少事件触发

```typescript
// ✅ 推荐：一次 registerBatch 只触发一次事件
registrar.registerBatch([
    { domain: 'system', codes: ['user:create', 'user:delete'] },
    { domain: 'business', codes: ['order:approve'] },
]);

// ❌ 不推荐：多次 register 触发多次事件
registrar.register('system', 'user:create');
registrar.register('system', 'user:delete');
registrar.register('business', 'order:approve');
```

## 组件权限声明

### 声明即生效，不需要手动监听

```typescript
// ✅ 推荐：模板声明 permission，自动订阅 + 自动控制
const TOOLBAR_TPL = {
    tag: 'div',
    children: [
        { name: 'createBtn', tag: 'button', permission: 'create' },
    ]
};

// ❌ 不推荐：手动在 listens 中订阅权限事件
// 权限变更已由 bindPermission step 自动处理
```

### 使用 onPermissionChange 做额外逻辑

```typescript
class UserToolbar extends ComponentFactory.withTemplate({ tpl: TOOLBAR_TPL }) {
    onPermissionChange(data) {
        // 自动 disable/enable 已完成
        // 此处做额外逻辑：如刷新数据、调整布局等
        if (data.type === 'register') {
            this.refreshData();
        }
    }
}
```

## 后端权限转换

### 在 DataProcessor 中转换格式

不同后端返回格式不同，在 data-processor 层统一转换：

```typescript
// data-processor-abp 中
function transformAbpPermissions(codes: string[]): string[] {
    return codes.map(code =>
        code.toLowerCase().replace(/\./g, ':')
    );
    // "Users.Create" → "users:create"
}

// data-processor-spring 中
function transformSpringPermissions(roles: string[]): string[] {
    return roles
        .filter(r => r.startsWith('ROLE_'))
        .map(r => r.replace(/^ROLE_/, '').replace(/_/g, ':').toLowerCase());
    // "ROLE_USER_CREATE" → "user:create"
}
```

## 避免的做法

### ❌ 不要在业务代码中直接实现权限判断

```typescript
// ❌ 错误：手动判断 + 手动控制
if (registrar.has('users:delete')) {
    this.deleteBtn.hidden = true;
}

// ✅ 正确：模板声明 permission，自动处理
{ name: 'deleteBtn', tag: 'button', permission: 'delete' }
```

### ❌ 不要复制粘贴权限码

```typescript
// ❌ 错误：散落的硬编码字符串
registrar.has('users:create')
registrar.has('users:create')  // 重复
registrar.has('users:create')  // 再重复

// ✅ 正确：用工厂函数 + 常量
const users = createDomainPermissions('users');
users('create')  // 统一来源
```

### ❌ 不要为每个组件手动订阅 SystemEventBus

权限变更已由 `bindPermission` pipeline step 自动处理，无需手动订阅。