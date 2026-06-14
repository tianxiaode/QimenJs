# 单一职责原则重构说明

## 一、问题分析

### 原设计的问题

```typescript
DataProcessorRegistrar {
    register()      ✅ 注册职责
    getPipeline()   ✅ 获取管道职责
    execute()       ❌ 执行职责（违反单一职责）
}
```

**问题**：
1. **违反单一职责原则** - 注册表不应该负责执行
2. **循环依赖风险** - `data-processor → pipeline → data-processor`
3. **职责混乱** - 注册表应该只管理注册，不负责执行

---

## 二、重构方案

### 2.1 职责分离

```
DataProcessorRegistrar (注册表)
├── register()         ✅ 注册处理器
├── getPipeline()      ✅ 获取管道列表
└── unregister()       ✅ 注销处理器

DataProcessorExecutor (执行器)
├── execute()          ✅ 执行管道
├── getStats()         ✅ 获取统计
└── printReport()      ✅ 打印报告
```

### 2.2 依赖关系

```
pipeline (独立包)
    ↓
data-processor/executor (数据处理执行器)
    ↓
data-processor/registrar (数据处理注册表)
```

**无循环依赖** ✅

---

## 三、使用方式

### 3.1 注册处理器

```typescript
import { DataProcessor, DataProcessorWeight } from '@/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    offset: 10,
    tags: ['abp', 'pre'],
    description: 'ABP 分页参数转换',
    handle: async (ctx) => {
        const params = ctx.http.queryParams;
        if (params?.page !== undefined && params?.size !== undefined) {
            params.skipCount = params.page * params.size;
            params.maxResultCount = params.size;
            delete params.page;
            delete params.size;
        }
    }
});
```

### 3.2 获取管道

```typescript
import { DataProcessor } from '@/data-processor';

// 获取 ABP 前导管道
const prePipeline = DataProcessor.getPipeline('abp', 'pre');

// 获取 ABP 后道管道
const postPipeline = DataProcessor.getPipeline('abp', 'post');
```

### 3.3 执行管道

```typescript
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

// 获取管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');

// 执行管道
await dataProcessorExecutor.execute(context, pipeline);
```

### 3.4 完整示例

```typescript
import { 
    DataProcessor, 
    dataProcessorExecutor,
    DataProcessorWeight 
} from '@/data-processor';

// 1. 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    tags: ['abp', 'pre'],
    handle: async (ctx) => { /* ... */ }
});

DataProcessor.register({
    name: 'abp-extract',
    weight: DataProcessorWeight.EXTRACT,
    tags: ['abp', 'post'],
    handle: async (ctx) => { /* ... */ }
});

// 2. 在实体管理器中使用
class UserManager extends BaseEntityManager {
    async getList() {
        const context = createFlowContext(...);
        
        // 获取管道
        const prePipeline = DataProcessor.getPipeline('abp', 'pre');
        const postPipeline = DataProcessor.getPipeline('abp', 'post');
        
        // 执行前道管道
        await dataProcessorExecutor.execute(context, prePipeline);
        
        // 执行 HTTP 管道
        await runHttpPipeline(context);
        
        // 执行后道管道
        await dataProcessorExecutor.execute(context, postPipeline);
        
        return context;
    }
}
```

---

## 四、实体管理器集成

### 4.1 集成方式

```typescript
// src/entity/manager/CoreEntityManager.ts

import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

export abstract class CoreEntityManager extends ComposableBase {
    
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask {
        const context = createFlowContext(...);
        
        const execute = async (): Promise<RequestContext> => {
            try {
                const preset = context.config.preset;
                
                // 获取管道
                const prePipeline = DataProcessor.getPipeline(preset, 'pre');
                const postPipeline = DataProcessor.getPipeline(preset, 'post');
                
                // 执行前道管道
                await dataProcessorExecutor.execute(context, prePipeline);
                
                // 执行 HTTP 管道
                await runHttpPipeline(context);
                
                // 执行后道管道
                await dataProcessorExecutor.execute(context, postPipeline);
                
            } catch (error) {
                context.error = error;
                context.metadata.hasError = true;
            }
            
            return context;
        };
        
        return { context: execute(), cancel: ... };
    }
}
```

---

## 五、调试和监控

### 5.1 查看执行报告

