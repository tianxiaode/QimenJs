# @qimenjs/http

**层级**: 第 3 层  
**状态**: ✅ 已完成  
**测试**: ✅ 已完成  
**覆盖率**: 86.54%（分支）

## 概述

HTTP 客户端包，提供完整的 HTTP 请求功能，包括：
- 简单的 HTTP API（HttpClient）
- 核心执行器（HttpExecutor）
- 处理器注册表（HttpActionRegistrar）
- 高级功能（HttpFactory：重试、轮询）
- Token 管理（TokenInjector）

## 架构

```
HttpActionRegistrar (处理器注册表)
    ↓
HttpExecutor (核心执行器)
    ↓
HttpClient (简单 API)    StreamClient (流式 API)
    ↓                        ↓
HttpFactory (高级功能)   StreamTask (异步生成器)
```

### 核心组件

#### 1. HttpActionRegistrar
- 继承自 `RegistrarBase`
- 管理 HTTP 处理器的注册和检索
- 支持四个阶段的处理器：
  - PREPARE (100): 准备阶段 - 构建请求
  - EXCHANGE (200): 交换阶段 - 发送请求
  - PROCESS (300): 处理阶段 - 处理响应
  - ALIGN (400): 对齐阶段 - 后处理

#### 2. HttpExecutor
- 核心执行器，接收 RequestContext
- 处理 domain 配置
- 从 HttpActionRegistrar 获取处理器
- 执行管道并返回结果

#### 3. HttpClient
- 简单的 HTTP API
- 内部构建 RequestContext
- 支持所有 HTTP 方法（GET、POST、PUT、PATCH、DELETE）
- 支持上传和下载

#### 4. StreamClient
- 流式 HTTP API（SSE、AI 流式接口）
- 基于 RequestContextBuilder 构建上下文
- 通过 HttpExecutor 执行 prepare 管道后，直接消费 ReadableStream
- 使用 Async Generator 模式，支持 `for await` 消费
- 独立 AbortController 用于流式取消
- 便捷方法：`post<T>()`、`get<T>()`

#### 5. Token 管理
- TokenInjector 处理器：自动注入 token
- DomainConfig.token：存储 token
- DomainConfig.authInjector：配置注入方式
- DomainRegistrar.updateToken()：批量更新 token

#### 5. HttpFactory
- 高级功能工厂类
- `createRetryTask`: 创建带重试的请求
- `createPolling`: 创建轮询任务

## 处理器管道

### 默认处理器

#### PREPARE 阶段
- **TokenInjector** (offset: 5): Token 注入
- **CommonParamsEnricher** (offset: 10): 合并公共参数
- **UrlBuilder** (offset: 20): 构建完整 URL

#### EXCHANGE 阶段
- **FetchTransport** (offset: 10): Fetch API 传输
- **XhrTransport** (offset: 20): XHR 传输（用于上传/下载）

#### PROCESS 阶段
- **ResponseAnalyzer** (offset: 10): 分析响应
- **DataParser** (offset: 20): 解析数据

#### ALIGN 阶段
- **DownloadInterceptor** (offset: 10): 下载拦截器

## 依赖

```typescript
dependencies: {
  '@qimenjs/context': 'L0',
  '@qimenjs/pipeline': 'L1',
  '@qimenjs/registry': 'L1',
  '@qimenjs/logger': 'L0',
  '@qimenjs/utils': 'L0'
}
```

## 使用示例

### 基本使用

```typescript
import { HttpClient } from '@qimenjs/http';

const client = new HttpClient('api');

// GET 请求
const result = await client.get('/users').context;

// POST 请求
const result = await client.post('/users', { name: 'test' }).context;

// 带选项的请求
const result = await client.get('/users', {
    headers: { 'Authorization': 'Bearer token' },
    queryParams: { page: 1, size: 10 },
    timeout: 5000,
}).context;
```

### 使用 HttpExecutor

```typescript
import { HttpExecutor } from '@qimenjs/http';
import { RequestContextBuilder } from '@qimenjs/context';

const executor = new HttpExecutor();

const context = RequestContextBuilder
    .create()
    .withDomain('api')
    .withUrl('/users')
    .withMethod('GET')
    .build();

const result = await executor.execute(context);
```

### 使用 HttpFactory

```typescript
import { HttpFactory } from '@qimenjs/http';

// 带重试的请求
const task = HttpFactory.createRetryTask(
    'GET',
    '/api/data',
    {
        retry: {
            maxRetries: 3,
            delay: 1000,
            shouldRetry: (context) => context.response?.status === 503
        }
    }
);

const result = await task.context;

// 轮询任务
const stop = HttpFactory.createPolling(
    'GET',
    '/api/realtime-data',
    { interval: 3000 },
    'default',
    (context) => {
        console.log('收到数据:', context.response.data);
    }
);

// 停止轮询
stop();
```

