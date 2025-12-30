你这个担忧 **100% 命中痛点**，而且已经不是“实现问题”，而是**控制复杂度的架构问题**了。
我先给你一个**核心结论**，再把复杂性**压缩回一个可控模型**。

---

## 一、先说一句非常关键的话（这是破局点）

> **“错误”不是一个分支，而是一种结果。**

现在之所以觉得乱，是因为你在脑子里是这样建模的：

```
成功流程一套
错误流程一套
状态码错误一套
业务错误一套
```

而实际上，**这四套逻辑 80% 是重叠的**。

👉 真正正确的模型是：

> **所有响应都走同一条“解释流程”，
> 只是最后的“判定结果”不同。**

---

## 二、统一模型：Response Interpretation（一次解释，一次裁决）

### ❌ 现在的隐式模型（复杂的根源）

```
if status error:
   parse error
else:
   parse success
```

### ✅ 正确模型（复杂度骤降）

```
RawResponse
  ↓
Decode Body（一次）
  ↓
Interpret Response（一次）
  ↓
Result:
   - Success<T>
   - Failure<HttpError>
```

**没有“错误分支”，只有“解释结果不同”**。

---

## 三、关键转折：状态码错误 ≠ 特殊流程

你刚才说的这句话非常重要：

> 「状态码不是成功，其实也是包含有错误信息的」

所以我们直接 **废掉“状态码错误流程”这个概念**。

### 状态码在新模型里的真实地位是：

```ts
status = 一个“错误信号字段”
```

它和：

* body.code
* body.success
* body.error
* headers['x-error-code']

是 **同一层级的信息源**。

---

## 四、真正的简化方案：ResponseContext + 单一 Pipeline

### 1️⃣ 统一上下文（这是压缩复杂度的核心）

```ts
interface ResponseContext {
  status: number
  headers: Headers
  rawBody: string | Blob | ArrayBuffer | null
  parsedBody?: any

  // 中间状态
  contentType: 'json' | 'text' | 'blob' | 'stream'
  meta: Record<string, any>

  // 最终裁决
  result?: {
    type: 'success'
    data: any
  } | {
    type: 'error'
    error: HttpError
  }
}
```

**注意：**

* 没有 `isError`
* 没有 `isSuccess`
* 没有 `statusError`

---

### 2️⃣ Pipeline 的职责发生了根本变化

> ❌ 以前：判断是否错误
> ✅ 现在：**不断补充信息，直到可以裁决**

---

## 五、Pipeline 的“唯一职责”：尝试裁决（Try Resolve）

### 每个 parser 的签名统一为：

```ts
interface ResponseInterpreter {
  interpret(ctx: ResponseContext): void
}
```

### 规则只有三条（非常重要）：

1. **不能 throw**
2. **不能 return**
3. **只能在 ctx 上写信息**

---

## 六、什么时候“判定错误 / 成功”？

只有在 **Pipeline 最后**，统一做一次裁决。

```ts
function finalize(ctx: ResponseContext) {
  if (ctx.result) return ctx.result

  if (hasErrorSignals(ctx)) {
    return errorResult(buildHttpError(ctx))
  }

  return successResult(extractData(ctx))
}
```

👉 **这一步是唯一做 if/else 的地方**

---

## 七、这样一来，你提到的“状态码错误也要拆数据”自然成立

### 因为现在流程是：

```
500 + JSON body
  ↓
JSON Parser 解析
  ↓
BusinessErrorInterpreter 读 body
  ↓
ErrorMapper 生成语义错误
```

**和 200 + JSON 是完全同一条路。**

---

## 八、那 blob / stream 呢？会不会又乱？

不会，因为它们**根本不进入语义解释层**。

```ts
if (contentType === 'blob' || 'stream') {
  ctx.result = success(blob)
}
```

一刀切。

---

## 九、你现在的复杂性，其实来自一个“错误的抽象边界”

你之前的边界是：

> **status 决定走哪条路**

而现在变成：

> **所有响应先解释，再裁决**

这是一个**质变级的简化**。

---

## 十、一句话总结（这句可以写进 README）

> **HTTP 响应没有“错误流程”和“成功流程”，
> 只有一次“响应解释”，和一次“结果裁决”。**

---

## 下一步我强烈建议你做什么？

1. **先写 ResponseContext 类型**
2. 再写一个空的 ResponsePipeline（只 finalize）
3. 然后一个个加 Interpreter
4. 每加一个，复杂度不会上升

如果你愿意，我可以**下一条直接帮你把 ResponsePipeline 的骨架代码写出来**，你照着填 parser 就行。
