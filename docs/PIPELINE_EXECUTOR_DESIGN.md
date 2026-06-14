# 管道执行器设计说明

## 一、为什么需要独立的管道执行器？

### 1.1 问题分析

**当前情况**：
- `kernel/pipeline/runner` - HTTP 管道执行器（简单）
- `validation/core/validate` - Validation 执行器（完整）
- `data-processor` - 数据处理注册表（无执行器）

**问题**：
1. 数据处理注册表只负责注册和获取管道，没有执行能力
2. 需要依赖外部的执行器（如 kernel/pipeline/runner）
3. 缺少统一的监控和调试能力

### 1.2 解决方案

**创建独立的管道执行器包** `src/pipeline`

**优势**：
- ✅ 职责分离 - 注册和执行分离
- ✅ 可复用 - 多个模块可共享
- ✅ 可监控 - 完整的监控和调试能力
- ✅ 可扩展 - 易于添加新功能

---

## 二、管道执行器设计

### 2.1 核心特性

| 特性 | 说明 |
|------|------|
| **权重排序** | weight + offset 升序排序 |
| **熔断机制** | 支持 terminate 熔断 |
| **执行跟踪** | 详细的步骤记录 |
| **性能计时** | 精确的耗时统计 |
| **统计信息** | 执行次数、成功率、平均耗时 |
| **调试报告** | 可视化执行报告 |

### 2.2 核心接口

```typescript
// 处理器接口
interface Processor<T = any> {
    name: string;
    execute: (context: T) => Promise<void>;
    weight?: number;
    offset?: number;
    description?: string;
}

// 执行步骤
interface ExecutionStep {
    processor: string;
    weight?: number;
    offset?: number;
    action: 'executed' | 'skipped' | 'terminated';
    duration?: number;
    reason?: string;
    error?: any;
}

// 执行结果
interface PipelineResult<T = any> {
    context: T;
    steps: ExecutionStep[];
    isSuccess: boolean;
    totalDuration: number;
    error?: any;
}
```

### 2.3 执行流程

```
1. 排序处理器（weight + offset 升序）
   ↓
2. 串行执行处理器
   ↓
3. 熔断检查（terminate）
   ↓
4. 执行并计时
   ↓
5. 记录执行步骤
   ↓
6. 更新统计信息
   ↓
7. 返回执行结果
```

---

## 三、使用示例

### 3.1 基础使用

```typescript
import { Pipeline } from '@/pipeline';

// 创建执行器
const executor = new Pipeline();

// 定义处理器
const processors = [
    {
        name: 'step1',
        weight: 100,
        execute: async (ctx) => {
            ctx.value += 1;
        }
    },
    {
        name: 'step2',
        weight: 200,
        execute: async (ctx) => {
            ctx.value *= 2;
        }
    }
];

// 执行管道
const context = { value: 10 };
const result = await executor.execute(context, processors);

console.log(result.context.value);  // 22
console.log(result.isSuccess);      // true
console.log(result.steps);          // 执行步骤
```

### 3.2 启用跟踪和计时

```typescript
const result = await executor.execute(context, processors, {
    enableTracking: true,   // 启用执行跟踪
    enableTiming: true,     // 启用性能计时
    breakOnError: true,     // 错误时中断
});

// 查看执行报告
executor.printReport(result);
```

### 3.3 查看统计信息

```typescript
// 获取统计
const stats = executor.getStats();

console.log(stats.totalExecutions);   // 总执行次数
console.log(stats.successCount);      // 成功次数
console.log(stats.failureCount);      // 失败次数
console.log(stats.averageDuration);   // 平均耗时
console.log(stats.maxDuration);       // 最大耗时
console.log(stats.minDuration);       // 最小耗时
```

### 3.4 熔断机制

