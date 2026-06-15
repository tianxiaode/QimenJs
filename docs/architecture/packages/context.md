# @orbitjs/context

**层级**: 第 0 层  
**状态**: ✅ 完成  
**测试**: ⚠️ 待写  
**覆盖率**: -

## 概述

请求上下文包，提供贯穿整个请求生命周期的上下文对象。

## 功能

- **RequestContext** - 请求上下文定义
- **RequestContextBuilder** - 上下文构建器
- **ExecutionStep** - 执行步骤记录

## 依赖

```typescript
dependencies: {}  // 零依赖
```

## 目录结构

```
src/context/
├── types/
│   ├── request-context.ts   # RequestContext 定义
│   └── index.ts
├── RequestContextBuilder.ts # 构建器
└── index.ts                 # 入口
```

## 使用示例

### 创建上下文

```typescript
import { RequestContextBuilder } from '@orbitjs/context';

const context = RequestContextBuilder
    .create()
    .withIdentity({ domain: 'user', entityName: 'User', action: 'list' })
    .withParams({ page: 1, size: 10 })
    .withRequest({
        url: '/api/users',
        method: 'GET'
    })
    .build();
```

### 使用上下文

```typescript
// 数据前导处理
const preProcessor = DataProcessor.getPipeline('user', 'pre');
await dataProcessorExecutor.execute(context, preProcessor);

// HTTP 请求
const httpPipeline = HttpPipeline.getPipeline('user');
await httpExecutor.execute(context, httpPipeline);

// 数据后导处理
const postProcessor = DataProcessor.getPipeline('user', 'post');
await dataProcessorExecutor.execute(context, postProcessor);

// 返回结果
return context.data.list;
```

## API

### RequestContext

```typescript
interface RequestContext {
    // 标识信息
    identity: {
        domain: string;
        entityName?: string;
        action?: string;
    };
    
    // 请求信息
    request: { /* ... */ };
    
    // 响应信息
    response: { /* ... */ };
    
    // 数据载体
    data: {
        params: any;
        source: any;
        parsed: any;
        raw: any | null;
        list: any[];
        item: any;
        total: number;
        pagination?: PaginationInfo;
    };
    
    // 状态与控制
    isAborted: boolean;
    error: any | null;
    steps: ExecutionStep[];
    
    // 元数据
    metadata: Record<string, any>;
    
    // Schema
    schema?: any;
    
    // 方法
    alignToFrontend(target: any): any;
}
```

### RequestContextBuilder

```typescript
class RequestContextBuilder {
    static create(): RequestContextBuilder;
    
    withIdentity(identity: Partial<RequestContext['identity']>): this;
    withDomain(domain: string): this;
    withEntityName(entityName: string): this;
    withAction(action: string): this;
    
    withRequest(request: Partial<RequestContext['request']>): this;
    withUrl(url: string): this;
    withMethod(method: HttpMethod): this;
    withHeaders(headers: Record<string, string>): this;
    withBody(body: any): this;
    withQueryParams(queryParams: Record<string, any>): this;
    
    withResponse(response: Partial<RequestContext['response']>): this;
    withData(data: Partial<RequestContext['data']>): this;
    withParams(params: any): this;
    
    withError(error: any): this;
    withMetadata(key: string, value: any): this;
    withSchema(schema: any): this;
    
    abort(): this;
    addStep(step: ExecutionStep): this;
    withAlignToFrontend(alignToFrontend: (target: any) => any): this;
    
    build(): RequestContext;
    clone(): RequestContextBuilder;
}
```

## 测试状态

### 待写的测试
- [ ] RequestContextBuilder 基本功能
- [ ] RequestContextBuilder 链式调用
- [ ] RequestContextBuilder 克隆功能
- [ ] RequestContext 类型检查

## 已知问题

无

## 遗留工作

- [ ] 编写单元测试
- [ ] 提高测试覆盖率到 80%+
- [ ] 添加使用文档
- [ ] 添加更多示例

## 设计决策

- [2026-06-15-context-package](../../design-decisions/2026-06-15-context-package.md) - Context 包设计

## 变更历史

### 2026-06-15
- 创建独立的 context 包
- 实现 RequestContext 完整定义
- 实现 RequestContextBuilder
- 更新 data-processor 导入路径
