# @qimenjs/schema

Schema 定义系统 - 定义数据结构和数据约束

## 概述

Schema 包负责定义数据结构（字段定义）和数据约束（验证规则）。验证规则是 Schema 的一部分，而不是独立的验证系统。

**核心理念**：
- Schema = 数据结构 + 数据约束
- Validation 只是执行者，根据 Schema 定义的规则执行验证

## 状态

- **代码状态**: ✅ 完成
- **测试状态**: ✅ 通过
- **测试覆盖率**: 92%

## 依赖

### 直接依赖
- `@qimenjs/registry` - 注册器基类

### 依赖图
```
schema (L2)
  └─ registry (L1)
```

## 核心功能

### 1. 验证规则类型

定义了所有验证规则类型：

- `StringRule` - 字符串验证规则
- `NumberRule` - 数字验证规则
- `DateRule` - 日期验证规则
- `BooleanRule` - 布尔验证规则
- `ArrayRule` - 数组验证规则
- `ObjectRule` - 对象验证规则
- `PasswordRule` - 密码验证规则
- `CompareRule` - 比较验证规则
- `FileRule` - 文件验证规则
- `SplitRule` - 分割验证规则
- `FormatRule` - 格式验证规则

### 2. Schema 类型

定义了 Schema 结构：

- `IEntity` - 基础实体接口
- `BaseField` - 基础字段定义
- `FieldDefinition` - 字段定义联合类型
- `BaseSchema` - 基础 Schema
- `FlatSchema` - 平铺实体 Schema
- `TreeSchema` - 树形实体 Schema
- `Schema` - 统一 Schema 类型

### 3. SchemaRegistrar

Schema 注册器，管理 Schema 和字段组的注册与检索，支持延迟编译。

**特性**：
- 继承自 `RegistrarBase`
- 三存储设计：Schema 存储 + 字段组存储 + 编译缓存
- 支持两种注册模式
- 延迟编译：第一次调用 `getCompiled()` 时编译并缓存
- 支持 Schema 继承（extends）和字段组混入（mixins）

## 使用示例

### 注册 Schema

```typescript
import { SchemaRegistrar } from '@qimenjs/schema';

const registrar = SchemaRegistrar.getInstance();

// 注册用户 Schema
registrar.register({
    name: 'User',
    isTree: true,
    isLazy: false,
    root: null,
    fields: [
        { 
            name: 'id', 
            type: 'string', 
            required: true 
        },
        { 
            name: 'name', 
            type: 'string', 
            minLength: 2,
            maxLength: 50 
        },
        { 
            name: 'email', 
            type: 'string',
            format: 'email'
        },
        { 
            name: 'age', 
            type: 'number',
            min: 0,
            max: 150
        }
    ]
});
```

### 注册字段组

```typescript
// 注册地址字段组
registrar.register('addressFields', [
    { name: 'street', type: 'string', required: true },
    { name: 'city', type: 'string', required: true },
    { name: 'zipCode', type: 'string', minLength: 5, maxLength: 10 },
    { name: 'country', type: 'string', required: true }
]);
```

### 获取 Schema

```typescript
// 获取原始 Schema
const userSchema = registrar.get('User');

// 获取字段组
const addressFields = registrar.getField('addressFields');

// 获取编译后的 Schema（延迟编译 + 缓存）
const compiled = registrar.getCompiled('User');
console.log(compiled.schema);  // 编译后的完整 Schema
console.log(compiled.rules);   // 提取的验证规则
console.log(compiled.idType);  // ID 类型
```

## API

### SchemaRegistrar

#### 方法

| 方法 | 说明 |
|------|------|
| `register(schema)` | 注册 Schema（使用 schema.name 作为 key） |
| `register(name, fields)` | 注册字段组 |
| `unregister(name)` | 注销 Schema 或字段组 |
| `get(name, type?)` | 获取原始 Schema 或字段组 |
| `getField(name)` | 获取字段组 |
| `getCompiled(key)` | 获取编译后的 Schema（延迟编译 + 缓存） |
| `has(name, type?)` | 检查是否存在 |
| `getAllSchemaNames()` | 获取所有 Schema 名称 |
| `getAllFieldNames()` | 获取所有字段组名称 |
| `clear()` | 清空所有注册项 |

## 测试

```bash
npm test -- test/unit/schema
```

**测试结果**：
- 18 个测试全部通过
- 覆盖率：92.68%

## 设计决策

### 为什么验证规则属于 Schema？

1. **验证规则是数据约束**：
   - 字段类型（string, number, date...）
   - 字段约束（minLength, maxLength, min, max...）
   - 这些约束本质上是 Schema 的一部分

2. **Schema = 数据契约**：
   - 定义了数据的完整契约
   - 结构定义 + 数据约束

3. **Validation 只是执行者**：
   - 根据 Schema 定义的规则执行验证
   - 类比：Schema = 法律，Validation = 执法者

### 为什么独立成包？

1. **职责清晰**：
   - Schema 包：数据契约定义
   - Validation 包：契约执行

2. **更好的复用**：
   - Schema 可用于：数据验证、表单生成、API 文档、数据库 Schema

3. **依赖关系清晰**：
   ```
   validation → schema → registry
   ```

## 后续工作

### Phase 1: SchemaCompiler ✅ 已完成
- ~~实现 Schema 编译功能~~ → 已移到 SchemaRegistrar.getCompiled()
- ~~处理继承、混入、覆盖~~ → 已在 compileSchema() 中实现
- ~~字段合并~~ → 已在 processFieldBatch() 中实现
- ~~缓存编译结果~~ → 已在 getCompiled() 中实现

### Phase 2: SchemaAbility 简化（待做）
- 编译逻辑已移到 SchemaRegistrar
- SchemaAbility 需要简化为代理模式
- 或者删除 SchemaAbility，Manager 直接使用 SchemaRegistrar.getCompiled()

## 参考资料

- [Schema 包设计分析](../../design-decisions/2026-06-15-schema-package-design-revised.md)
- [Registrar 架构](../../design-decisions/2026-06-15-registrar-architecture.md)
- [依赖管理原则](../principles/dependencies.md)
