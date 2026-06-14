# 数据处理注册表优化说明

## 一、参照 validation 的优化

### 1.1 核心改进

| 特性 | 原设计 | 新设计（参照 validation） |
|------|--------|--------------------------|
| **权重系统** | 单一权重 | 权重 + 偏移量 ✅ |
| **过滤机制** | 关键字匹配 | Tags 过滤 ✅ |
| **复用方式** | 处理器工厂 | Tags 复用 ✅ |
| **执行跟踪** | 基础跟踪 | 详细跟踪 ✅ |
| **排序算法** | 权重降序 | 权重 + 偏移量升序 ✅ |

---

## 二、权重阶段定义

### 2.1 阶段划分

```typescript
export enum DataProcessorWeight {
    PREPARATION = 0,      // 准备阶段
    TRANSFORM = 1000,     // 转换阶段
    VALIDATION = 2000,    // 验证阶段
    ENRICHMENT = 3000,    // 增强阶段
    EXCHANGE = 4000,      // 交换阶段
    EXTRACT = 5000,       // 提取阶段
    ALIGN = 6000,         // 对齐阶段
    ERROR = 7000,         // 错误阶段
    FINALIZE = 8000,      // 结算阶段
}
```

### 2.2 执行顺序

```
前道管道：
PREPARATION (0) → TRANSFORM (1000) → VALIDATION (2000) → ENRICHMENT (3000)

后道管道：
EXTRACT (5000) → ALIGN (6000) → ERROR (7000) → FINALIZE (8000)
```

---

## 三、Tags 过滤机制

### 3.1 Tags 定义

```typescript
export type DataProcessorTag = 
    | 'abp'      // ABP 后端
    | 'spring'   // Spring 后端
    | 'nestjs'   // NestJS 后端
    | 'pre'      // 前道管道
    | 'post'     // 后道管道
    | 'any'      // 通配符
    | string;    // 自定义标签
```

### 3.2 过滤逻辑

```typescript
// 在 getPipeline() 中
const filtered = allHandlers.filter(handler => {
    const tags = handler.tags || ['any'];
    
    // 通配符匹配
    if (tags.includes('any')) {
        return true;
    }
    
    // 预设匹配
    const matchesPreset = tags.includes(preset);
    
    // 阶段匹配
    const matchesPhase = phase ? tags.includes(phase) : true;
    
    return matchesPreset && matchesPhase;
});
```

### 3.3 复用示例

```typescript
// 一次定义，多处复用
DataProcessor.register({
    name: 'date-format',
    weight: DataProcessorWeight.ALIGN,
    offset: 10,
    tags: ['abp', 'spring', 'post'],  // ABP 和 Spring 的后道管道都使用
    handle: async (ctx) => {
        // 日期格式化逻辑
    }
});

// 获取 ABP 后道管道时，会自动包含该处理器
const abpPostPipeline = DataProcessor.getPipeline('abp', 'post');

// 获取 Spring 后道管道时，也会自动包含该处理器
const springPostPipeline = DataProcessor.getPipeline('spring', 'post');
```

---

## 四、排序算法

### 4.1 算法说明

```typescript
// 按 weight + offset 升序排序（权重小的先执行）
const sorted = filtered.sort((a, b) => {
    const weightA = (a.weight ?? 100) + (a.offset ?? 0);
    const weightB = (b.weight ?? 100) + (b.offset ?? 0);
    return weightA - weightB;
});
```

### 4.2 排序示例

| 处理器 | Weight | Offset | 总权重 | 执行顺序 |
|--------|--------|--------|--------|---------|
| preparation | 0 | 0 | 0 | 1 |
| transform | 1000 | 10 | 1010 | 2 |
| validation | 2000 | 0 | 2000 | 3 |
| enrichment | 3000 | 50 | 3050 | 4 |

---

## 五、执行跟踪

### 5.1 跟踪信息

```typescript
interface ProcessorExecutionStep {
    name: string;           // 处理器名称
    duration: number;       // 执行耗时
    status: string;         // 执行状态
    error?: any;            // 错误信息
    weight?: number;        // 权重
    offset?: number;        // 偏移量
    reason?: string;        // 跳过原因
}
```

### 5.2 跟踪示例

```typescript
// 执行管道
await DataProcessor.execute('abp', context, 'pre');

// 查看执行步骤
console.log(context.steps);
// [
//   { name: 'preparation', weight: 0, offset: 0, duration: 1.2, status: 'success' },
//   { name: 'transform', weight: 1000, offset: 10, duration: 0.8, status: 'success' },
//   { name: 'validation', weight: 2000, offset: 0, duration: 2.1, status: 'success' },
//   { name: 'enrichment', weight: 3000, offset: 50, duration: 0.5, status: 'skipped', reason: 'Condition not met' }
// ]
```

---

## 六、完整使用示例

### 6.1 注册处理器

