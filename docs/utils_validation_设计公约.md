# utils & validation 设计公约

> 本公约用于明确 **工具函数（utils）** 与 **验证模块（validation）** 的职责边界，避免重复防御、过度校验和复杂度失控。

---

## 一、设计背景

在早期实现中，工具函数往往为了“安全”而包含大量防御代码（`typeof`、`Array.isArray`、`null` 检查等）。

随着函数数量增长，这种模式会导致：

- 防御逻辑大量重复
- 工具函数可读性下降
- 维护成本呈指数级增长
- 错误语义分散、难以定位

本公约的目标是：

> **将“输入不可信”的假设，集中在系统边界处理；
> 让内部工具函数只关注逻辑本身。**

---

## 二、核心原则（必须遵守）

### 🎯 原则 1：utils 不做输入校验

- utils **假定输入已经合法**
- utils **不包含任何** `typeof` / `instanceof` / `Array.isArray` / `null` 检查
- utils 不负责生成用户友好的错误信息

> utils 是执行单元，不是防御边界。

---

### 🎯 原则 2：validation 是唯一的输入校验层

- validation 负责：
  - unknown → 已知类型
  - 类型 / 结构 / 前置条件校验
- validation 是系统的“守门人”

validation 可以提供：

- `assert*`（抛异常）
- `check*`（返回错误对象）
- `createValidator`（规则驱动）

---

### 🎯 原则 3：防御只能发生在“边界”

所谓边界包括：

- 对外 API
- 构造函数 / 工厂函数
- JSON / IO / 配置解析
- 跨模块、跨层调用入口

**边界之外，不做兜底。**

---

## 三、utils 编码规范

### ✅ 正确示例

```ts
export function cloneArray<T>(arr: readonly T[]): T[] {
  return arr.slice();
}
```

```ts
export function merge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  for (const key in source) {
    (target as any)[key] = source[key];
  }
  return target as T & U;
}
```

特点：

- 无防御代码
- 类型即契约
- 逻辑清晰、可组合

---

### ❌ 禁止示例

```ts
export function cloneArray(value: any) {
  if (!Array.isArray(value)) {
    throw new TypeError('Expected array');
  }
  return value.slice();
}
```

问题：

- 将校验职责错误地放入 utils
- 制造重复防御
- 扭曲函数真实契约

---

## 四、validation 编码规范

### validation 的职责

- 所有“非法输入”处理
- 所有用户可见错误
- 所有输入前置条件

### assert 风格示例

```ts
export function assertArray(
  value: unknown,
  message = 'Expected array'
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(message);
  }
}
```

```ts
export function assertObject(
  value: unknown
): asserts value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    throw new TypeError('Expected object');
  }
}
```

---

## 五、utils 与 validation 的正确配合方式

### 推荐用法

```ts
assertArray(input);
const result = cloneArray(input);
```

### ❌ 禁止用法

```ts
cloneArray(input); // input 未经校验
```

（仅允许在内部、已保证类型正确的上下文中使用）

---

## 六、测试公约（非常重要）

### utils 测试只关注：

- 合法输入
- 合法输入的边界情况

```ts
cloneArray([])
cloneArray([1, 2, 3])
cloneArray(new Array(10000))
```

❌ utils 测试中 **禁止**：

```ts
cloneArray(null)
cloneArray(123)
cloneArray({})
```

---

### validation 测试专注非法输入

```ts
expect(() => assertArray(null)).toThrow();
expect(() => assertArray({})).toThrow();
```

---

## 七、错误与崩溃的解释权

- utils 抛出的运行期错误：
  - 属于 **契约被破坏**
  - 不是 bug

- validation 抛出的错误：
  - 属于 **用户输入错误**
  - 必须清晰、稳定

---

## 八、迁移与维护原则

- 新写 utils：
  - 一律不加防御

- 旧 utils：
  - 防御代码允许暂存
  - 标注 `// TODO: move to validation`

- 不允许新增：
  - utils → validation 的依赖

---

## 九、最终原则（请记住这句话）

> **类型在边界解决，逻辑在原子解决。
> utils 执行世界，validation 守护世界。**
