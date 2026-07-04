# Schema 最佳实践

## 理解 Schema 的角色

Schema = 数据结构 + 数据约束。它定义实体有哪些字段、字段类型、验证规则，以及实体之间的关系（继承、混入）。Validation 只是执行者。

```
Schema（定义规则）→ Validation（执行规则）→ Entity（使用规则）
```

## 1. 用 extends 继承公共字段，不要每个 Schema 重复定义

```typescript
// 正确 - 定义基础 Schema，其他 Schema 继承
const registrar = SchemaRegistrar.getInstance();

registrar.register({
    name: 'base',
    isTree: false,
    fields: [F.id, F.name, F.createdAt, F.updatedAt],
});

registrar.register({
    name: 'User',
    extends: 'base',  // 继承 base 的所有字段
    isTree: false,
    fields: [
        { name: 'email', type: 'string', format: 'email' },
    ],
});

// 错误 - 每个 Schema 重复定义公共字段
registrar.register({
    name: 'User',
    isTree: false,
    fields: [
        F.id, F.name, F.createdAt, F.updatedAt,  // 重复
        { name: 'email', type: 'string', format: 'email' },
    ],
});
```

**原因**：`extends` 在编译时自动合并父 Schema 的字段，避免重复。修改公共字段只需改一处。

## 2. 用 mixins 组合可复用字段组，不要用继承模拟多继承

```typescript
// 正确 - 用 mixins 组合多个字段组
registrar.register('auditFields', [F.createdAt, F.updatedAt]);
registrar.register('statusFields', [
    { name: 'status', type: 'number' },
    { name: 'sort', type: 'number' },
]);

registrar.register({
    name: 'Product',
    extends: 'base',
    mixins: ['auditFields', 'statusFields'],  // 组合多个字段组
    isTree: false,
    fields: [{ name: 'price', type: 'number', min: 0 }],
});

// 错误 - 用继承模拟多继承（只能单继承）
registrar.register({ name: 'AuditedBase', extends: 'base', fields: [F.createdAt, F.updatedAt] });
registrar.register({ name: 'StatusBase', extends: 'AuditedBase', fields: [...] }); // 继承链越来越长
```

**原因**：Schema 只支持单继承（`extends`），但支持多混入（`mixins`）。mixins 是组合模式，比继承链更灵活、更易维护。

## 3. 用 F 预定义字段常量，不要每次手写字段定义

```typescript
// 正确 - 使用 F 常量
import { F } from '@qimenjs/schema';

registrar.register({
    name: 'Department',
    isTree: true,
    fields: [F.id, F.name, F.parentId, F.children, F.sort],
});

// 也可以展开定制
registrar.register({
    name: 'User',
    isTree: false,
    fields: [
        { ...F.id, label: '用户ID' },  // 覆盖 label
        { name: 'email', type: 'string', format: 'email' },
    ],
});

// 错误 - 每次手写
registrar.register({
    name: 'Department',
    isTree: true,
    fields: [
        { name: 'id', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'parentId', type: 'string' },
        // ...容易遗漏属性
    ],
});
```

**原因**：`F` 常量预定义了常用字段（id, name, createdAt, parentId, children 等），包含完整的类型、标签、默认值等属性。使用 `...F.xxx` 展开后可覆盖特定属性。

## 4. 验证规则定义在 Schema 中，不要散落在组件里

```typescript
// 正确 - 规则定义在 Schema 中
registrar.register({
    name: 'User',
    isTree: false,
    fields: [
        { name: 'username', type: 'string', minLength: 2, maxLength: 20, required: true },
        { name: 'email', type: 'string', format: 'email', required: true },
        { name: 'age', type: 'number', min: 0, max: 150 },
        { name: 'password', type: 'password', required: true },
    ],
});

// 编译后自动提取规则
const compiled = registrar.getCompiled('User');
compiled.rules; // { username: [StringRule], email: [FormatRule], age: [NumberRule], ... }

// 错误 - 规则散落在组件中
const rules = {
    username: { required: true, minLength: 2, maxLength: 20 },
    email: { required: true, format: 'email' },
    // 每个组件重复定义，容易不一致
};
```