### 使用 StreamClient

```typescript
import { StreamClient } from '@qimenjs/http';

const client = new StreamClient('api');

// AI 流式对话
const task = client.post<ChatMessage>('/chat/completions', {
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello' }],
});

// for await 消费流
for await (const chunk of task.stream) {
    console.log('收到:', chunk);
}

// 取消流式请求
task.cancel('user stopped');
```

## 测试状态

### 已完成的测试
- ✅ HttpActionRegistrar (12 个测试)
- ✅ HttpExecutor (8 个测试)
- ✅ HttpClient (11 个测试)
- ✅ types (9 个测试)
- ✅ TokenInjector (7 个测试)
- **总计**: 47 个测试通过

### 测试覆盖率
- HttpActionRegistrar: 75.51%
- HttpClient: 100%
- HttpExecutor: 90.62%
- Actions: 部分覆盖

## RequestContext 字段映射

所有处理器使用统一的 RequestContext 字段：

| 用途 | 字段路径 | 说明 |
|------|---------|------|
| 请求 URL | `context.request.url` | 完整的请求 URL |
| 请求方法 | `context.request.method` | HTTP 方法 |
| 请求头 | `context.request.headers` | 请求头对象 |
| 请求体 | `context.request.body` | 请求体数据 |
| 查询参数 | `context.request.queryParams` | URL 查询参数 |
| 控制器 | `context.request.controller` | AbortController |
| 响应状态 | `context.response.status` | HTTP 状态码 |
| 响应数据 | `context.response.data` | 解析后的数据 |
| 响应头 | `context.response.headers` | 响应头对象 |
| 原始响应 | `context.response.rawResponse` | 原始响应对象 |
| 错误 | `context.error` | 错误信息 |
| 元数据 | `context.metadata` | 额外的元数据 |

## 已解决的问题

### 问题 1：架构重构
- **原因**: 需要分离 HTTP 和数据处理
- **解决方案**: 创建独立的 HttpActionRegistrar
- **状态**: ✅ 已完成

### 问题 2：字段引用错误
- **原因**: 使用了不存在的 `context.http` 字段
- **解决方案**: 统一使用 `context.request` 和 `context.response`
- **状态**: ✅ 已完成

### 问题 3：类型系统问题
- **原因**: HttpActionRegistrar 继承 RegistrarBase 的类型问题
- **解决方案**: 正确实现所有抽象方法
- **状态**: ✅ 已完成

## 扩展指南

### 添加自定义处理器

```typescript
import { HttpActionRegistrar, HttpActionCategory } from '@qimenjs/http';

const registrar = HttpActionRegistrar.getInstance();

registrar.register({
    name: 'CustomHandler',
    category: HttpActionCategory.PREPARE,
    offset: 15, // 在 CommonParamsEnricher 之后，UrlBuilder 之前
    handler: async (context) => {
        // 自定义处理逻辑
        context.request.headers['X-Custom'] = 'value';
    },
    description: '自定义处理器',
});
```

### 自定义 domain 配置

```typescript
import { Registry } from '@qimenjs/registry';

Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    timeout: 30000,
    commonParams: {
        appId: 'my-app',
    },
    commonBody: {
        version: '1.0',
    },
});
```

### Token 管理

```typescript
import { Registry } from '@qimenjs/http';

// 配置 domain（使用默认 bearer token）
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    // authInjector 默认是 'bearer'
});

// 登录后更新 token
const loginResult = await login(username, password);
Registry.domain.updateToken(loginResult.token, 'api');

// 多域共享 token
Registry.domain.updateToken(token, 'api-a', 'api-b', 'api-c');

// 自定义注入方式
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    authInjector: (context) => {
        const token = context.metadata.domainConfig.token;
        context.request.headers['X-Token'] = token;
    },
});
```

## 变更历史

### 2026-06-29
- ✅ 删除废弃的 `HttpContextBuilder.ts`（已被 `RequestContextBuilder` 替代）
- ✅ 重写 `StreamClient.ts`：基于当前架构（RequestContextBuilder + HttpExecutor + ReadableStream）
- ✅ 修复 `types/http.ts` 导入：`@qimenjs/tasks` → `@qimenjs/task`
- ✅ 清理 46 个旧编译产物（.js/.d.ts/.map）
- ✅ 编译错误从 10 个降到 0 个

## 下一步计划

- [ ] 添加更多集成测试
- [ ] 提高测试覆盖率到 90%+
- [ ] 添加 WebSocket 支持
- [ ] 添加请求缓存功能
