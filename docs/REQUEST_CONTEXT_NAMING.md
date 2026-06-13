# RequestContext 命名说明

## 重命名原因

`FlowContext` 这个名字不够直观，无法一眼看出其用途。

## 新名称：RequestContext

**RequestContext** 更能体现其本质：
- 贯穿整个请求生命周期
- 包含请求、响应、数据处理等所有信息
- 一看就知道是请求相关的上下文

## 兼容性

为了保持向后兼容，我们提供了别名：

```typescript
/**
 * 兼容性别名（保持向后兼容）
 * @deprecated 请使用 RequestContext
 */
export type FlowContext = RequestContext;
```

## 使用方式

### 推荐方式（新代码）

```typescript
import { RequestContext } from '@/types';

// 或
import { RequestContext } from '@/kernel/types';

function handler(ctx: RequestContext) {
    // ...
}
```

### 兼容方式（旧代码）

```typescript
import { FlowContext } from '@/types';

// 或
import { FlowContext } from '@/kernel/types';

function handler(ctx: FlowContext) {
    // ...
}
```

## 迁移建议

1. **新代码**：直接使用 `RequestContext`
2. **旧代码**：可以继续使用 `FlowContext`（会有 deprecation 警告）
3. **逐步迁移**：在方便时将 `FlowContext` 替换为 `RequestContext`

## RequestContext 包含的内容

```typescript
interface RequestContext {
    // 标识信息
    readonly domain: string;          // 域名称
    readonly entityName?: string;     // 实体名称
    readonly action?: ENTITY_ACTION;  // 动作类型
    
    // 配置信息
    config: DomainConfig;             // 域配置
    
    // 数据载体
    params: any;                      // 请求参数
    error: any | null;                // 错误信息
    data: { ... };                    // 数据容器
    
    // HTTP 信息
    http: { ... };                    // HTTP 相关信息
    
    // 元数据
    metadata: { ... };                // 增强元数据
    
    // 执行轨迹
    steps: ExecutionStep[];           // 执行步骤记录
}
```

## 为什么选择 RequestContext

1. **直观性**：一看就知道是请求相关的上下文
2. **准确性**：确实贯穿整个请求生命周期
3. **一致性**：与 `RequestTask`、`EntityRequestTask` 命名风格一致
4. **语义清晰**：避免了 "Flow" 这个抽象概念

## 其他候选名称

| 名称 | 优点 | 缺点 |
|------|------|------|
| **RequestContext** ✅ | 直观、准确 | - |
| DataContext | 强调数据 | 不够具体 |
| ProcessorContext | 强调处理 | 有点抽象 |
| PipelineContext | 强调管道 | 可能与 HTTP 管道混淆 |
| EntityContext | 强调实体 | 可能误以为只是实体相关 |

最终选择 **RequestContext**，因为它最直观、最准确。
