# Schema 包设计分析

**日期**: 2026-06-15  
**状态**: 设计分析  
**影响范围**: 新增 schema 包

## 背景

在删除的 kernel 包中发现了 schema 相关的定义，需要决定如何组织这些代码。

## 发现的 Schema 相关文件

### 1. 类型定义 (`src/kernel/types/entities/schema.ts`)

**核心类型**：
- `IEntity` - 基础实体接口
- `BaseField` - 基础字段定义（包含验证规则）
- `FieldDefinition` - 字段定义联合类型
- `BaseSchema` - 基础 Schema
- `FlatSchema` - 平铺实体 Schema
- `TreeSchema` - 树形实体 Schema
- `Schema` - 统一 Schema 类型

**关键依赖**：
```typescript
import {
    BooleanRule,
    DateRule,
    FormatRule,
    NumberRule,
    PasswordRule,
    SplitRule,
    StringRule,
    ValidationRule,
} from '@orbit-js/validation';
```

**核心设计**：
```typescript
export interface BaseField {
    name: string;
    label?: string;
    rules?: ValidationRule | ValidationRule[];  // 验证规则
    mapping?: string | ((data: IEntity) => any);
    // ...
}

export type FieldDefinition =
    | (BaseField & (StringRule | FormatRule | SplitRule))
    | (BaseField & PasswordRule)
    | (BaseField & NumberRule)
    | (BaseField & DateRule)
    | (BaseField & BooleanRule)
    // ...

export interface BaseSchema {
    name: string;
    fields?: FieldDefinition[];
    rules?: Record<string, ValidationRule[] | ValidationRule>;
    // ...
}
```

### 2. SchemaRegistrar (`src/kernel/registrars/SchemaRegistrar.ts`)

**功能**：
- 管理实体 Schema 注册
- 管理字段组注册
- 提供统一的访问接口

**特点**：
- 继承自 `RegistrarBase`
- 双存储设计：`schemaStorage` + `fieldStorage`
- 支持两种注册模式

### 3. SchemaAbility (`src/kernel/abilities/entity-manager/SchemaAbility.ts`)

**功能**：
- 编译和缓存 Schema
- 处理继承和混入
- 字段合并与覆盖
- 提供访问接口

**关键方法**：
- `compileSchema()` - 编译 Schema
- `getSchema()` - 获取 Schema
- `getSchemaRules()` - 获取验证规则
- `schemaKeys` - 字段映射键名
- `schemaTree` - 树行为配置

## Schema 与 Validation 的关系

### 紧密耦合

1. **类型依赖**：
   - `FieldDefinition` 直接使用 `ValidationRule` 类型
   - `BaseField.rules` 使用 `ValidationRule[]`
   - `BaseSchema.rules` 使用 `Record<string, ValidationRule[]>`

2. **功能依赖**：
   - Schema 定义字段结构 + 验证规则
   - SchemaAbility 编译 Schema 时需要处理验证规则
   - 实体验证需要从 Schema 获取规则

### 分离的可能性

虽然紧密耦合，但可以分离：

1. **Schema 包职责**：
   - 定义 Schema 结构
   - Schema 注册和管理
   - Schema 编译（继承、混入、覆盖）
   - 字段映射逻辑

2. **Validation 包职责**：
   - 定义验证规则类型
   - 验证引擎
   - 验证处理器

3. **依赖关系**：
   ```
   schema → validation
   ```

## 设计方案对比

### 方案 1：Schema 作为独立包（推荐）

**结构**：
```
src/schema/
├── types/
│   ├── schema.ts          # Schema 类型定义
│   ├── field.ts           # Field 类型定义
│   └── index.ts
├── SchemaRegistrar.ts     # Schema 注册器
├── SchemaCompiler.ts      # Schema 编译器
└── index.ts
```

**优点**：
- ✅ 职责清晰：Schema 专注于结构定义和管理
- ✅ 可复用：Schema 可用于多种场景（实体、表单、API）
- �️ 依赖明确：`schema → validation`
- ✅ 符合单一职责原则

**缺点**：
- ⚠️ 需要新增包
- ⚠️ 需要处理依赖关系

**依赖层级**：
```
Layer 2: schema (依赖 validation)
Layer 2: validation (独立)
```

### 方案 2：Schema 放入 Validation 包

