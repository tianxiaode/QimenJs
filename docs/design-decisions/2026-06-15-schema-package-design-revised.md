# Schema 包设计分析（修订版）

**日期**: 2026-06-15  
**状态**: 设计分析（修订）  
**影响范围**: 新增 schema 包，重构 validation 包

## 核心观点

**验证规则属于 Schema，Validation 只是执行者。**

## 设计理念

### Schema = 数据契约

Schema 定义了数据的完整契约：
- **结构定义**：字段名称、类型、关系
- **数据约束**：验证规则、默认值、映射规则

```typescript
interface BaseField {
    // 结构定义
    name: string;
    label?: string;
    
    // 数据约束（验证规则）
    type: 'string' | 'number' | 'date' | ...;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    // ...
}
```

### Validation = 契约执行器

Validation 引擎负责执行 Schema 定义的契约：
- 读取 Schema 中的验证规则
- 执行验证逻辑
- 收集和报告错误

```typescript
class Validator {
    validate(data: any, schema: Schema): ValidationResult {
        // 根据 schema 中定义的规则执行验证
    }
}
```

## 包结构设计

### Schema 包（Layer 2）

```
src/schema/
├── types/
│   ├── field.ts            # 字段定义 + 验证规则类型
│   │   ├── BaseValidationRule
│   │   ├── StringRule
│   │   ├── NumberRule
│   │   ├── DateRule
│   │   ├── BooleanRule
│   │   ├── FormatRule
│   │   ├── PasswordRule
│   │   ├── SplitRule
│   │   └── ValidationRule  # 统一规则类型
│   ├── schema.ts           # Schema 类型定义
│   │   ├── IEntity
│   │   ├── BaseField
│   │   ├── FieldDefinition
│   │   ├── BaseSchema
│   │   ├── FlatSchema
│   │   ├── TreeSchema
│   │   └── Schema
│   ├── search.ts           # 搜索参数类型
│   │   ├── ILocalSearchParams
│   │   ├── IFlatSearchParams
│   │   ├── ITreeSearchParams
│   │   └── SearchParams
│   └── index.ts
├── SchemaRegistrar.ts      # Schema 注册器
│   ├── register()
│   ├── unregister()
│   ├── get()
│   └── getField()
├── SchemaCompiler.ts       # Schema 编译器
│   ├── compileSchema()
│   ├── mergeFields()
│   ├── applyOverrides()
│   └── resolveInheritance()
└── index.ts
```

**职责**：
- ✅ 定义数据结构
- ✅ 定义验证规则（数据约束）
- ✅ Schema 注册和管理
- ✅ Schema 编译（继承、混入、覆盖）

**导出**：
```typescript
// schema/index.ts
export type {
    // 验证规则类型
    ValidationRule,
    StringRule,
    NumberRule,
    DateRule,
    BooleanRule,
    FormatRule,
    PasswordRule,
    SplitRule,
    
    // Schema 类型
    Schema,
    BaseSchema,
    FlatSchema,
    TreeSchema,
    FieldDefinition,
    BaseField,
    
    // 搜索参数类型
    SearchParams,
    ILocalSearchParams,
    IFlatSearchParams,
    ITreeSearchParams,
} from './types';

export { SchemaRegistrar } from './SchemaRegistrar';
export { SchemaCompiler } from './SchemaCompiler';
```

### Validation 包（Layer 3）

```
src/validation/
├── types/
│   ├── context.ts          # 验证上下文
│   ├── result.ts           # 验证结果
│   └── index.ts
├── engine/
│   ├── Validator.ts        # 验证器
│   ├── ValidationExecutor.ts
│   └── ValidationContext.ts
├── processors/             # 验证处理器
│   ├── StringProcessor.ts
│   ├── NumberProcessor.ts
│   ├── DateProcessor.ts
│   ├── BooleanProcessor.ts
│   ├── FormatProcessor.ts
│   └── index.ts
├── errors/
│   ├── ValidationError.ts
│   └── index.ts
└── index.ts
```

**职责**：
- ✅ 执行验证（根据 Schema 的规则）
- ✅ 验证处理器（处理不同类型）
- ✅ 错误收集和报告
- ✅ 验证上下文管理

**依赖**：
```typescript
// validation/Validator.ts
import type { 
    ValidationRule, 
    Schema,
    FieldDefinition 
} from '@orbitjs/schema';

export class Validator {
    /**
     * 根据 Schema 验证数据
     */
    validate(data: any, schema: Schema): ValidationResult {
        // 遍历 schema.fields
        // 对每个字段执行对应的验证处理器
    }
    
    /**
     * 验证单个字段
     */
    validateField(
        value: any, 
        field: FieldDefinition,
        context: ValidationContext
    ): ValidationResult {
        // 根据 field 中的规则执行验证
    }
}
```

