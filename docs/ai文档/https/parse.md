你这一步步梳理得**非常对**，而且已经到了「可以把流程**定型**」的阶段了 👍
我帮你把它**收敛成一条“不可再简化”的响应处理主干流程**，同时把你提到的那些**模糊点**一一钉死。

下面不是随便讲思路，而是**可以直接落到代码的执行顺序**。

---

## 一、先给最终结论版（标准响应拆解主流程）

> **响应拆解 = 一次 IO + 一次解释 + 零次或一次错误抛出**

### ✅ 推荐的“唯一正确顺序”

```
RawResponse
  ↓
[1] StatusCode Gate
  ↓
[2] Content-Type Dispatch
  ↓
[3] Body Decode（一次）
  ↓
[4] Semantic Parse（错误 / 成功）
  ↓
[5] Data Extract
  ↓
Return Final Data
```

**任何跳步、重复 parse，都会导致复杂度爆炸。**

---

## 二、逐步精确定义每一步「必须做什么 / 绝对不能做什么」

---

## [1] StatusCode Gate（但不是最终裁决）

### 做什么 ✅

* 判断 **是否进入错误通道**
* 但**不决定最终是否成功**

```ts
if (!statusInAcceptRange(response.status)) {
  context.statusError = true
}
```

### 不做什么 ❌

* ❌ 不构造最终 HttpError
* ❌ 不 return
* ❌ 不 throw

> 因为：
> **200 可能是错，500 也可能返回有用信息**

👉 status 只是 **信号**，不是裁决者。

---

## [2] Content-Type Dispatch（这是分叉点）

### 必须做的事

```ts
const type = detectContentType(response)
```

推荐统一归一成：

```ts
type ResponseBodyKind =
  | 'json'
  | 'text'
  | 'blob'
  | 'stream'
  | 'arrayBuffer'
```

---

### 关键决策表（你之前卡住的点就在这）

| 类型          | 行为                     |
| ----------- | ---------------------- |
| blob        | ❌ 不进入 JSON / 错误 / 提取管道 |
| stream      | ❌ 同上                   |
| arrayBuffer | ❌ 同上                   |
| text        | ✅ 进入文本策略               |
| json        | ✅ 进入 JSON 策略           |

👉 **非结构化数据 = 原样返回，由调用者处理**

---

## [3] Body Decode（只能一次，极其重要）

### ❗ 这是“不可逆步骤”

```ts
context.rawBody = await decodeBody(response, type)
```

* fetch / xhr **只能读一次**
* 所有后续 parser **共享同一份 body**

---

### 关键点：text 到底怎么处理？

你问得很好：

> 字符串是直接纯文本返回，还是尝试 JSON？

答案是：**可配置 + 默认保守**

#### 推荐默认行为（最安全）

```ts
if (type === 'text') {
  if (options.tryJsonOnText) {
    tryParseJson()
  } else {
    return text
  }
}
```

👉 **永远不要“偷偷”把 text 当 json**

---

## [4] Semantic Parse（核心：错误 & 成功在这统一判断）

这是你整个系统里**最重要的一步**。

### 输入

```ts
{
  status,
  headers,
  body,        // 已解码（string | object）
  statusError  // from step 1
}
```

---

### 执行逻辑（管道）

```ts
for (const parser of semanticParsers) {
  const result = parser.parse(context)
  if (result.type === 'error') throw result.error
  if (result.type === 'handled') break
}
```

---

### 这里统一处理的 **三类错误**

#### 1️⃣ 状态码错误

```ts
if (context.statusError) {
  return error("HTTP_STATUS_ERROR")
}
```

#### 2️⃣ 业务错误（code / success / error 字段）

```ts
if (body.code !== 0) error(...)
```

#### 3️⃣ 非法响应（json 结构不符合预期）

```ts
if (!hasExpectedShape(body)) error(...)
```

👉 **所有“是不是错”都必须在这里终结**

---

## [5] Data Extract（只有在“确认成功后”）

### 前置条件（必须全部满足）

* ✔ statusParser 没 throw
* ✔ businessErrorParser 没 throw
* ✔ response 语义被确认是 success

---

### 数据提取本质

```ts
extract(body) => T
```

#### 示例

```ts
{ data: {...} }       -> data
{ result: {...} }     -> result
{ list: [], total }  -> list
直接数组             -> body
```

> **Extractor 永远不判断错误，只做“成功数据映射”**

---

## 三、你提到的“重叠问题”，现在怎么解决？

> 状态码 != 200 也需要 body 错误处理
> 状态码 == 200 也可能有 body 错误

👉 **统一答案：**

> **状态码只是错误来源之一，而不是错误类型**

你现在的 pipeline 模型就是：

```
Error = f(status, headers, body)
```

而不是：

```
Error = status != 200
```

这就是为什么 **Adapter 完全不适合干这件事**。

---

## 四、最终一句话总结（你这个系统的“设计哲学”）

> **HTTP Client 不判断成功与否，它只负责“解释响应并给出结论”**

而这个“结论”只能有两种：

* ✔ 返回已提取的数据
* ❌ 抛出已语义化的错误

---

## 五、如果你愿意，下一步我可以直接帮你：

* 📦 写一版 **ResponsePipeline + Context 的完整 TypeScript 实现**
* 🔌 给你一个 **项目初始化注册 parser 的示例**
* 🧪 列一套 **真实后端返回结构的适配案例**
* 🧱 把 text / json / blob / stream 的分发代码写完整

你现在这个设计，已经是**“库级设计”而不是业务封装了**，值得一次性打磨好。
