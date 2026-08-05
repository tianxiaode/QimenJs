# 验证管道与 Schema

> QimenJS 验证系统采用**管道模式**，与 HTTP 管道共用同一个 Pipeline 执行引擎。通过 ValidatorRegistrar 注册验证处理器，Schema 定义验证规则，两者协作实现声明式表单验证。

## 概述

验证系统的核心设计：

- **管道化**：验证规则按 weight+offset 排序，分阶段执行
- **不中断**：`breakOnError = false`，收集所有错误
- **可扩展**：通过 ValidatorRegistrar 注册自定义验证处理器
- **类型驱动**：按 `rule.type` 过滤处理器，不同类型走不同验证链

## 验证管道

### 验证阶段权重

| 阶段 | 权重 | 职责 | 示例处理器 |
|------|------|------|-----------|
| PREPARATION | 0 | 填充默认值、trim、transform | `trim`、`transform`、`default` |
| PRESENCE | 1000 | required/nullable 检查 | `presence`（required） |
| IDENTITY | 1500 | typeof 类型校验 | `type`（不通过则 Terminate） |
| SEMANTIC | 2000 | format/pattern 格式校验 | `format`、`pattern` |
| QUANTITY | 3000 | min/max/length 物理约束 | `length`、`range`、`is` |
| RELATION | 4000 | enum/跨字段比对 | `includes`、`excludes`、`unique` |
| STRUCTURAL | 5000 | 对象 properties/数组 children 递归 | `properties`、`children`、`entries` |

### 执行流程

```
doValidate(value, rule, partialContext)
  → createContext(value, rule, partial)          // 构造 ValidationContext
  → ValidatorRegistrar.get(rule.type)             // 获取处理器链
  → validationExecutor.execute(context, processors, rule.type)
  → return { isValid, errors, value, context }
```

**关键差异**（与 HTTP 管道对比）：
- `breakOnError = false`：验证不中断，收集所有错误
- Tags 过滤：按 `rule.type` 过滤处理器（如 `'string'`、`'number'`、`'any'`）
- IDENTITY 阶段不通过时设置 `terminate = true`，跳过后续阶段

### ValidationContext

```typescript
interface ValidationContext {
    value: any;                    // 待验证的值
    rule: ValidationRule;          // 验证规则
    errors: ValidationError[];     // 收集的错误
    path: string;                  // 字段路径（嵌套验证时递归）
    metadata: { terminate?: boolean };  // 熔断标记
}
```

## ValidatorRegistrar

继承 `RegistrarBase`，使用数组存储处理器条目：

```typescript
// 注册自定义验证器
ValidatorRegistrar.getInstance().register({
    name: 'my-check',
    weight: ValidationWeight.RELATION,  // 选择阶段
    offset: 10,                          // 阶段内偏移
    tags: ['string', 'any'],             // 适用的 rule.type
    execute: async (ctx) => {
        if (!someCondition(ctx.value)) {
            ctx.errors.push({
                message: '验证失败',
                path: ctx.path,
                rule: ctx.rule,
            });
        }
    },
});
```

**缓存机制**：`get(type)` 方法检查 `chainCache`，未命中时过滤 + 排序 + 缓存。

## 添加自定义验证器

### 步骤

1. **确定验证阶段**：选择合适的 `ValidationWeight`
2. **定义处理器**：指定 `tags`（适用的 rule.type）和 `execute` 函数
3. **注册**：调用 `ValidatorRegistrar.getInstance().register()`

### 示例：手机号验证

```typescript
const phoneValidator: ValidationProcessorEntry = {
    name: 'phone-format',
    weight: ValidationWeight.SEMANTIC,
    offset: 5,
    tags: ['string', 'any'],
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
    weight: ValidationWeight.RELATION,
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

## Schema 与验证协作

### Schema 定义

Schema 通过 `SchemaAbility` 注入到 `CoreEntityManager`，定义字段的验证规则：

```typescript
const userSchema = {
    name: { type: 'string', required: true, min: 2, max: 50 },
    email: { type: 'string', format: 'email', required: true },
    age: { type: 'number', min: 0, max: 150 },
};
```

### Schema 与事件系统协作

Schema 验证可通过事件系统与表单组件协作：

1. **表单提交** → 组件触发 `validate` 事件
2. **Schema 验证** → `doValidate(value, rule)` 执行验证管道
3. **验证结果** → 通过事件总线通知组件
4. **错误显示** → 组件根据错误信息更新 UI

### 嵌套验证

STRUCTURAL 阶段的 `properties`/`children` 处理器支持递归验证：

```
对象验证：properties 处理器 → 遍历每个字段 → 递归 doValidate
数组验证：children 处理器 → 遍历每个元素 → 递归 doValidate
```

`ValidationContext.path` 记录当前验证路径（如 `user.address.city`），错误信息中包含完整路径。

### i18n 错误消息

验证错误消息支持 i18n：

```typescript
// 错误码 → i18n key
ctx.errors.push({
    message: t('validation.required'),  // 自动翻译
    path: ctx.path,
    rule: ctx.rule,
});
```

## 内置验证处理器

### 通用处理器（tags: ['any']）

| 处理器 | 阶段 | 作用 |
|--------|------|------|
| `trim` | PREPARATION | 去除首尾空格 |
| `transform` | PREPARATION | 值转换 |
| `presence` | PRESENCE | required 检查 |

### 类型处理器

| 类型 | 处理器 |
|------|--------|
| `string` | type、length、includes、excludes、format |
| `number` | type、range、is、includes、excludes |
| `boolean` | type |
| `date` | type、is、includes、excludes、weekend |
| `array` | type、length、includes、excludes、unique、uniqueBy、children |
| `object` | type、properties、required-fields |
| `file` | file（大小、类型检查） |
| `password` | password（强度检查） |
| `format` | format（正则/内置格式） |
| `split` | split（分隔符拆分后验证） |

## 参见

- [注册表系统](./registry-system.md)
- [HTTP 管道与平台适配](./http-pipeline.md)
- [i18n 国际化系统](./i18n-system.md)