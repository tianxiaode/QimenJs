# 验证最佳实践

## 验证规则定义在 Schema 中

```typescript
// ✅ 正确 - 规则定义在 Schema 中，自动提取
const registrar = SchemaRegistrar.getInstance();
registrar.register({
    name: 'User',
    isTree: false,
    fields: [
        { name: 'username', type: 'string', minLength: 2, maxLength: 20, required: true },
        { name: 'email', type: 'string', format: 'email', required: true },
        { name: 'age', type: 'number', min: 0, max: 150 },
    ],
});

// ❌ 错误 - 规则散落在组件中
const rules = {
    username: { required: true, minLength: 2, maxLength: 20 },
    email: { required: true, format: 'email' },
};
```

**原因**：Schema 编译时自动从字段定义中提取验证规则（`compiled.rules`），Validation 包直接使用这些规则，保证一致性。

## 添加自定义验证器

### 步骤

1. **确定验证阶段**：选择合适的 `ValidationWeight`
2. **定义处理器**：指定 `tags`（适用的 rule.type）和 `execute` 函数
3. **注册**：调用 `ValidatorRegistrar.getInstance().register()`

### 示例：手机号验证

```typescript
import { ValidatorRegistrar, ValidationWeight } from '@qimenjs/validation';
import type { ValidationProcessorEntry } from '@qimenjs/validation';

const phoneValidator: ValidationProcessorEntry = {
    name: 'phone-format',
    weight: ValidationWeight.SEMANTIC,  // 格式校验阶段
    offset: 5,
    tags: ['string', 'any'],            // 适用于 string 类型规则
    execute: async (ctx) => {
        if (ctx.value && !/^1[3-9]\d{9}$/.test(ctx.value)) {
            ctx.errors.push({
                message: '请输入有效的手机号',
                path: ctx.path,
                rule: ctx.rule,
            });
        }
    },
};

ValidatorRegistrar.getInstance().register(phoneValidator);
```

### 示例：跨字段验证

```typescript
const passwordConfirmValidator: ValidationProcessorEntry = {
    name: 'password-confirm',
    weight: ValidationWeight.RELATION,  // 跨字段比对阶段
    offset: 0,
    tags: ['string', 'any'],
    execute: async (ctx) => {
        const { password, confirmPassword } = ctx.rule;
        if (password !== confirmPassword) {
            ctx.errors.push({
                message: '两次输入的密码不一致',
                path: ctx.path,
                rule: ctx.rule,
            });
        }
    },
};
```

## 验证阶段选择指南

| 阶段 | 权重 | 适用场景 |
|------|------|---------|
| PREPARATION | 0 | 填充默认值、trim、transform |
| PRESENCE | 1000 | required/nullable 检查 |
| IDENTITY | 1500 | typeof 类型校验（不通过则 Terminate） |
| SEMANTIC | 2000 | format/pattern 格式校验 |
| QUANTITY | 3000 | min/max/length 物理约束 |
| RELATION | 4000 | enum/跨字段比对 |
| STRUCTURAL | 5000 | 对象 properties/数组 children 递归 |

## 使用 PatternRegistrar 中的正则

```typescript
import { Registry } from '@qimenjs/registry';

// 注册常用模式
Registry.pattern.register('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
Registry.pattern.register('phone', /^1[3-9]\d{9}$/);
Registry.pattern.register('url', /^https?:\/\/.+/);

// 在 Schema 中引用
registrar.register({
    name: 'Contact',
    isTree: false,
    fields: [
        { name: 'email', type: 'string', pattern: 'email', required: true },
        { name: 'phone', type: 'string', pattern: 'phone' },
    ],
});
```

## 错误消息与 i18n

```typescript
// 验证错误消息支持 i18n
ctx.errors.push({
    message: t('validation.required'),  // 自动翻译
    path: ctx.path,
    rule: ctx.rule,
});

// 错误码翻译
t('ENTITY_NOT_FOUND', true);
// 自动从 kernel/validation/http 三个命名空间查找
```

## 反模式清单

| 反模式 | 正确做法 |
|--------|---------|
| 验证规则散落在组件中 | 规则定义在 Schema 字段中 |
| 手动实现已有的验证逻辑 | 使用内置验证处理器 |
| 用 IDENTITY 阶段做格式校验 | 格式校验用 SEMANTIC 阶段 |
| 验证器不设 tags | 指定适用的 rule.type |
| 硬编码正则表达式 | 注册到 PatternRegistrar |

## 参见

- [验证管道与 Schema](../architecture/validation-pipeline.md)
- [Schema 最佳实践](./schema-best-practices.md)
- [i18n 国际化系统](../architecture/i18n-system.md)