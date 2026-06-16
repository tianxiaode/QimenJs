# Validation 包设计修订

**日期**: 2026-06-15  
**状态**: 设计修订  
**影响范围**: validation 包

## 问题分析

### 当前设计的问题

1. **强制依赖 Schema**
   - 不是每次验证都需要完整的 Schema
   - 有时只需要验证单个值

2. **缺少灵活性**
   - 无法直接验证单个值
   - 无法进行断言式验证

3. **混淆了两个场景**
   - 场景 1：根据 Schema 验证数据（结构化验证）
   - 场景 2：直接验证单个值（断言式验证）

## 两种验证场景

### 场景 1：Schema 驱动的验证

**特点**：
- 需要完整的 Schema 定义
- 验证整个对象/数据结构
- 适合表单验证、API 输入验证

**示例**：
```typescript
import { Validator } from '@orbitjs/validation';
import type { Schema } from '@orbitjs/schema';

const userSchema: Schema = {
    name: 'User',
    fields: [
        { name: 'email', type: 'string', format: 'email', required: true },
        { name: 'age', type: 'number', min: 0, max: 150 },
        { name: 'name', type: 'string', minLength: 2, maxLength: 50 }
    ]
};

const validator = new Validator();
const result = validator.validate(userData, userSchema);

if (!result.valid) {
    console.log(result.errors);
}
```

### 场景 2：断言式验证

**特点**：
- 不需要 Schema
- 直接验证单个值
- 适合快速验证、断言、单元测试

**示例**：
```typescript
import { assert, validate } from '@orbitjs/validation';

// 方式 1：使用规则对象
const emailResult = validate(email, { type: 'string', format: 'email' });
const ageResult = validate(age, { type: 'number', min: 0, max: 150 });

// 方式 2：使用断言方法
assert.isEmail(email);
assert.isNumber(age, { min: 0, max: 150 });
assert.isString(name, { minLength: 2 });

// 方式 3：链式验证
validate(email)
    .isString()
    .isEmail()
    .required();
```

## 新的设计方案

### 包结构

```
src/validation/
├── types/
│   ├── context.ts          # 验证上下文
│   ├── result.ts           # 验证结果
│   └── index.ts
├── core/                   # 核心验证功能（无 Schema 依赖）
│   ├── Validator.ts        # 验证器基类
│   ├── Assert.ts           # 断言工具
│   └── validate.ts         # 快捷验证函数
├── engine/                 # Schema 驱动的验证（可选依赖）
│   ├── SchemaValidator.ts  # Schema 验证器
│   └── ValidationExecutor.ts
├── processors/             # 验证处理器
│   ├── StringProcessor.ts
│   ├── NumberProcessor.ts
│   └── ...
├── errors/
│   └── ValidationError.ts
└── index.ts
```

### 依赖关系

#### 核心功能（无 Schema 依赖）

```typescript
// validation/core/Validator.ts
import type { ValidationRule } from '@orbitjs/schema';

export class Validator {
    /**
     * 验证单个值
     */
    validate(value: any, rule: ValidationRule): ValidationResult;
    
    /**
     * 批量验证
     */
    validateAll(values: any[], rules: ValidationRule[]): ValidationResult[];
}
```

**依赖**：
```
validation/core → schema/types (仅类型导入)
```

**注意**：只导入类型，不导入 Schema 结构！

#### Schema 驱动的验证（可选）

```typescript
// validation/engine/SchemaValidator.ts
import type { Schema } from '@orbitjs/schema';
import { Validator } from '../core/Validator';

export class SchemaValidator extends Validator {
    /**
     * 根据 Schema 验证数据
     */
    validateSchema(data: any, schema: Schema): ValidationResult;
}
```

**依赖**：
```
validation/engine → schema (完整导入)
```

### 导出设计

