# HTTP 管道与平台适配

> QimenJS 的 HTTP 系统采用**管道模式**，通过 weight+offset 排序的中间件链处理请求/响应。数据处理器（DataProcessor）通过 `preset` 标签过滤，实现同一套前端代码对接不同后端平台。

## 概述

HTTP 管道解决的核心问题：

- **可扩展**：通过注册 action 中间件扩展请求/响应处理
- **多平台**：ABP/Spring 等不同后端框架的请求/响应格式差异，通过数据处理器自动适配
- **统一编排**：HttpClient → HttpExecutor → Pipeline → DataProcessor，一条链路覆盖全流程

## HttpClient

HttpClient 是用户侧的简化入口，职责单一：

```typescript
const client = new HttpClient('api');  // 使用已注册的域名
const result = await client.get('/users').context;
```

**核心流程**：

```
request(method, url, options)
  → RequestContextBuilder.build(method, url, options)  // 构建 RequestContext
  → HttpExecutor.createTask(context)                    // 创建异步任务
  → { context: Promise<RequestContext>, cancel: Function }
```

## HTTP 管道

### 四阶段架构

| 阶段 | 枚举值 | 基准权重 | 职责 |
|------|--------|---------|------|
| PREPARE | 100 | 请求准备 | CommonParamsEnricher(10)、TokenInjector(15)、UrlBuilder(20) |
| EXCHANGE | 200 | 网络交换 | FetchTransport(10)、XhrTransport(20) |
| PROCESS | 300 | 响应处理 | ResponseAnalyzer(10)、DataParser(20) |
| ALIGN | 400 | 后处理对齐 | DownloadInterceptor(10) |

**排序算法**：`最终权重 = category + offset`，升序排列。例如 TokenInjector 的最终权重为 100+15=115。

### 默认注册的 Action

| Action | 阶段 | offset | 作用 |
|--------|------|--------|------|
| CommonParamsEnricher | PREPARE | 10 | 注入公共参数（从 DomainConfig.commonParams/commonBody） |
| TokenInjector | PREPARE | 15 | 注入认证信息（bearer/basic/自定义） |
| UrlBuilder | PREPARE | 20 | 拼接完整 URL（baseUrl + path + query） |
| FetchTransport | EXCHANGE | 10 | 使用 fetch API 发送请求 |
| XhrTransport | EXCHANGE | 20 | 使用 XMLHttpRequest 发送请求 |
| ResponseAnalyzer | PROCESS | 10 | 分析响应状态码 |
| DataParser | PROCESS | 20 | 解析响应数据 |
| DownloadInterceptor | ALIGN | 10 | 下载拦截处理 |

### HttpActionRegistrar

注册器管理所有 HTTP action，有缓存机制：

```typescript
// 注册自定义 action
HttpActionRegistrar.getInstance().register({
    name: 'my-interceptor',
    category: HttpActionCategory.PREPARE,
    offset: 12,  // 在 TokenInjector(15) 之前执行
    execute: async (ctx) => { /* ... */ },
});
```

## 通用 Pipeline 执行器

HTTP、验证、数据处理器共用同一个 `Pipeline` 执行引擎：

```
Pipeline.execute(context, processors, options)
  → sortProcessors()         // weight + offset 升序
  → for each processor:
      → isTerminated()       // 熔断检查（context.metadata.terminate === true）
      → processor.execute()  // 执行处理器
      → 记录 ExecutionStep   // 跟踪每步耗时、状态
  → updateStats()            // 更新统计
  → return PipelineResult
```

**关键特性**：
- **熔断机制**：处理器可设置 `context.metadata.terminate = true` 终止后续执行
- **breakOnError**：HTTP 管道默认 `true`（出错中断），验证管道默认 `false`（收集所有错误）
- **执行跟踪**：每步记录 processor/weight/offset/action/duration/reason/error

## 数据处理器（DataProcessor）

### 架构

```
DataProcessorRegistrar (extends RegistrarBase)
  → storage: DataProcessorHandler[]
  → getPipeline(preset, phase) → tags 双重过滤
  → DataProcessorExecutor → Pipeline.execute()
```

### Tags 过滤机制

每个处理器有 `tags` 数组（如 `['abp', 'pre']`），`getPipeline(preset, phase)` 通过 tags 双重过滤：

