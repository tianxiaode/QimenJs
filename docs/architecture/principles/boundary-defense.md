# 边界与防御原则

## 核心思想

> **类型在边界解决，逻辑在原子解决。**
> **utils 执行世界，validation 守护世界。**

## 问题背景

在早期实现中，工具函数往往为了"安全"而包含大量防御代码（`typeof`、`Array.isArray`、`null` 检查等）。

随着函数数量增长，这种模式会导致：

- 防御逻辑大量重复
- 工具函数可读性下降
- 维护成本呈指数级增长
- 错误语义分散、难以定位
- 测试复杂度失控

## 核心原则

### 原则 1：utils 不做输入校验

**utils 假定输入已经合法**

```typescript
// ✅ 正确：无防御代码，类型即契约
export function cloneArray<T>(arr: readonly T[]): T[] {
  return arr.slice();
}

// ❌ 错误：将校验职责错误地放入 utils
export function cloneArray(value: any) {
  if (!Array.isArray(value)) {
    throw new TypeError('Expected array');
  }
  return value.slice();
}
```

**规则**：
- utils 不包含任何 `typeof` / `instanceof` / `Array.isArray` / `null` 检查
- utils 不负责生成用户友好的错误信息
- utils 是执行单元，不是防御边界

### 原则 2：validation 是唯一的输入校验层

**validation 负责**：
- unknown → 已知类型
- 类型 / 结构 / 前置条件校验
- 所有"非法输入"处理
- 所有用户可见错误

```typescript
// validation 的职责
export function assertArray(
  value: unknown,
  message = 'Expected array'
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(message);
  }
}
```

**validation 是系统的"守门人"**

### 原则 3：防御只能发生在"边界"

**边界包括**：
- 对外 API
- 构造函数 / 工厂函数
- JSON / IO / 配置解析
- 跨模块、跨层调用入口

**边界之外，不做兜底。**

## 测试责任分层

| 函数类型 | 测什么 | 不测什么 |
|---------|--------|----------|
| utils | ✅ 正确输入 → 正确输出 | ❌ 非法类型 |
| validation / assert | ✅ 非法输入 | ❌ 正常业务 |
| API / factory | ✅ 非法输入 | ❌ 内部细节 |
| 内部逻辑 | ✅ 不变量 | ❌ 用户错误 |

### utils 测试规范

**只关注**：
- 合法输入
- 合法输入的边界情况

```typescript
// ✅ 正确的 utils 测试
describe('cloneArray', () => {
  it('clones array', () => {
    const input = [1, 2, 3];
    const result = cloneArray(input);
    
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });
  
  it('works with readonly array', () => {
    const input = Object.freeze([1, 2]);
    const result = cloneArray(input);
    
    expect(result).toEqual([1, 2]);
  });
});
```

**禁止**：
```typescript
// ❌ utils 测试中禁止
cloneArray(null)
cloneArray(123)
cloneArray({})
```

### validation 测试规范

**专注非法输入**：

```typescript
describe('assertArray', () => {
  it('throws on non-array', () => {
    expect(() => assertArray(null)).toThrow();
    expect(() => assertArray(123)).toThrow();
    expect(() => assertArray({})).toThrow();
  });
});
```

## 正确的配合方式

### 推荐用法

```typescript
// 边界层：先校验
assertArray(input);

// 内部层：直接使用
const result = cloneArray(input);
```

### 禁止用法

```typescript
// ❌ 禁止：input 未经校验直接使用
cloneArray(input);

// 仅允许在内部、已保证类型正确的上下文中使用
```

## 错误与崩溃的解释权

### utils 抛出的运行期错误

- 属于 **契约被破坏**
- 不是 bug
- 就像 `Math.max(null)` 报错不是 Math 的 bug

### validation 抛出的错误

- 属于 **用户输入错误**
- 必须清晰、稳定
- 是系统的"守门人"

## 迁移与维护原则

### 新写 utils

一律不加防御代码。

### 旧 utils

防御代码允许暂存，但需标注：

```typescript
// TODO: move to validation
if (!Array.isArray(value)) {
  throw new TypeError('Expected array');
}
```

### 禁止

不允许新增 utils → validation 的依赖。

## 实施检查清单

### 写 utils 前

- [ ] 确定这是内部执行单元，不是边界
- [ ] 类型签名已经表达契约
- [ ] 不需要处理非法输入

### 写 utils 测试前

- [ ] 只测试合法输入
- [ ] 不测试非法类型
- [ ] 添加注释：`// utils assume valid input`

### 写 validation 前

- [ ] 确定这是边界层
- [ ] 需要处理 unknown → 已知类型
- [ ] 需要生成用户友好的错误信息

### 写 validation 测试前

- [ ] 测试所有非法输入
- [ ] 验证错误信息清晰
- [ ] 验证类型收窄正确

## 常见问题

### Q: utils 报 runtime error，不算 bug 吗？

**A**: 不算。这是契约违约错误，不是逻辑错误。

### Q: 那非法输入谁来测？

**A**: validation / assert 来测。边界集中，职责清晰。

### Q: 如果我真的需要在 utils 里检查类型怎么办？

**A**: 
1. 重新思考这是否应该是 validation 的职责
2. 如果确实需要，添加注释并计划迁移
3. 考虑是否设计有问题

### Q: 这样会不会导致运行时错误？

**A**: 
- 会的，但这是契约错误，不是 bug
- 通过类型系统和边界检查来预防
- 内部代码信任内部代码

## 收益

一旦遵循这些原则：

- utils 测试数量 ↓
- utils 实现复杂度 ↓
- validation 测试集中且有意义
- 不再"为了测而改代码"
- 代码可读性 ↑
- 维护成本 ↓

## 参考资料

- [utils_validation_设计公约.md](../../utils_validation_设计公约.md) - 原始设计公约
- [关于边界测试.md](../../关于边界测试.md) - 测试哲学讨论