```typescript
import { DataProcessor, DataProcessorWeight } from '@/data-processor';

// ABP 分页参数转换
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

// ABP 租户 Header
DataProcessor.register({
    name: 'abp-tenant',
    weight: DataProcessorWeight.ENRICHMENT,
    offset: 10,
    tags: ['abp', 'pre'],
    description: 'ABP 租户 Header',
    handle: async (ctx) => {
        const tenantId = ctx.config.custom?.tenantId;
        if (tenantId) {
            ctx.http.headers['Abp-TenantId'] = tenantId;
        }
    }
});

// ABP 数据提取
DataProcessor.register({
    name: 'abp-extract',
    weight: DataProcessorWeight.EXTRACT,
    offset: 10,
    tags: ['abp', 'post'],
    description: 'ABP 数据提取',
    handle: async (ctx) => {
        const raw = ctx.data.raw;
        if (raw?.items && raw?.totalCount !== undefined) {
            ctx.data.list = raw.items;
            ctx.data.total = raw.totalCount;
        }
    }
});

// 日期格式化（复用）
DataProcessor.register({
    name: 'date-format',
    weight: DataProcessorWeight.ALIGN,
    offset: 10,
    tags: ['abp', 'spring', 'post'],  // ABP 和 Spring 都使用
    description: '日期格式化',
    handle: async (ctx) => {
        const transform = (item: any) => {
            if (item.creationTime) {
                item.creationTime = new Date(item.creationTime).toLocaleString();
            }
            return item;
        };
        
        if (ctx.data.list) {
            ctx.data.list = ctx.data.list.map(transform);
        }
    }
});
```

### 6.2 实体管理器集成

```typescript
// src/entity/manager/CoreEntityManager.ts

export abstract class CoreEntityManager extends ComposableBase {
    
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask {
        const context = createFlowContext(...);
        
        const execute = async (): Promise<RequestContext> => {
            try {
                const preset = context.config.preset;
                
                // 执行前道管道
                await DataProcessor.execute(preset, context, 'pre');
                
                // 执行 HTTP 管道
                await runPipeline(context, httpPipeline);
                
                // 执行后道管道
                await DataProcessor.execute(preset, context, 'post');
                
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

### 6.3 调试

```typescript
// 查看所有处理器
DataProcessor.inspect();

// 输出示例：
// 🔧 Data Processor Registry
// 
// 📦 PREPARATION (0):
// ┌─────────┬────────┬───────┬──────────┬──────────────┐
// │ (index) │  Name  │ Offset│  Total   │    Tags      │
// ├─────────┼────────┼───────┼──────────┼──────────────┤
// │    0    │ 'prep' │   0   │    0     │  'abp, pre'  │
// └─────────┴────────┴───────┴──────────┴──────────────┘
// 
// 📦 TRANSFORM (1000):
// ┌─────────┬─────────────────┬────────┬───────┬──────────────┐
// │ (index) │      Name       │ Offset │ Total │     Tags     │
// ├─────────┼─────────────────┼────────┼───────┼──────────────┤
// │    0    │ 'abp-pagination'│   10   │ 1010  │  'abp, pre'  │
// └─────────┴─────────────────┴────────┴───────┴──────────────┘
```

---

## 七、优势总结

### 7.1 与 validation 一致

| 特性 | 说明 |
|------|------|
| **权重系统** | 完全一致，支持阶段划分 |
| **排序算法** | weight + offset 升序 |
| **Tags 过滤** | 支持多标签、通配符 |
| **执行跟踪** | 详细的步骤记录 |
| **调试输出** | 按权重分组显示 |

### 7.2 核心优势

1. **清晰的阶段划分**
   - 9 个明确定义的阶段
   - 阶段内可通过 offset 微调

2. **灵活的复用机制**
   - Tags 支持多标签
   - 一次定义，多处使用
   - 通配符 'any' 支持全局复用

3. **精确的执行控制**
   - 权重 + 偏移量精确控制顺序
   - 条件执行支持
   - 熔断机制

4. **完善的跟踪调试**
   - 详细的执行步骤记录
   - 性能计时
   - 按权重分组显示

---

## 八、迁移指南

### 8.1 从旧版本迁移

```typescript
// 旧版本
DataProcessor.register('abp-post', {
    name: 'handler',
    weight: 100,
    handle: async (ctx) => { /* ... */ }
});

// 新版本
DataProcessor.register({
    name: 'handler',
    weight: DataProcessorWeight.ALIGN,
    offset: 0,
    tags: ['abp', 'post'],
    handle: async (ctx) => { /* ... */ }
});
```

### 8.2 主要变化

1. **注册方式**：从 `register(key, handler)` 改为 `register(handler)`
2. **权重系统**：从单一权重改为权重 + 偏移量
3. **过滤机制**：从关键字匹配改为 Tags 过滤
4. **执行方式**：从 `execute(key, context)` 改为 `execute(preset, context, phase)`

---

**优化完成！数据处理注册表现在与 validation 系统保持一致的设计模式。**
