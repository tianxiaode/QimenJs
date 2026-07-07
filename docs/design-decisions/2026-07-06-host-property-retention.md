# ComposableBase.host 属性保留决策

## 背景

`ComposableBase.host` 是一个 getter 属性，返回 `this` 自身。在代码审查中，发现该属性在生产代码中完全没有被使用，仅在一个专门测试其行为的单元测试中被访问。因此需要决定是否移除。

## 决策

**保留 `host` 属性，暂不移除。**

## 原因

### 1. 语义价值

在 Ability 方法中，`this` 被 `bind` 到宿主实例。虽然 `this.host === this`，但 `this.host` 在语义上更清晰地表达了"我要访问宿主"的意图：

```typescript
// 语义模糊：this 是谁？是能力自身？还是宿主？
const data = this.abilityState('SomeAbility:data');

// 语义清晰：this.host 明确表达"访问宿主"
const data = this.host.abilityState('SomeAbility:data');
```

### 2. 未来 UI 组件层的潜在需求

在 UI 组件层设计中，Ability 方法内部可能需要区分：
- "我作为能力方法的逻辑身份" — 能力内部的局部逻辑
- "我操作宿主" — 对宿主实例的操作

`this.host` 提供了这种语义区分的可能性，而 `this` 本身无法做到。

### 3. 移除成本低但保留价值存在

- 移除只需删除 3 处代码（getter 定义、接口声明、测试用例）
- 但一旦移除，未来需要时又要重新引入，且可能破坏已有依赖
- 属于"留着不碍事，删了可能后悔"的情况

### 4. 与其他框架的类比

- Vue 的 `$el`、`$refs` 也是语义属性，虽然等价于直接访问 DOM，但提供了更清晰的意图表达
- ExtJS 的 `getViewModel()` 也是类似的语义访问模式

## 影响范围

- `src/composable/ComposableBase.ts` — getter 定义（保留）
- `src/composable/types/composable.ts` — 接口声明（保留）
- `test/unit/composable/ComposableIntegration.test.ts` — 测试用例（保留）

## 替代方案

### 移除 host 属性

- 优点：减少死代码
- 缺点：失去语义区分能力，未来 UI 组件层可能需要重新引入
- 结论：不采用

## 后续工作

- 在 UI 组件层的 Ability 定义中，评估是否实际使用 `this.host` 来区分语义
- 如果 UI 组件层完成后仍未使用，可重新评估是否移除