```typescript
// validation/index.ts

// 核心功能（总是可用）
export { Validator } from './core/Validator';
export { assert } from './core/Assert';
export { validate } from './core/validate';

// Schema 驱动的验证（可选）
export { SchemaValidator } from './engine/SchemaValidator';

// 类型
export type { ValidationResult, ValidationContext } from './types';
```

### package.json 依赖

```json
{
  "dependencies": {
    "@orbitjs/error": "^1.0.0",
    "@orbitjs/pipeline": "^1.0.0"
  },
  "peerDependencies": {
    "@orbitjs/schema": "^1.0.0"  // 可选依赖
  },
  "peerDependenciesMeta": {
    "@orbitjs/schema": {
      "optional": true
    }
  }
}
```

## 使用示例

### 1. 断言式验证（无 Schema）

```typescript
import { assert, validate } from '@orbitjs/validation';

// 快速验证
const result = validate(email, { type: 'string', format: 'email' });

// 断言（失败抛出异常）
assert.isEmail(email);
assert.isNumber(age, { min: 0 });

// 链式验证
validate(name)
    .isString()
    .minLength(2)
    .maxLength(50)
    .required();
```

### 2. Schema 驱动的验证

```typescript
import { SchemaValidator } from '@orbitjs/validation';
import type { Schema } from '@orbitjs/schema';

const validator = new SchemaValidator();
const result = validator.validateSchema(userData, userSchema);
```

### 3. 混合使用

```typescript
import { validate, SchemaValidator } from '@orbitjs/validation';

// 单个字段验证
const emailValid = validate(email, { type: 'string', format: 'email' });

// 整个对象验证
const validator = new SchemaValidator();
const objectValid = validator.validateSchema(userData, userSchema);
```

## 优势

### 1. 灵活性

- ✅ 支持断言式验证（无需 Schema）
- ✅ 支持 Schema 驱动的验证
- ✅ 可以混合使用

### 2. 可选依赖

- ✅ 核心功能不依赖 Schema 包
- ✅ Schema 验证作为可选功能
- ✅ 减少包体积

### 3. 类型安全

- ✅ 验证规则类型来自 schema 包
- ✅ 但不强制使用 Schema 结构
- ✅ 类型导入，无运行时依赖

### 4. 向后兼容

- ✅ 现有的验证逻辑可以继续使用
- ✅ 新增 Schema 驱动的验证
- ✅ 不破坏现有 API

## 实施计划

### Phase 1: 重构核心功能

1. 创建 `core/` 目录
2. 移动验证器到 `core/Validator.ts`
3. 创建 `core/Assert.ts`
4. 创建 `core/validate.ts`
5. 更新测试

### Phase 2: 添加 Schema 支持

1. 创建 `engine/SchemaValidator.ts`
2. 实现 Schema 驱动的验证
3. 添加对 `@orbitjs/schema` 的可选依赖
4. 编写测试

### Phase 3: 更新文档

1. 更新 API 文档
2. 添加使用示例
3. 更新依赖关系图

## API 设计

### validate 函数

```typescript
function validate(value: any, rule: ValidationRule): ValidationResult;

// 链式 API
function validate(value: any): ChainableValidator;
```

### assert 对象

```typescript
const assert = {
    isString(value: any, options?: StringRule): void;
    isNumber(value: any, options?: NumberRule): void;
    isEmail(value: any): void;
    isUrl(value: any): void;
    required(value: any): void;
    // ...
};
```

### Validator 类

```typescript
class Validator {
    validate(value: any, rule: ValidationRule): ValidationResult;
    validateAll(values: any[], rules: ValidationRule[]): ValidationResult[];
}
```

### SchemaValidator 类

```typescript
class SchemaValidator extends Validator {
    validateSchema(data: any, schema: Schema): ValidationResult;
    validateField(value: any, field: FieldDefinition): ValidationResult;
}
```

## 参考资料

- [Schema 包设计](./2026-06-15-schema-package-design-revised.md)
- [Validation 包现状](../src/validation/)