**结构**：
```
src/validation/
├── types/
│   ├── rule.ts            # 验证规则类型
│   ├── schema.ts          # Schema 类型定义
│   └── index.ts
├── SchemaRegistrar.ts     # Schema 注册器
└── index.ts
```

**优点**：
- ✅ 无需新增包
- ✅ 类型定义在一起，方便使用

**缺点**：
- ❌ 职责混乱：Validation 包承担了两个职责
- ❌ 违反单一职责原则
- ❌ Schema 和 Validation 耦合过紧
- ❌ 不利于扩展（如 Schema 用于非验证场景）

### 方案 3：Schema 放入 Entity 包

**结构**：
```
src/entity/
├── types/
│   ├── schema.ts          # Schema 类型定义
│   └── index.ts
├── abilities/
│   └── SchemaAbility.ts   # Schema 能力
└── index.ts
```

**优点**：
- ✅ Schema 主要用于实体管理
- ✅ SchemaAbility 自然在 entity 包中

**缺点**：
- ❌ Entity 包职责过重
- ❌ Schema 可能用于非实体场景（如表单）
- ❌ 依赖关系复杂：`entity → schema → validation`

## 推荐方案：方案 1 - Schema 作为独立包

### 理由

1. **职责清晰**：
   - Schema 包：结构定义、注册、编译
   - Validation 包：验证规则、验证引擎
   - Entity 包：实体管理、能力

2. **可复用性**：
   - Schema 可用于实体定义
   - Schema 可用于表单定义
   - Schema 可用于 API 参数定义

3. **依赖关系清晰**：
   ```
   entity → schema → validation
   ```

4. **符合架构原则**：
   - 单一职责原则
   - 开闭原则
   - 依赖倒置原则

### 包结构设计

```
src/schema/
├── types/
│   ├── schema.ts          # Schema 类型定义
│   │   ├── IEntity
│   │   ├── BaseField
│   │   ├── FieldDefinition
│   │   ├── BaseSchema
│   │   ├── FlatSchema
│   │   ├── TreeSchema
│   │   └── Schema
│   ├── search.ts          # 搜索参数类型
│   │   ├── ILocalSearchParams
│   │   ├── IFlatSearchParams
│   │   ├── ITreeSearchParams
│   │   └── SearchParams
│   └── index.ts
├── SchemaRegistrar.ts     # Schema 注册器
│   ├── register()
│   ├── unregister()
│   ├── get()
│   └── getField()
├── SchemaCompiler.ts      # Schema 编译器
│   ├── compileSchema()
│   ├── mergeFields()
│   ├── applyOverrides()
│   └── resolveInheritance()
└── index.ts
```

### 依赖关系

```typescript
// schema/types/schema.ts
import type { 
    ValidationRule,
    StringRule,
    NumberRule,
    // ...
} from '@orbit-js/validation';

// schema/SchemaCompiler.ts
import type { Schema, FieldDefinition } from './types';
import type { ValidationRule } from '@orbit-js/validation';
```

### Layer 分层

```
Layer 0: error, logger, utils, async, runtime, crypto, context
Layer 1: registry, cache, events, task, pipeline, composable
Layer 2: validation, schema  ← 新增
Layer 3: http, data-processor
Layer 4: entity
```

### 与其他包的关系

```
entity (Layer 4)
  ↓ 使用
schema (Layer 2)
  ↓ 使用
validation (Layer 2)
```

## 实施计划

### Phase 1: 创建 Schema 包

1. 创建 `src/schema/` 目录结构
2. 从 kernel 历史中恢复类型定义
3. 创建 `SchemaRegistrar`（继承 `RegistrarBase`）
4. 创建 `SchemaCompiler`
5. 编写单元测试

### Phase 2: 更新依赖

1. 更新 `ARCHITECTURE.md`
2. 更新 `package.json` 依赖
3. 更新 TypeScript 配置

### Phase 3: 集成到 Entity

1. 在 entity 包中创建 `SchemaAbility`
2. 使用 schema 包的类型和功能
3. 更新实体管理相关代码

## 参考资料

- [Validation 包结构](../src/validation/)
- [Registrar 架构](./2026-06-15-registrar-architecture.md)
- [Layer 分层原则](../architecture/principles/dependencies.md)
