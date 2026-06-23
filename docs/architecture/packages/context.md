# @orbitjs/context

**层级**: 第 0 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: ~89%

## 概述

上下文包，提供基础上下文、请求上下文等类型定义和构建器。
支持管道执行、验证、HTTP 请求、数据处理等场景。

## 功能

### 基础上下文
- **BaseContext** - 基础执行上下文接口
- **ExecutionStep** - 统一的执行步骤类型
- **工具函数** - createBaseContext, addStep, setError, setTerminate 等

### 请求上下文
- **RequestContext** - 请求上下文定义
- **RequestContextBuilder** - 上下文构建器

## 依赖

```typescript
dependencies: {}  // 零依赖
```

## 目录结构

```
src/context/
├── base/
│   ├── ExecutionStep.ts      # 执行步骤类型
│   ├── BaseContext.ts        # 基础上下文接口
│   └── index.ts
├── types/
│   ├── request-context.ts    # RequestContext 定义
│   └── index.ts
├── RequestContextBuilder.ts  # 构建器
└── index.ts                  # 入口
```

## 架构设计

### 上下文派生层次

```
BaseContext (基础执行上下文)
├── steps: ExecutionStep[]      // 执行步骤
├── error?: any                 // 错误信息
└── metadata: BaseMetadata      // 元数据

ValidationContext extends BaseContext
├── value, rawValue             // 数据双轨制
├── rule                        // 验证规则
├── errors                      // 错误列表
└── status                      // 状态信息

RequestContext extends BaseContext
├── identity                    // 标识信息
├── request                     // 请求信息
├── response                    // 响应信息
├── data                        // 数据载体
└── isAborted                   // 中止标志
```

## 使用示例

### 创建基础上下文

```typescript
import { createBaseContext, addStep, setError } from '@orbitjs/context';

const context = createBaseContext({
    metadata: { custom: 'value' },
});

addStep(context, {
    processor: 'MyProcessor',
    action: 'executed',
    duration: 0.5,
});

setError(context, new Error('Something went wrong'));
```

### 创建请求上下文

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

### BaseContext

```typescript
interface BaseContext {
    steps: ExecutionStep[];
    error?: any;
    metadata: BaseMetadata;
}
```

### ExecutionStep

```typescript
interface ExecutionStep {
    processor: string;
    weight?: number;
    offset?: number;
    action: 'executed' | 'skipped' | 'terminated';
    duration?: number;
    reason?: string;
    error?: any;
}
```

### RequestContext

```typescript
interface RequestContext extends BaseContext {
    identity: { /* ... */ };
    request: { /* ... */ };
    response: { /* ... */ };
    data: { /* ... */ };
    isAborted: boolean;
}
```

## 测试状态

### 已完成的测试
- [x] BaseContext 基本功能 (100% 覆盖率)
- [x] ExecutionStep 类型检查
- [x] Pipeline Executor 功能 (95.5% 覆盖率)
- [x] RequestContextBuilder 基本功能 (75.86% 覆盖率)

### 测试覆盖率
- BaseContext: 100%
- Pipeline Executor: 95.5%
- RequestContextBuilder: 75.86%
- 总体: ~89%

## 已知问题

无

## 遗留工作

- [x] 编写单元测试
- [x] 提高测试覆盖率到 80%+
- [ ] 添加使用文档
- [ ] 添加更多示例

## 设计决策

- [2026-06-15-context-package](../../design-decisions/2026-06-15-context-package.md) - Context 包设计
- [2026-06-17-context-refactoring](../../design-decisions/2026-06-17-context-refactoring.md) - 上下文派生架构重构

## 变更历史

### 2026-06-17
- 创建基础上下文 (BaseContext)
- 统一 ExecutionStep 类型定义
- ValidationContext 继承 BaseContext
- Pipeline 使用 BaseContext
- 更新架构文档

### 2026-06-15
- 创建独立的 context 包
- 实现 RequestContext 完整定义
- 实现 RequestContextBuilder
- 更新 data-processor 导入路径