## 依赖关系

### Layer 分层

```
Layer 0: error, logger, utils, async, runtime, crypto, context
Layer 1: registry, cache, events, task, pipeline, composable
Layer 2: schema              ← 定义规则
Layer 3: validation          ← 执行验证
Layer 4: http, data-processor
Layer 5: entity
```

### 包依赖

```
entity (Layer 5)
  ↓ 使用
validation (Layer 3)         ← 执行验证
  ↓ 使用
schema (Layer 2)             ← 定义规则
  ↓ 使用
composable, registry (Layer 1)
```

### 依赖图

```
┌─────────────┐
│   entity    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ validation  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   schema    │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ composable  │
│  registry   │
└─────────────┘
```

## 优势分析

### 1. 更符合直觉

**传统思维**：
- "定义验证规则" → Schema
- "执行验证" → Validation

**类比**：
- Schema = 法律（定义什么是合法）
- Validation = 执法者（检查是否合法）

### 2. 职责更清晰

**Schema 包**：
- 数据契约定义
- 不关心如何验证
- 只关心"什么是合法数据"

**Validation 包**：
- 契约执行
- 不关心规则如何定义
- 只关心"如何检查数据"

### 3. 更灵活

**多种验证引擎**：
```typescript
// 同步验证
class SyncValidator {
    validate(data: any, schema: Schema): ValidationResult;
}

// 异步验证
class AsyncValidator {
    async validate(data: any, schema: Schema): Promise<ValidationResult>;
}

// 批量验证
class BatchValidator {
    validate(items: any[], schema: Schema): ValidationResult[];
}
```

**都使用同一套 Schema 规则定义**。

### 4. 更好的复用

**Schema 规则可用于**：

1. **数据验证**：
   ```typescript
   validator.validate(userData, userSchema);
   ```

2. **表单生成**：
   ```typescript
   formGenerator.generate(userSchema);
   // 根据 schema.fields 生成表单字段
   ```

3. **API 文档生成**：
   ```typescript
   apiDocGenerator.generate(userSchema);
   // 根据 schema 生成 OpenAPI/Swagger 文档
   ```

4. **数据库 Schema 生成**：
   ```typescript
   dbSchemaGenerator.generate(userSchema);
   // 根据 schema 生成 SQL/NoSQL Schema
   ```

5. **Mock 数据生成**：
   ```typescript
   mockGenerator.generate(userSchema);
   // 根据 schema 生成测试数据
   ```

## 实施计划

### Phase 1: 创建 Schema 包

1. 创建 `src/schema/` 目录结构
2. 从 kernel 历史中恢复类型定义
3. 将验证规则类型从 validation 移动到 schema
4. 创建 `SchemaRegistrar`（继承 `RegistrarBase`）
5. 创建 `SchemaCompiler`
6. 编写单元测试

### Phase 2: 重构 Validation 包

1. 移除验证规则类型定义
2. 添加对 `@orbitjs/schema` 的依赖
3. 重构验证引擎使用 Schema 类型
4. 更新验证处理器
5. 更新单元测试

### Phase 3: 更新依赖关系

1. 更新 `ARCHITECTURE.md`
2. 更新 `package.json` 依赖
3. 更新 TypeScript 配置
4. 更新 Layer 分层

### Phase 4: 集成到 Entity

1. 在 entity 包中创建 `SchemaAbility`
2. 使用 schema 包的类型和功能
3. 使用 validation 包执行验证
4. 更新实体管理相关代码

## 迁移示例

### Before（当前 validation 包）

```typescript
// validation/types/rule.ts
export interface StringRule extends BaseValidationRule {
    type: 'string';
    minLength?: number;
    maxLength?: number;
    // ...
}

// validation/Validator.ts
export class Validator {
    validate(data: any, rules: ValidationRule[]): ValidationResult;
}
```

### After（新设计）

```typescript
// schema/types/field.ts
export interface StringRule extends BaseValidationRule {
    type: 'string';
    minLength?: number;
    maxLength?: number;
    // ...
}

// schema/types/schema.ts
export interface BaseSchema {
    name: string;
    fields?: FieldDefinition[];
    rules?: Record<string, ValidationRule[]>;
}

// validation/Validator.ts
import type { Schema, ValidationRule } from '@orbitjs/schema';

export class Validator {
    validate(data: any, schema: Schema): ValidationResult {
        // 根据 schema.fields 中的规则执行验证
    }
}
```

## 参考资料

- [原 Schema 包设计](./2026-06-15-schema-package-design.md)
- [Registrar 架构](./2026-06-15-registrar-architecture.md)
- [Layer 分层原则](../architecture/principles/dependencies.md)
