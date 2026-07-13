# @qimenjs/context

**层级**: 第 0 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: ~89%

## 概述

上下文包，提供基础上下文、请求上下文、事件上下文等类型定义和构建器。
支持管道执行、验证、HTTP 请求、数据处理、UI 事件等场景。

## 功能

### 基础上下文
- **BaseContext** - 基础执行上下文接口
- **ExecutionStep** - 统一的执行步骤类型
- **工具函数** - createBaseContext, addStep, setError, setTerminate 等

### 请求上下文
- **RequestContext** - 请求上下文定义
- **RequestContextBuilder** - 上下文构建器

### 事件上下文
- **EventContext** - 事件上下文定义（UI 事件 + 数据事件统一）
- **EventContextBuilder** - 事件上下文构建器
- **EventType** - 预定义事件类型枚举

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
│   ├── event-context.ts      # EventContext 定义
│   ├── event-types.ts        # EventType 枚举 + 预定义 data 结构
│   └── index.ts
├── RequestContextBuilder.ts  # 请求上下文构建器
├── EventContextBuilder.ts    # 事件上下文构建器
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

EventContext extends BaseContext
├── event                       // 完整事件名（eventKey:type 格式，如 userTable:selectionChange）
├── type                        // 事件类型（"发生了什么"）
├── source                      // 来源标识（"谁触发的"）
├── sourceType                  // 来源类型（Grid/EntityManager/Button）
├── data                        // 业务数据（只放结构化原始数据，引用计数归零后自动清理）
├── domEvent?                   // 原始 DOM 事件（引用计数归零后自动置空）
├── chain?                      // 事件链路（只存原始值摘要，框架自动构建）
└── _refCount?                  // 引用计数（框架内部使用）
```

### EventContext 生命周期

```
emitUI('selectionChange', data)
  └── ComponentBase.emitUI() 内部：
      ├── 构建 EventContext（自动填充 source/chain 等）
      ├── 深拷贝 data（脱离原始引用）
      ├── this.emit(event, ctx)
      │   └── EventBus.emit() 内部：
      │       ├── ctx._refCount = handlers.size
      │       ├── handler1(ctx) → 返回 Promise? → 等待完成 → _refCount--
      │       ├── handler2(ctx) → 同步完成 → _refCount--
      │       └── _refCount === 0 → cleanup(ctx)
      └── 返回
```

cleanup 时：
- 置空 `domEvent`（释放 DOM 引用）
- 清理 `data`（对象属性替换为空对象，断开引用链）
- 清理 `metadata`（同上）
- 保留 `chain`/`event`/`type`/`source`/`sourceType`（原始值，调试用）

### data 设计原则

- ✅ 放：基本类型（string/number/boolean）、纯数据对象、数组
- ❌ 不放：EventContext 引用、组件实例引用、DOM 节点、函数、闭包
- handler 不应修改 ctx.data（所有 handler 共享同一个 EventContext）

## 使用示例

### 创建基础上下文

```typescript
import { createBaseContext, addStep, setError } from '@qimenjs/context';

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
import { RequestContextBuilder } from '@qimenjs/context';

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

### EventContext

```typescript
interface EventContext extends BaseContext {
    /** 完整事件名（eventKey:type 格式），用于 EventBus 路由和 bridges.on 匹配 */
    event: string;
    /** 事件类型，"发生了什么"（如 "selectionChange"、"dataChange"、"click"） */
    type: string;
    /** 事件来源标识，标识"谁触发的" */
    source: string;
    /** 来源类型（如 "Grid"、"EntityManager"、"Button"） */
    sourceType: string;
    /** 业务数据（只放结构化原始数据，不放对象引用） */
    data: any;
    /** 原始 DOM 事件（引用计数归零后自动置空） */
    domEvent?: Event;
    /** 事件链路（只存原始值摘要，框架自动构建，无需释放） */
    chain?: EventChainLink[];
    /** 引用计数（框架内部使用，开发者不需要操作） */
    _refCount?: number;
}
```

### EventChainLink

```typescript
interface EventChainLink {
    event: string;
    type: string;
    source: string;
    sourceType: string;
}
```

### EventContextBuilder

```typescript
class EventContextBuilder {
    static create(): EventContextBuilder;
    withEvent(event: string): EventContextBuilder;
    withType(type: string): EventContextBuilder;
    withSource(source: string): EventContextBuilder;
    withSourceType(sourceType: string): EventContextBuilder;
    withData(data: any): EventContextBuilder;
    withDomEvent(domEvent: Event): EventContextBuilder;
    /** 追加事件链路（框架自动调用，开发者通常不需要手动设置） */
    withChain(chain: EventChainLink[]): EventContextBuilder;
    build(): EventContext;
}
```

### EventType

```typescript
enum EventType {
    Click = 'click',
    Change = 'change',
    Focus = 'focus',
    Blur = 'blur',
    SelectionChange = 'selectionChange',
    ValueChange = 'valueChange',
    DataChange = 'dataChange',
    PageChange = 'pageChange',
    SortChange = 'sortChange',
    Action = 'action',
    Mount = 'mount',
    Unmount = 'unmount',
    Dispose = 'dispose',
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

### 2026-07-06
- 新增 EventContext 事件上下文定义
- 新增 EventContextBuilder 构建器
- 新增 EventType 枚举和预定义 data 结构类型
- EventContext 统一 UI 事件和数据事件
- 新增 chain 字段支持事件链（只存原始值摘要，框架自动构建）
- 新增 EventChainLink 接口
- 新增 _refCount 引用计数（EventBus.emit 时设为 handler 数量，归零自动清理）
- 移除 parentEvent 引用方案（改为 chain 摘要数组，无需释放机制）
- data 设计原则：只放结构化原始数据，不放对象引用
- cleanup 机制：引用计数归零后清理 data/metadata/domEvent
- handler 不应修改 ctx.data（所有 handler 共享同一个 EventContext）
- IEventContext 和 EventContext 融合为统一接口，IEventContext 标记为 @deprecated
- EventContext 核心字段移除 readonly（Builder 需要赋值）
- EventBus.emit 增加预构建 EventContext 重载（emitUI 直接传入 Builder 构建的 ctx）
- EventAbility 扩展 UI 事件能力：emitUI/executeWithEventContext/_initEventKey/_unregisterEventKey
- eventKey 通过 eventScope getter 惰性初始化，dispose 时自动注销
- EventSourceRegistrar 校验 eventKey 全局唯一性

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
