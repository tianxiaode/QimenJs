# 统一管道执行器架构

## 一、设计理念

### 核心思想

**一个执行器，多处复用**

```
src/pipeline/ (顶级管道执行器)
├── executor.ts          # 核心执行器（内置监控、日志）
├── types.ts             # 类型定义和接口
└── index.ts             # 入口

使用方：
├── validation → 使用 pipeline 执行验证管道
├── http → 使用 pipeline 执行 HTTP 管道
└── data-processor → 使用 pipeline 执行数据处理管道
```

### 为什么需要统一执行器？

#### 问题：重复实现

```typescript
// ❌ 每个模块都重复实现
validation/executor.ts {
    execute() { /* 执行、监控、日志、统计 */ }
}

http/executor.ts {
    execute() { /* 执行、监控、日志、统计 */ }
}

data-processor/executor.ts {
    execute() { /* 执行、监控、日志、统计 */ }
}
```

#### 解决：统一实现

```typescript
// ✅ 统一的执行器
src/pipeline/executor.ts {
    execute() { /* 执行、监控、日志、统计 */ }
}

// 各模块只需简单封装
validation → 使用 pipeline
http → 使用 pipeline
data-processor → 使用 pipeline
```

---

## 二、核心接口

### 2.1 IPipelineExecutor

```typescript
/**
 * 管道执行器接口
 */
export interface IPipelineExecutor {
    /**
     * 执行管道
     */
    execute<T>(
        context: T, 
        processors: Processor<T>[], 
        options?: PipelineOptions
    ): Promise<PipelineResult<T>>;
    
    /**
     * 获取执行统计
     */
    getStats(): PipelineStats;
    
    /**
     * 重置统计
     */
    resetStats(): void;
    
    /**
     * 打印执行报告
     */
    printReport(result: PipelineResult): void;
}
```

### 2.2 IExecutableContext

```typescript
/**
 * 可执行上下文接口
 * 
 * @description 上下文对象应该实现此接口
 * 以支持管道执行和监控
 */
export interface IExecutableContext {
    /**
     * 执行步骤记录
     */
    steps: ExecutionStep[];
    
    /**
     * 错误信息
     */
    error?: any;
    
    /**
     * 元数据
     */
    metadata: {
        hasError?: boolean;
        terminate?: boolean;
        [key: string]: any;
    };
}
```

### 2.3 Processor

```typescript
/**
 * 处理器接口
 */
export interface Processor<T = any> {
    /**
     * 处理器名称
     */
    name: string;
    
    /**
     * 处理函数
     */
    execute: (context: T) => Promise<void>;
    
    /**
     * 权重
     */
    weight?: number;
    
    /**
     * 偏移量
     */
    offset?: number;
    
    /**
     * 描述
     */
    description?: string;
}
```

---

## 三、核心功能

### 3.1 执行流程

```
execute(context, processors, options)
    ↓
1. 排序处理器（weight + offset 升序）
    ↓
2. 串行执行
    ├─ 熔断检查
    ├─ 执行处理器
    ├─ 记录步骤
    └─ 错误处理
    ↓
3. 更新统计
    ↓
4. 返回结果
```

### 3.2 内置功能

| 功能 | 说明 |
|------|------|
| **权重排序** | 按 weight + offset 升序排序 |
| **熔断机制** | 支持 terminate 标志中断执行 |
| **执行跟踪** | 记录每个处理器的执行状态 |
| **性能计时** | 记录每个处理器的执行耗时 |
| **统计信息** | 总次数、成功/失败次数、平均耗时等 |
| **日志记录** | 使用统一的 logger 模块 |
| **错误处理** | 统一的错误捕获和处理 |

---

## 四、使用示例

### 4.1 基础使用

```typescript
import { Pipeline } from '@/pipeline';

// 创建执行器
const executor = new Pipeline();

// 定义处理器
const processors = [
    {
        name: 'validate',
        weight: 100,
        execute: async (ctx) => { /* ... */ }
    },
    {
        name: 'transform',
        weight: 200,
        execute: async (ctx) => { /* ... */ }
    }
];

// 执行管道
const result = await executor.execute(context, processors, {
    enableTracking: true,
    enableTiming: true,
    pipelineName: 'MyPipeline',
});

// 打印报告
executor.printReport(result);
```

### 4.2 数据处理模块使用

```typescript
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

// 获取管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');

// 执行管道
const result = await dataProcessorExecutor.execute(context, pipeline, 'pre');

// 打印报告
dataProcessorExecutor.printReport(result);
```

### 4.3 验证模块使用

```typescript
import { Validation, validationExecutor } from '@/validation';

// 获取验证管道
const pipeline = Validation.getPipeline('user');

// 执行验证
const result = await validationExecutor.execute(context, pipeline);

// 打印报告
validationExecutor.printReport(result);
```

### 4.4 HTTP 模块使用

```typescript
import { HttpPipeline, httpExecutor } from '@/http';

// 获取 HTTP 管道
const pipeline = HttpPipeline.getPipeline();

// 执行 HTTP 请求
const result = await httpExecutor.execute(context, pipeline);

// 打印报告
httpExecutor.printReport(result);
```

