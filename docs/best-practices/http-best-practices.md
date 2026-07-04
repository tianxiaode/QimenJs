# HTTP 管道最佳实践

## 理解 HTTP 管道流程

每个 HTTP 请求经过 4 个阶段，8 个内置处理器按权重排序串行执行：

```
请求到来
  │
  ▼
┌─ PREPARE（准备阶段）─────────────────────────┐
│  10 CommonParamsEnricher  合并公共参数          │
│  15 TokenInjector         注入认证 Token        │
│  20 UrlBuilder            拼接完整 URL          │
└──────────────────────────────────────────────┘
  │
  ▼
┌─ EXCHANGE（交换阶段）─────────────────────────┐
│  10 FetchTransport        Fetch API 传输       │
│  20 XhrTransport          XHR 传输（上传/下载） │
└──────────────────────────────────────────────┘
  │
  ▼
┌─ PROCESS（处理阶段）─────────────────────────┐
│  10 ResponseAnalyzer      分析状态码/类型       │
│  20 DataParser            解析响应体            │
└──────────────────────────────────────────────┘
  │
  ▼
┌─ ALIGN（对齐阶段）───────────────────────────┐
│  10 DownloadInterceptor   触发浏览器下载        │
└──────────────────────────────────────────────┘
```

## 1. 用 domain 配置公共参数，不要每个请求手动传

```typescript
// 正确 - 通过 domain 配置公共参数
const { Registry } = require('@orbit-js/registry');
Registry.domain.register('api', {
  baseUrl: 'https://api.example.com',
  token: 'xxx',
  commonParams: { appId: 'my-app' },
});

const client = new HttpClient('api');
client.get('/users');  // 自动带 baseUrl、Token、appId

// 错误 - 每个请求手动传
client.get('https://api.example.com/users?appId=my-app', {
  headers: { Authorization: 'Bearer xxx' },
});
```

**原因**：`CommonParamsEnricher` 和 `TokenInjector` 在 PREPARE 阶段自动从 `domainConfig` 读取配置并注入，避免重复代码。

## 2. 分页参数通过 data.params 传入，不要手动拼 URL

```typescript
// 正确 - 通过 data.params 传入，由管道自动转换
const ctx = await client.get('/users', {
  data: { params: { pageIndex: 1, pageSize: 20 } },
});

// 错误 - 手动拼 URL
const ctx = await client.get('/users?skipCount=20&takeCount=20');
```

**原因**：分页参数由 `data-processor-abp` 或 `data-processor-spring` 的处理器自动转换格式并注入 `queryParams`，再由 `UrlBuilder` 拼接到 URL。手动拼 URL 绕过了管道，容易出错。

## 3. 上传/下载用 XHR，普通请求用 Fetch

```typescript
// 普通请求 - 自动走 FetchTransport
const ctx = await client.get('/users');

// 上传 - 自动走 XhrTransport
const ctx = await client.post('/upload', {
  body: formData,
  onProgress: (ev) => console.log(ev.loaded / ev.total),
});

// 下载 - 自动走 XhrTransport + DownloadInterceptor
const ctx = await client.get('/files/123', {
  responseType: 'blob',
});
```

**原因**：`FetchTransport` 和 `XhrTransport` 是互斥的，通过 `context.metadata.isUpload/isDownload` 自动选择。不需要手动指定传输方式。

## 4. 用 domain 配置 Token，不要手动设 Header

```typescript
// 正确 - 通过 domain 配置
Registry.domain.register('api', {
  token: 'my-jwt-token',
  authInjector: 'bearer',  // 或 'basic' 或自定义函数
});

// 自定义注入逻辑
Registry.domain.register('api', {
  authInjector: async (context) => {
    const token = await refreshToken();
    context.request.headers['Authorization'] = `Bearer ${token}`;
  },
});

// 错误 - 手动设 Header
client.get('/users', {
  headers: { Authorization: 'Bearer my-jwt-token' },
});
```

**原因**：`TokenInjector` 在 PREPARE 阶段自动注入，支持 Bearer、Basic 和自定义函数三种模式。手动设 Header 容易遗漏且无法统一管理。

## 5. 响应数据从 context.data 取，不要从 response.data 取

```typescript
// 正确 - 从 context.data 取对齐后的数据
const ctx = await client.get('/users');
const users = ctx.data.list;      // 列表数据
const total = ctx.data.total;     // 总数
const user = ctx.data.item;       // 单项数据

// 错误 - 从 response.data 取原始数据
const raw = ctx.response.data;    // 可能是 PagedResultDto 或 Page<T>
```

**原因**：`data-processor-abp/spring` 的后道处理器会从后端特定格式（`PagedResultDto`、`Page<T>`）中提取数据并标准化到 `context.data`。直接取 `response.data` 需要手动处理不同后端的格式差异。

## 6. 错误由管道统一处理，不要在每个请求中 try/catch

```typescript
// 正确 - 管道自动处理错误
const ctx = await client.get('/users');
if (ctx.error) {
  console.log(ctx.error.code);     // 'Volo.Abp:01001' 或 'SPRING_404'
  console.log(ctx.error.message);  // 统一的错误消息
}

// 错误 - 每个请求 try/catch
try {
  const ctx = await client.get('/users');
} catch (e) {
  // 需要手动解析不同后端的错误格式
}
```

**原因**：`abp-error` 和 `spring-error` 处理器将后端特定错误格式转换为统一结构，并标记 `metadata.isErrorHandled = true`。

## 反模式清单

| 反模式 | 正确做法 |
|--------|----------|
| 每个请求手动传 baseUrl/Token | 通过 domain 配置 |
| 手动拼分页 URL | data.params + 管道自动转换 |
| 手动设 Authorization Header | domain.token + TokenInjector |
| 从 response.data 取数据 | 从 context.data 取对齐后数据 |
| 每个请求 try/catch | 管道统一错误处理 |
| 手动判断用 Fetch 还是 XHR | 管道自动选择传输方式 |