```typescript
const matchesPreset = tags.includes(preset);  // 如 'abp'
const matchesPhase = phase ? tags.includes(phase) : true;  // 如 'pre'
return matchesPreset && matchesPhase;
```

`'any'` 标签是通配符，匹配所有场景。

### DataProcessorExecutor

封装 Pipeline，额外支持 `shouldExecute` 条件执行：

```typescript
if (handler.shouldExecute && !handler.shouldExecute(ctx)) return; // 跳过
await handler.handle(ctx);
```

### ABP 适配

**前道管道（pre）** - 请求发送前：

| 处理器 | 权重 | 职责 |
|--------|------|------|
| abp-pagination | TRANSFORM | `page/pageSize` → `skipCount/maxResultCount`，`keyword` → `filter`，`sortBy/sortOrder` → `sorting` |
| abp-tenant-header | ENRICHMENT | 注入 `__tenant` 请求头（条件执行：`options.tenantId` 存在时） |

**后道管道（post）** - 响应返回后：

| 处理器 | 权重 | 职责 |
|--------|------|------|
| abp-extract | EXTRACT | PagedResultDto 解包（`items + totalCount`），数组直接作为 list，单对象作为 item |
| abp-audit-clean | ALIGN+10 | 移除审计字段（creationTime/creatorId/lastModificationTime 等） |
| abp-soft-delete-filter | ALIGN+20 | 过滤 `isDeleted=true` 的记录 |
| abp-error | ERROR | ABP RemoteServiceErrorResponse 转换，validationErrors → fieldErrors 映射 |

### Spring 适配

结构与 ABP 完全对称，tags 使用 `'spring'` 而非 `'abp'`。

### 自定义平台适配

```typescript
// 1. 定义前道处理器
const myPagination: DataProcessorHandler = {
    name: 'my-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    tags: ['my-platform', 'pre'],
    handle: async (ctx) => {
        ctx.request.params.start = ctx.request.params.page * ctx.request.params.size;
        delete ctx.request.params.page;
    },
};

// 2. 定义后道处理器
const myExtract: DataProcessorHandler = {
    name: 'my-extract',
    weight: DataProcessorWeight.EXTRACT,
    tags: ['my-platform', 'post'],
    handle: async (ctx) => {
        ctx.response.data = ctx.response.data.records;
    },
};

// 3. 注册
DataProcessorRegistrar.getInstance().register(myPagination);
DataProcessorRegistrar.getInstance().register(myExtract);

// 4. 域配置使用自定义 preset
Registry.domain.register('api', { baseUrl: '...', preset: 'my-platform', ... });
```

## preset 与 DomainRegistrar 的联动

```
DomainRegistrar.register('main', { preset: 'abp', ... })
    ↓
CoreEntityManager.getDomainConfig()
    ↓
CoreEntityManager.getDataProcessorPreset() → domainConfig.preset
    ↓
DataProcessorRegistrar.getPipeline('abp', 'pre')
    ↓
DataProcessorExecutor.execute(context, handlers, 'pre')
```

**核心价值**：同一套前端代码，只需切换 `preset` 即可适配不同后端平台。

## 完整请求链路

```
Component → EntityAction → ComponentEntityDispatch.dispatch()
  → EntityEventBus.emit(action)
  → CoreEntityManager.request(action, options)
    → requirePermission(action)          // 权限检查
    → buildRequestContext(action)        // 构建 RequestContext
    → executeDataProcessor('pre', ctx)   // 前道数据处理器（如 ABP 分页转换）
    → HttpExecutor.execute(ctx)          // HTTP 管道执行
      → Pipeline.execute(ctx, actions)
        → PREPARE: CommonParams → Token → UrlBuilder
        → EXCHANGE: FetchTransport
        → PROCESS: ResponseAnalyzer → DataParser
        → ALIGN: DownloadInterceptor
    → executeDataProcessor('post', ctx)  // 后道数据处理器（如 ABP 数据提取）
  → EntityEventBus.emit(success/error)  // 结果事件
  → ComponentEntityDispatch → onEntityActionSuccess / onEntityError
```

## 参见

- [注册表系统](./registry-system.md)
- [实体管理与权限系统](./entity-and-permission.md)
- [验证管道与 Schema](./validation-pipeline.md)