这个问题**提得非常对，而且时机刚刚好**。
你现在不是在写实现，而是在**为整个 Kernel 定“宪法”**。
这一步不做清楚，后面所有 Processor 都会变成“各自为政”。

下面我会：

1. **确认你提的两条规则本身是否正确**
2. **补齐必须同时定义的最小规则集（不多，但一个都不能少）**
3. **给出一份可以直接写进文档的《Processor 基本规则 v1》**

---

## 一、你现在提出的两条规则：结论先给

### ✅ 规则 1：处理器抛异常 → 立刻终止流水线

**完全正确，而且必须是“硬规则”**

你说的方式也是对的：

* FlowRunner 用 `await` 执行 handler
* 捕获异常
* 设置：

  * `ctx.isAbort = true`
  * `ctx.abortReason = 'error'`
  * `ctx.abortBy = processorId`
  * `ctx.error = err`

⚠️ 注意：
**Processor 内部不需要关心 try/catch**
这是 Runner 的职责

---

### ✅ 规则 2：处理器主动设置 `isAbort = true` → 软终止

**也完全正确，而且这是一个非常强大的能力**

但你敏锐地意识到一个关键点：

> “要不要附加是在哪个处理器断的？”

答案是：

> **必须，而且这是规则的一部分**

---

## 二、你已经走到这一步，就必须一起定清楚的 6 条核心规则

下面这 6 条，是**最小完备集**，不多不少。

---

## 📜《Processor 基本规则（Kernel 规范草案 v1）》**

### 1️⃣ 执行顺序规则（Execution Order）

* Processor 按 `weight → offset` 排序后依次执行
* 同一 Pipeline 中 **严格顺序执行**
* 不允许并行执行 Processor

---

### 2️⃣ 上下文唯一性规则（Single Context）

* 整条流水线 **只存在一个 FlowContext 实例**
* Processor **只能修改 ctx**
* 不允许返回新 ctx 或替换 ctx

```ts
// ❌ 不允许
return newCtx;

// ✅ 允许
ctx.params = normalize(ctx.params);
```

---

### 3️⃣ 错误即终止规则（Error = Hard Abort）

> **只要 handler 抛出异常，流水线立刻终止**

FlowRunner 行为：

```ts
try {
  await handler(ctx);
} catch (err) {
  ctx.error = err;
  ctx.isAbort = true;
  ctx.abortReason = 'error';
  ctx.abortBy = processorId;
  break;
}
```

**约定：**

* Processor 不应捕获并吞掉系统级错误
* 业务可控错误 → 使用软终止（见规则 4）

---

### 4️⃣ 主动中断规则（Soft Abort）

Processor **可以主动终止后续执行**：

```ts
ctx.isAbort = true;
ctx.abortReason = 'manual';
ctx.abortBy = 'AuthGuard';
ctx.result = null; // 可选
```

FlowRunner 行为：

* 检测到 `ctx.isAbort === true`
* 停止执行后续 Processor
* 不视为错误

👉 **这是“正常控制流”**

---

### 5️⃣ 中断信息必须完整（Abort Metadata Required）

**任何中断（硬 / 软）都必须包含：**

| 字段            | 含义                                         |
| ------------- | ------------------------------------------ |
| `abortBy`     | 中断发生在哪个 Processor                          |
| `abortReason` | `error \| manual \| condition \| shortcut` |
| `error`       | 仅 error 场景必填                               |

这条规则的价值是：

* 调试
* 日志
* UI 提示
* APM / Trace

---

### 6️⃣ Processor 行为边界（Side Effect Boundary）

Processor **不应**：

* 发起真实 IO（fetch / fs / db）
* 阻塞线程
* 启动异步后台任务

Processor **可以**：

* 准备请求参数
* 附加 signal
* 写入 ctx.metadata
* 标记 abort

---

## 三、你提到的两个场景，按规则应该这样落地

### 🧠 场景 1：Auth 失败，直接中断

```ts
const AuthGuard = (ctx: FlowContext) => {
  if (!ctx.metadata.user) {
    ctx.isAbort = true;
    ctx.abortReason = 'condition';
    ctx.abortBy = 'AuthGuard';
    ctx.error = new UnauthorizedError();
  }
};
```

✔ 不抛异常
✔ 清晰可追踪
✔ Runner 自动停

---

### 🧠 场景 2：缓存命中，短路后续处理

```ts
const CacheHit = (ctx: FlowContext) => {
  const cached = cache.get(ctx.key);
  if (cached) {
    ctx.result = cached;
    ctx.isAbort = true;
    ctx.abortReason = 'shortcut';
    ctx.abortBy = 'CacheHit';
  }
};
```

✔ 完全合法
✔ 非错误
✔ 结果可用

---

## 四、FlowRunner 必须承担的唯一职责（非常重要）

你现在这个 Kernel，有一个**关键类一定要很“无聊”**：

### FlowRunner 的唯一职责是：

1. 顺序执行
2. 捕获异常
3. 检查 `isAbort`
4. 填充中断元数据
5. 返回 ctx

👉 **不做业务判断**
👉 **不理解 action / domain**
👉 **不 special case**

---

## 五、建议你现在立刻补充到 FlowContext 的字段

你现在已经有：

```ts
isAborted: boolean;
error: any | null;
```

我建议你补齐到这个最小形态：

```ts
isAbort: boolean;
abortBy?: string;
abortReason?: 'error' | 'manual' | 'condition' | 'shortcut';
```

这是**可观测性分水岭**。

---

## 六、一句很重要的判断（结尾）

你现在做的不是“约定用法”，而是在：

> **定义一种可被第三方安全扩展的执行模型**

只要这些规则定清楚：

* 你可以放心让任何人写 Processor
* Kernel 不会被玩坏
* Debug 成本是 O(1)

如果你愿意，下一步我可以帮你把这套规则**整理成一页正式文档 + FlowRunner 伪代码**，直接可以放进 repo。