```typescript
const processors = [
    {
        name: 'check',
        weight: 100,
        execute: async (ctx) => {
            if (ctx.value < 0) {
                ctx.terminate = true;  // 熔断
            }
        }
    },
    {
        name: 'process',
        weight: 200,
        execute: async (ctx) => {
            // 如果前面熔断了，这里不会执行
            ctx.value *= 2;
        }
    }
];
```

---

## 四、集成到数据处理注册表

### 4.1 集成方式

```typescript
// src/data-processor/DataProcessorRegistrar.ts

import { Pipeline } from '../../pipeline';

export class DataProcessorRegistrar extends RegistrarBase {
    
    async execute(
        preset: DataProcessorKey, 
        context: RequestContext, 
        phase?: 'pre' | 'post'
    ): Promise<void> {
        const pipeline = this.getPipeline(preset, phase);
        
        // 使用管道执行器
        const executor = new Pipeline();
        
        // 转换处理器格式
        const processors = pipeline.map(handler => ({
            name: handler.name,
            weight: handler.weight,
            offset: handler.offset,
            execute: async (ctx: RequestContext) => {
                if (handler.shouldExecute && !handler.shouldExecute(ctx)) {
                    return;
                }
                await handler.handle(ctx);
            }
        }));
        
        // 执行管道
        const result = await executor.execute(context, processors, {
            enableTracking: true,
            enableTiming: true,
            breakOnError: true,
        });
        
        // 将执行步骤复制到上下文
        result.steps.forEach(step => {
            context.steps.push({ ... });
        });
        
        if (!result.isSuccess && result.error) {
            throw new ProcessorExecutionError('pipeline', result.error);
        }
    }
}
```

### 4.2 使用示例

```typescript
import { DataProcessor } from '@/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    offset: 10,
    tags: ['abp', 'pre'],
    handle: async (ctx) => {
        // 处理逻辑
    }
});

// 执行管道（自动使用管道执行器）
await DataProcessor.execute('abp', context, 'pre');

// 查看执行步骤
console.log(context.steps);
```

---

## 五、与 validation 的一致性

### 5.1 对比

| 特性 | Validation | Pipeline |
|------|-----------|----------|
| **权重排序** | ✅ weight + offset | ✅ weight + offset |
| **熔断机制** | ✅ terminate | ✅ terminate |
| **执行跟踪** | ✅ steps | ✅ steps |
| **性能计时** | ✅ performance.now() | ✅ performance.now() |
| **统计信息** | ❌ 无 | ✅ 有 |
| **调试报告** | ❌ 无 | ✅ printReport() |

### 5.2 优势

Pipeline 执行器比 validation 更完善：
- ✅ 提供统计信息
- ✅ 提供可视化报告
- ✅ 支持自定义日志
- ✅ 可配置执行选项

---

## 六、目录结构

```
src/pipeline/
├── types.ts          # 类型定义
├── executor.ts       # 管道执行器
└── index.ts          # 入口文件
```

---

## 七、未来扩展

### 7.1 可能的扩展

1. **并行执行** - 支持处理器并行执行
2. **超时控制** - 处理器执行超时
3. **重试机制** - 处理器失败重试
4. **条件分支** - 根据条件选择执行路径
5. **插件系统** - 支持插件扩展

### 7.2 扩展示例

```typescript
// 并行执行
const result = await executor.execute(context, processors, {
    mode: 'parallel',  // 并行模式
    timeout: 5000,     // 超时 5 秒
    retry: 3,          // 重试 3 次
});
```

---

## 八、总结

### 核心优势

1. **职责清晰** - 注册和执行分离
2. **可复用** - 多模块共享
3. **可监控** - 完整的监控能力
4. **可调试** - 可视化报告
5. **可扩展** - 易于添加新功能

### 使用场景

- ✅ 数据处理管道执行
- ✅ HTTP 管道执行（可替代 kernel/pipeline/runner）
- ✅ Validation 管道执行（可替代 validation/core/validate）
- ✅ 任何需要管道处理的场景

---

**管道执行器已完成！提供可监控、可调试的管道执行能力。**