---

## 五、执行报告

### 5.1 控制台输出

```
📊 Pipeline Execution Report

✅ Status: Success
⏱️  Total Duration: 5.23ms
📝 Steps: 4

📋 Execution Steps:
┌─────────┬──────────────────┬────────┬────────┬──────────┬──────────┬────────┐
│ (index) │     Processor    │ Weight │ Offset │  Action  │ Duration │ Reason │
├─────────┼──────────────────┼────────┼────────┼──────────┼──────────┼────────┤
│    0    │ 'validate'       │  100   │   0    │ 'executed'│ '1.20ms' │  '-'   │
│    1    │ 'transform'      │  200   │   0    │ 'executed'│ '0.50ms' │  '-'   │
│    2    │ 'enrich'         │  300   │   0    │ 'skipped' │ '0.00ms' │ '...'  │
│    3    │ 'finalize'       │  400   │   0    │ 'executed'│ '3.53ms' │  '-'   │
└─────────┴──────────────────┴────────┴────────┴──────────┴──────────┴────────┘
```

### 5.2 统计信息

```typescript
const stats = executor.getStats();

console.log(stats.totalExecutions);   // 总执行次数
console.log(stats.successCount);      // 成功次数
console.log(stats.failureCount);      // 失败次数
console.log(stats.averageDuration);   // 平均耗时
console.log(stats.maxDuration);       // 最大耗时
console.log(stats.minDuration);       // 最小耗时
```

---

## 六、架构优势

### 6.1 对比分析

| 维度 | 分散实现 | 统一执行器 |
|------|----------|------------|
| **代码重复** | ❌ 每个模块重复实现 | ✅ 统一实现 |
| **监控能力** | ⚠️ 各模块不一致 | ✅ 统一监控 |
| **日志格式** | ⚠️ 各模块不一致 | ✅ 统一格式 |
| **调试体验** | ⚠️ 各模块不同 | ✅ 统一体验 |
| **维护成本** | ❌ 多处维护 | ✅ 单点维护 |
| **扩展性** | ⚠️ 需要逐个修改 | ✅ 一次修改全局生效 |

### 6.2 核心优势

1. **避免重复**
   - 监控、日志、统计等功能只实现一次
   - 各模块只需简单封装

2. **统一体验**
   - 所有管道执行都有相同的监控和日志
   - 调试体验一致

3. **易于维护**
   - 修改一处，全局生效
   - 降低维护成本

4. **易于扩展**
   - 新增功能只需在 pipeline 中实现
   - 所有模块自动获得新功能

5. **类型安全**
   - 统一的接口定义
   - 完整的类型支持

---

## 七、集成现有模块

### 7.1 Logger 集成

```typescript
import { Logger } from '../../logger';

export class Pipeline implements IPipelineExecutor {
    private logger = Logger.for(Pipeline);
    
    async execute(...) {
        this.logger.debug(`[${pipelineName}] Execution started`);
        // ...
        this.logger.debug(`[${pipelineName}] Processor "${name}" executed`);
        // ...
        this.logger.error(`[${pipelineName}] Execution failed:`, err);
    }
}
```

### 7.2 Error 集成

```typescript
import { OrbitError } from '../../error';

// 统一的错误处理
if (!result.isSuccess && result.error) {
    throw new OrbitError('Pipeline execution failed', {
        cause: result.error,
        context: { steps: result.steps }
    });
}
```

---

## 八、最佳实践

### 8.1 上下文设计

```typescript
// ✅ 实现 IExecutableContext 接口
interface MyContext extends IExecutableContext {
    // 业务数据
    data: any;
    
    // 执行步骤（来自接口）
    steps: ExecutionStep[];
    
    // 错误信息（来自接口）
    error?: any;
    
    // 元数据（来自接口）
    metadata: {
        hasError?: boolean;
        terminate?: boolean;
        [key: string]: any;
    };
}
```

### 8.2 处理器设计

```typescript
// ✅ 使用权重和偏移量
const processor = {
    name: 'my-processor',
    weight: DataProcessorWeight.TRANSFORM,  // 1000
    offset: 10,  // 微调顺序
    description: '数据转换处理器',
    execute: async (ctx) => {
        // 业务逻辑
    }
};
```

### 8.3 熔断机制

```typescript
// ✅ 使用熔断标志
const processor = {
    name: 'critical-validator',
    execute: async (ctx) => {
        if (!validate(ctx.data)) {
            // 设置熔断标志
            ctx.metadata.terminate = true;
            ctx.error = new Error('Validation failed');
            return;
        }
    }
};
```

---

## 九、未来扩展

### 9.1 可能的扩展点

1. **并行执行**
   ```typescript
   execute(context, processors, { parallel: true });
   ```

2. **超时控制**
   ```typescript
   execute(context, processors, { timeout: 5000 });
   ```

3. **重试机制**
   ```typescript
   execute(context, processors, { retry: 3 });
   ```

4. **性能分析**
   ```typescript
   const profile = executor.getProfile();
   ```

5. **可视化**
   ```typescript
   executor.visualize(result);  // 生成执行流程图
   ```

---

**统一管道执行器，一次实现，处处复用！**
