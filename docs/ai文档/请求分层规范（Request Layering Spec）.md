好，这一步**非常值**，而且你现在这个状态，正是写「请求分层规范」的**最佳时机**——
因为这是**刚踩完所有坑、但还没忘疼**的时候。

下面我直接给你一份**可以进团队仓库 / Confluence / README 的《请求分层规范 v1》**。
不是理论文，而是**拿来就能约束代码的那种**。

---

# 📐 请求分层规范（Request Layering Spec）

> 目标：
> **消灭 if 漫天飞、拦截器地狱、HTTP 泛型幻觉**
> 让请求链路“可预测、可调试、可演进”

---

## 一、分层职责总览

```
┌──────────────┐
│   UI / View  │  只关心状态和交互
└──────▲───────┘
       │
┌──────┴───────┐
│ Repository   │  业务解释层（唯一允许使用业务泛型）
└──────▲───────┘
       │
┌──────┴───────┐
│ HTTP Client  │  协议运输层（禁止业务语义）
└──────────────┘
```

---

## 二、HTTP 层规范（Transport Layer）

### ✅ 允许做的事

* 发请求（method / url / options）
* 处理 **传输失败**
* 处理 **HTTP 状态码**
* 原样返回服务端响应
* 标记元信息（metadata）

### ❌ 明确禁止

* ❌ 使用业务泛型（`User` / `Order` / `Page<T>`）
* ❌ 解析业务字段（`data.list` / `rows` / `code`）
* ❌ 判断业务成功 / 失败
* ❌ 返回“看起来很友好”的业务对象

---

### 🔒 统一返回结构（唯一）

```ts
HttpClient.request(
  method: HttpMethod,
  url: string,
  options?: RequestOptions
): RequestTask<HttpResponseContext>
```

```ts
interface HttpResponseContext {
  status: number;
  headers: Record<string, string>;
  rawBody: unknown;
  data?: unknown;
  metadata: {
    isTransportFailure?: boolean;
    isHttpSuccess?: boolean;
    error?: unknown;
  };
}
```

> **HTTP 层只回答一句话：**
>
> 👉 “服务器到底说了什么？”

---

## 三、请求 / 响应处理器规范（Processor）

### 🧠 核心原则

> **Processor 只搬运，不做业务决策**

---

### RequestProcessor

* 只负责：

  * method
  * url
  * pathParams
  * queryParams
  * body
* ❌ 不关心 payload 语义
* ❌ 不判断 payload 是否合理

```ts
type RequestProcessor = (
  context: RequestContext,
  payload: any
) => RequestContext;
```

---

### ResponseProcessor（HTTP 层内）

* 只做：

  * 传输失败检测
  * HTTP 状态标记
  * Body 解析
* ❌ 不抛业务错误
* ❌ 不返回业务数据

---

## 四、Repository 层规范（业务解释层）

### 🎯 Repository 是**唯一的业务解释者**

Repository 负责：

* 判断请求是否“业务成功”
* 拆解返回结构
* 校验数据形态
* 转换为业务模型
* 抛出业务错误
* 触发业务事件

---

### Repository 可以、也应该：

```ts
const ctx = await http.request(...).promise;

if (!ctx.metadata.isHttpSuccess) {
  throw new NetworkError(ctx);
}

if (!isBusinessSuccess(ctx.data)) {
  throw new BusinessError(ctx.data);
}

return parseUserList(ctx.data);
```

---

### Repository 才能使用泛型

```ts
async list(): Promise<User[]> {}
async detail(id: ID): Promise<User> {}
```

> **泛型的前提是：你已经知道这是什么东西**

---

## 五、错误处理规范

| 层级         | 处理什么          |
| ---------- | ------------- |
| HTTP       | 网络 / 超时 / 状态码 |
| Repository | 业务失败 / 数据异常   |
| UI         | 展示 / 兜底 / 提示  |

---

## 六、事件规范（Repository）

Repository 可以混入事件能力：

```ts
this.emit('list:loading', true);
this.emit('list:success', users);
this.emit('list:error', err);
```

事件属于**业务语义**，
**禁止出现在 HTTP 层**。

---

## 七、关于 Axios / fetch 的统一认知

> ❗ Axios 的泛型是 **误导性的便利**

* 它只标注 `response.data`
* 不保证成功
* 不保证结构
* 不保证语义

**禁止在 HTTP 封装中暴露 Axios 泛型能力**

---

## 八、一句话总结（可以贴在墙上）

> **HTTP 不懂业务，
> Repository 不懂协议，
> 泛型只属于“我已经知道答案”的地方。**

---

## 九、你现在的设计，评价一句话

你现在做的是：

> **把“不可控的复杂度”锁死在 Repository 层，
> 让系统的其他部分恢复简单。**

这是**架构正确性的体现**，不是保守。

---

如果你愿意，下一步我可以帮你：

* 把这份规范压缩成 **10 条 Code Review Checklist**
* 或者写一份 **“为什么禁止 HTTP 泛型”的反例文档**
* 或者帮你把它改成 **团队可执行的 ESLint / TS 约束点**

你现在这套东西，已经**非常接近成熟前端架构**了。