```typescript
import { dataProcessorExecutor } from '@/data-processor';

// 执行管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');
await dataProcessorExecutor.execute(context, pipeline);

// 打印执行报告
dataProcessorExecutor.printReport(context);
```

**输出示例**：
```
📊 Data Processor Execution Report

✅ Success: 3
❌ Error: 0
⏭️  Skipped: 1
⏱️  Total Duration: 5.23ms

📋 Execution Steps:
┌─────────┬──────────────────┬────────┬────────┬─────────┬──────────┬────────┐
│ (index) │     Processor    │ Weight │ Offset │  Status │ Duration │ Reason │
├─────────┼──────────────────┼────────┼────────┼─────────┼──────────┼────────┤
│    0    │ 'abp-pagination' │  1000  │   10   │ 'success'│ '1.20ms' │  '-'   │
│    1    │  'abp-tenant'    │  3000  │   10   │ 'success'│ '0.50ms' │  '-'   │
│    2    │ 'custom-header'  │  3000  │   20   │ 'skipped'│ '0.00ms' │ '...'  │
│    3    │  'validation'    │  2000  │   0    │ 'success'│ '3.53ms' │  '-'   │
└─────────┴──────────────────┴────────┴────────┴─────────┴──────────┴────────┘
```

### 5.2 查看统计信息

```typescript
// 获取统计
const stats = dataProcessorExecutor.getStats();

console.log(stats.totalExecutions);   // 总执行次数
console.log(stats.successCount);      // 成功次数
console.log(stats.failureCount);      // 失败次数
console.log(stats.averageDuration);   // 平均耗时
```

---

## 六、优势总结

### 6.1 设计优势

| 维度 | 原设计 | 新设计 |
|------|--------|--------|
| **单一职责** | ❌ 注册表包含执行 | ✅ 注册和执行分离 |
| **循环依赖** | ❌ 可能循环依赖 | ✅ 无循环依赖 |
| **可测试性** | ⚠️ 需要模拟注册表 | ✅ 可独立测试 |
| **可扩展性** | ⚠️ 受限于注册表 | ✅ 易于扩展 |

### 6.2 核心优势

1. **职责清晰**
   - 注册表：只负责注册和获取
   - 执行器：只负责执行

2. **无循环依赖**
   - pipeline 独立
   - data-processor/executor 依赖 pipeline
   - data-processor/registrar 无依赖

3. **易于测试**
   - 注册表可独立测试
   - 执行器可独立测试

4. **易于扩展**
   - 新增执行器不影响注册表
   - 新增注册方式不影响执行器

---

## 七、API 参考

### DataProcessorRegistrar (注册表)

| 方法 | 说明 |
|------|------|
| `register(handler)` | 注册处理器 |
| `registerAll(handlers)` | 批量注册 |
| `getPipeline(preset, phase)` | 获取管道列表 |
| `unregister(name)` | 注销处理器 |
| `get(name)` | 获取处理器 |
| `has(name)` | 检查是否存在 |
| `clear()` | 清空所有 |
| `inspect()` | 调试输出 |

### DataProcessorExecutor (执行器)

| 方法 | 说明 |
|------|------|
| `execute(context, handlers)` | 执行管道 |
| `getStats()` | 获取统计信息 |
| `resetStats()` | 重置统计 |
| `printReport(context)` | 打印执行报告 |

---

## 八、迁移指南

### 8.1 从旧版本迁移

```typescript
// 旧版本（注册表包含执行）
await DataProcessor.execute('abp', context, 'pre');

// 新版本（注册和执行分离）
const pipeline = DataProcessor.getPipeline('abp', 'pre');
await dataProcessorExecutor.execute(context, pipeline);
```

### 8.2 便捷封装（可选）

如果觉得两步操作繁琐，可以封装：

```typescript
// src/data-processor/helpers.ts

import { DataProcessor, dataProcessorExecutor } from './index';

/**
 * 便捷执行方法
 */
export async function executePipeline(
    preset: string,
    context: RequestContext,
    phase?: 'pre' | 'post'
): Promise<void> {
    const pipeline = DataProcessor.getPipeline(preset, phase);
    await dataProcessorExecutor.execute(context, pipeline);
}

// 使用
import { executePipeline } from '@/data-processor';

await executePipeline('abp', context, 'pre');
```

---

**重构完成！遵循单一职责原则，注册和执行分离，无循环依赖。**
