# @orbit-js/data-processor

**层级**: 第 2 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过  
**覆盖率**: 100%

## 概述

数据处理管道包，提供统一的数据处理管道系统，通过关键字路由不同的处理逻辑。

## 功能

- **DataProcessorRegistrar** - 数据处理注册器，管理所有数据处理管道
- **DataProcessorExecutor** - 数据处理执行器，执行管道并跟踪过程
- **DataProcessorWeight** - 权重阶段枚举，定义管道执行顺序
- **错误类** - 完整的错误处理机制

## 权重阶段

执行顺序（按权重升序）：
1. **PREPARATION (0)** - 准备阶段：参数初始化、默认值设置
2. **TRANSFORM (1000)** - 转换阶段：参数转换、格式化
3. **VALIDATION (2000)** - 验证阶段：参数校验
4. **ENRICHMENT (3000)** - 增强阶段：注入额外信息（Header、Token）
5. **EXCHANGE (4000)** - 交换阶段：HTTP 传输（仅前道）
6. **EXTRACT (5000)** - 提取阶段：数据提取、解析（仅后道）
7. **ALIGN (6000)** - 对齐阶段：数据对齐、转换
8. **ERROR (7000)** - 错误阶段：错误处理
9. **FINALIZE (8000)** - 结算阶段：最终处理、清理

## 依赖

- `@orbit-js/registry` - 注册器基类
- `@orbit-js/pipeline` - 管道执行器
- `@orbit-js/context` - 请求上下文

## 使用示例

```typescript
import { DataProcessor, DataProcessorWeight } from '@orbit-js/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    offset: 10,
    tags: ['abp', 'pre'],
    description: 'ABP 分页参数转换',
    handle: async (ctx) => {
        // 处理逻辑
    }
});

// 获取管道（通过 tags 过滤）
const pipeline = DataProcessor.getPipeline('abp', 'pre');

// 执行管道
const executor = new DataProcessorExecutor();
await executor.execute(context, pipeline);
```

## API

### DataProcessorRegistrar

```typescript
class DataProcessorRegistrar extends RegistrarBase {
    // 注册处理器
    register(handler: DataProcessorHandler): void;
    
    // 批量注册
    registerAll(handlers: DataProcessorHandler[]): void;
    
    // 获取管道（已排序）
    getPipeline(preset: DataProcessorKey, phase?: 'pre' | 'post'): DataProcessorHandler[];
    
    // 移除处理器
    unregister(handlerName: string): void;
    
    // 获取处理器
    get(handlerName: string): DataProcessorHandler[] | undefined;
    
    // 检查存在
    has(handlerName: string): boolean;
    
    // 清空所有
    clear(): void;
}
```

### DataProcessorExecutor

```typescript
class DataProcessorExecutor {
    // 执行管道
    async execute(
        context: RequestContext, 
        handlers: DataProcessorHandler[],
        phase?: 'pre' | 'post'
    ): Promise<ExecutionResult>;
}
```

### DataProcessorHandler

```typescript
interface DataProcessorHandler {
    name: string;
    handle: (context: RequestContext) => Promise<void>;
    weight?: number;
    offset?: number;
    tags?: DataProcessorTag[];
    shouldExecute?: (context: RequestContext) => boolean;
    description?: string;
    category?: string;
}
```

## 测试状态

- ✅ 3 个测试文件
- ✅ 40 个测试用例
- ✅ 100% 核心功能覆盖

## 变更历史

### 2026-06-26
- 编写完整的单元测试
- 40 个测试用例全部通过
- 完整覆盖所有核心功能

### 初始版本
- 实现 DataProcessorRegistrar
- 实现 DataProcessorExecutor
- 实现权重系统
- 实现错误类