**原因**：Schema 编译时自动从字段定义中提取验证规则（`compiled.rules`），Validation 包直接使用这些规则。规则定义在 Schema 中保证了一致性，避免不同组件对同一字段有不同的验证逻辑。

## 5. 用 override 覆盖继承的字段，不要重新定义

```typescript
// 正确 - 用 override 覆盖特定属性
registrar.register({
    name: 'User',
    extends: 'base',
    isTree: false,
    fields: [{ name: 'email', type: 'string', format: 'email' }],
    override: {
        id: { label: '用户ID' },       // 覆盖 label
        name: { label: '用户名' },      // 覆盖 label
    },
});

// 错误 - 重新定义整个字段（丢失其他属性）
registrar.register({
    name: 'User',
    extends: 'base',
    isTree: false,
    fields: [
        { name: 'id', label: '用户ID' },  // 丢失了 type、defaultValue 等
        { name: 'email', type: 'string', format: 'email' },
    ],
});
```

**原因**：`override` 是补丁式覆盖，只修改指定属性，保留其他属性。重新定义整个字段会丢失父 Schema 中设置的属性。

## 6. 树形 Schema 用 isTree: true，不要手动管理树形字段

```typescript
// 正确 - 声明 isTree，自动填充默认值
registrar.register({
    name: 'Department',
    isTree: true,
    isLazy: true,
    root: { id: 0, name: '根节点' },
    fields: [F.id, F.name, F.parentId, F.children],
});

// 编译后自动填充：
// parentIdField: 'parentId'
// childrenField: 'children'
// pathField: 'path'
// leafField: 'leaf'

// 错误 - 手动管理树形字段映射
const treeConfig = {
    parentIdField: 'parentId',
    childrenField: 'children',
    // 容易遗漏，且与 Schema 定义分离
};
```

**原因**：树形 Schema 编译时自动填充 `parentIdField`、`childrenField` 等默认值。Entity 的 `StateSchemaAbility` 直接从编译后的 Schema 读取这些配置，不需要手动传递。

## 7. 用 mapping 处理前后端字段名差异

```typescript
// 正确 - 用 mapping 映射后端字段
registrar.register({
    name: 'User',
    isTree: false,
    fields: [
        { name: 'username', mapping: 'userName' },           // 后端是 userName
        { name: 'createdAt', mapping: 'creationTime' },      // ABP 用 creationTime
        { name: 'avatar', mapping: (data) => data.profile?.avatarUrl },  // 复杂映射用函数
    ],
});

// 错误 - 在每个组件中手动转换
const user = {
    username: data.userName,
    createdAt: data.creationTime,
    avatar: data.profile?.avatarUrl,
};
```

**原因**：`mapping` 支持字符串（后端字段路径）和函数（自定义转换）两种形式。字段映射定义在 Schema 中，所有使用该 Schema 的地方自动生效。

## 8. getCompiled 而不是 get，利用延迟编译和缓存

```typescript
// 正确 - 使用 getCompiled（延迟编译 + 缓存）
const compiled = registrar.getCompiled('User');
// 首次调用：编译（合并 extends + mixins + override + 提取规则）
// 后续调用：直接返回缓存

// 错误 - 使用 get 获取原始 Schema（未编译）
const raw = registrar.get('User');
// raw.fields 不包含继承的字段
// raw 没有 rules
```

**原因**：`getCompiled` 返回编译后的完整 Schema（含继承合并、规则提取、默认值填充），且有缓存机制。`get` 返回原始注册数据，不包含继承和混入的字段。

## 反模式清单

| 反模式 | 正确做法 |
|--------|----------|
| 每个 Schema 重复定义公共字段 | `extends` 继承基础 Schema |
| 用继承链模拟多继承 | `mixins` 组合字段组 |
| 每次手写 id/name/createdAt | 使用 `F` 预定义常量 |
| 验证规则散落在组件中 | 规则定义在 Schema 字段中 |
| 重新定义整个字段来改 label | `override` 补丁式覆盖 |
| 手动管理树形字段映射 | `isTree: true` 自动填充 |
| 每个组件手动转换字段名 | `mapping` 声明式映射 |
| 用 get 获取未编译的 Schema | `getCompiled` 延迟编译 + 缓存 |
