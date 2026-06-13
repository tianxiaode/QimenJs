# 数据处理管道简化方案

> **文档版本**: v2.0  
> **创建日期**: 2026-06-13  
> **状态**: 简化方案  
> **核心思想**: 统一注册器 + 关键字路由

---

## 一、核心设计

### 1.1 设计理念

**参考 HTTP 管道的模式**：
- HTTP 管道通过 `EntityActionRegistrar` 注册处理器
- 通过 `getPipeline()` 获取管道列表
- 处理器按权重排序执行

**数据处理管道采用相同模式**：
- 通过 `DataProcessorRegistrar` 注册处理器
- 通过关键字（如 'abp'、'spring'）获取管道列表
- 支持前导/后道管道分离

### 1.2 架构图

```
┌─────────────────────────────────────────────────────────────┐
│  实体管理器 (EntityManager)                                  │
│  - 调用数据处理管道                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  DataProcessorRegistrar (统一注册器)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  关键字路由                                            │  │
│  │  - 'abp'        → ABP 标准管道                         │  │
│  │  - 'abp-pre'    → ABP 前导管道                         │  │
│  │  - 'abp-post'   → ABP 后道管道                         │  │
│  │  - 'spring'     → Spring 标准管道                      │  │
│  │  - 'custom'     → 自定义管道                           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  管道执行                                              │  │
│  │  1. 获取管道列表                                        │  │
│  │  2. 按权重排序                                          │  │
│  │  3. 串行执行                                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  HTTP 管道 (HttpPipeline)                                   │
│  - 传输、解析、错误处理                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、核心实现

### 2.1 数据处理注册器

```typescript
// packages/data-processor/src/DataProcessorRegistrar.ts

import { RegistrarBase } from '@orbitjs/core';
import { FlowContext, DataProcessorHandler } from './types';

/**
 * 数据处理注册器
 * 统一管理所有数据处理管道，通过关键字路由
 * 
 * 使用方式：
 * - register('abp', handler) - 注册 ABP 处理器
 * - register('abp-pre', handler) - 注册 ABP 前导处理器
 * - getPipeline('abp') - 获取 ABP 完整管道
 * - getPipeline('abp-pre') - 获取 ABP 前导管道
 */
export class DataProcessorRegistrar extends RegistrarBase<Map<string, DataProcessorHandler[]>> {
    public readonly name = 'data-processor';
    protected storage = new Map<string, DataProcessorHandler[]>();
    
    // 缓存：关键字 → 排序后的管道
    private pipelineCache = new Map<string, DataProcessorHandler[]>();
    
    /**
     * 注册处理器
     * 
     * @param key 关键字，如 'abp'、'abp-pre'、'spring-post'
     * @param handler 处理器
     * 
     * @example
     * // 注册 ABP 前导处理器
     * DataProcessor.register('abp-pre', {
     *     name: 'abp-pagination',
     *     weight: 100,
     *     handle: async (ctx) => { /* ... *\/ }
     * });
     * 
     * // 注册 ABP 后道处理器
     * DataProcessor.register('abp-post', {
     *     name: 'abp-extract',
     *     weight: 100,
     *     handle: async (ctx) => { /* ... *\/ }
     * });
     */
    register(key: string, handler: DataProcessorHandler): void {
        this.checkLock();
        
        if (!this.storage.has(key)) {
            this.storage.set(key, []);
        }
        
        this.storage.get(key)!.push(handler);
        this.pipelineCache.delete(key); // 清除缓存
    }
    
    /**
     * 批量注册
     */
    registerAll(key: string, handlers: DataProcessorHandler[]): void {
        this.checkLock();
        
        if (!this.storage.has(key)) {
            this.storage.set(key, []);
        }
        
        this.storage.get(key)!.push(...handlers);
        this.pipelineCache.delete(key);
    }
    
    /**
     * 获取管道列表（已排序）
     * 
     * @param key 关键字
     * @returns 排序后的处理器列表
     * 
     * @example
     * // 获取 ABP 前导管道
     * const prePipeline = DataProcessor.getPipeline('abp-pre');
     * 
     * // 获取 ABP 后道管道
     * const postPipeline = DataProcessor.getPipeline('abp-post');
     */
    getPipeline(key: string): DataProcessorHandler[] {
        // 检查缓存
        if (this.pipelineCache.has(key)) {
            return this.pipelineCache.get(key)!;
        }
        
        const handlers = this.storage.get(key) || [];
        
        // 按权重降序排序
        const sorted = [...handlers].sort((a, b) => {
            return (b.weight ?? 100) - (a.weight ?? 100);
        });
        
        // 缓存
        this.pipelineCache.set(key, sorted);
        
        return sorted;
    }
    
    /**
     * 执行管道
     * 
     * @param key 关键字
     * @param context 流上下文
     * 
     * @example
     * // 执行 ABP 前导管道
     * await DataProcessor.execute('abp-pre', context);
     * 
     * // 执行 ABP 后道管道
     * await DataProcessor.execute('abp-post', context);
     */
    async execute(key: string, context: FlowContext): Promise<void> {
        const pipeline = this.getPipeline(key);
        
        for (const handler of pipeline) {
            // Guard Clause: 条件判断
            if (handler.shouldExecute && !handler.shouldExecute(context)) {
                continue;
            }
            
            const startTime = Date.now();
            try {
                await handler.handle(context);
                
                context.steps.push({
                    name: handler.name,
                    duration: Date.now() - startTime,
                    status: 'success',
                });
            } catch (error) {
                context.error = error;
                context.metadata.hasError = true;
                context.steps.push({
                    name: handler.name,
                    duration: Date.now() - startTime,
                    status: 'error',
                });
                break;
            }
        }
    }
    
    /**
     * 移除处理器
     */
    unregister(key: string, handlerName?: string): void {
        this.checkLock();
        
        if (handlerName) {
            // 移除特定处理器
            const handlers = this.storage.get(key);
            if (handlers) {
                const index = handlers.findIndex(h => h.name === handlerName);
                if (index !== -1) {
                    handlers.splice(index, 1);
                    this.pipelineCache.delete(key);
                }
            }
        } else {
            // 移除整个管道
            this.storage.delete(key);
            this.pipelineCache.delete(key);
        }
    }
    
    /**
     * 调试输出
     */
    protected doInspect(): void {
        console.group('🔧 Data Processor Registry');
        
        // 按关键字分组
        const groups = new Map<string, string[]>();
        
        this.storage.forEach((handlers, key) => {
            const baseKey = key.replace(/-pre$|-post$/, '');
            if (!groups.has(baseKey)) {
                groups.set(baseKey, []);
            }
            groups.get(baseKey)!.push(key);
        });
        
        groups.forEach((keys, baseKey) => {
            console.log(`\n📦 ${baseKey}:`);
            keys.forEach(key => {
                const handlers = this.getPipeline(key);
                console.log(`  ${key} (${handlers.length} handlers)`);
                handlers.forEach(h => {
                    console.log(`    - ${h.name} (weight: ${h.weight ?? 100})`);
                });
            });
        });
        
        console.groupEnd();
    }
    
    static getInstance(): DataProcessorRegistrar {
        return super.getInstance();
    }
}

// 便捷访问
export const DataProcessor = DataProcessorRegistrar.getInstance();
```

### 2.2 处理器类型定义

```typescript
// packages/data-processor/src/types.ts

import { FlowContext } from '@orbitjs/core';

/**
 * 数据处理器
 */
export interface DataProcessorHandler {
    /**
     * 处理器名称
     */
    name: string;
    
    /**
     * 处理函数
     */
    handle: (context: FlowContext) => Promise<void>;
    
    /**
     * 权重（数字越大优先级越高）
     * @default 100
     */
    weight?: number;
    
    /**
     * 条件执行
     */
    shouldExecute?: (context: FlowContext) => boolean;
    
    /**
     * 描述
     */
    description?: string;
}

/**
 * 关键字类型
 */
export type DataProcessorKey = 
    | 'abp'           // ABP 完整管道
    | 'abp-pre'       // ABP 前导管道
    | 'abp-post'      // ABP 后道管道
    | 'spring'        // Spring 完整管道
    | 'spring-pre'    // Spring 前导管道
    | 'spring-post'   // Spring 后道管道
    | string;         // 自定义关键字
```

---

## 三、使用示例

### 3.1 注册 ABP 管道

```typescript
// packages/data-processor-abp/src/index.ts

import { DataProcessor } from '@orbitjs/data-processor';

/**
 * ABP 前导管道
 */
const abpPreHandlers = [
    {
        name: 'abp-pagination',
        weight: 100,
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
    },
    {
        name: 'abp-tenant-header',
        weight: 90,
        description: 'ABP 租户 Header',
        handle: async (ctx) => {
            const tenantId = ctx.config.custom?.tenantId;
            if (tenantId) {
                ctx.http.headers['Abp-TenantId'] = tenantId;
            }
        }
    }
];

/**
 * ABP 后道管道
 */
const abpPostHandlers = [
    {
        name: 'abp-extract',
        weight: 100,
        description: 'ABP 数据提取',
        handle: async (ctx) => {
            const raw = ctx.data.raw;
            
            // PagedResultDto<T>
            if (raw?.items && raw?.totalCount !== undefined) {
                ctx.data.list = raw.items;
                ctx.data.total = raw.totalCount;
            }
            // EntityDto<T>
            else if (raw?.id) {
                ctx.data.item = raw;
            }
        }
    },
    {
        name: 'abp-error',
        weight: 90,
        description: 'ABP 错误处理',
        handle: async (ctx) => {
            const raw = ctx.data.raw;
            
            if (raw?.error) {
                ctx.error = {
                    code: raw.error.code,
                    message: raw.error.message,
                    details: raw.error.details,
                };
                ctx.metadata.hasError = true;
            }
        }
    }
];

/**
 * 注册 ABP 管道
 */
export function registerAbpPipeline(): void {
    // 注册前导管道
    DataProcessor.registerAll('abp-pre', abpPreHandlers);
    
    // 注册后道管道
    DataProcessor.registerAll('abp-post', abpPostHandlers);
}

export default registerAbpPipeline;
```

### 3.2 注册 Spring 管道

```typescript
// packages/data-processor-spring/src/index.ts

import { DataProcessor } from '@orbitjs/data-processor';

const springPreHandlers = [
    {
        name: 'spring-pagination',
        weight: 100,
        handle: async (ctx) => {
            // Spring 分页参数已经是 page/size，无需转换
        }
    }
];

const springPostHandlers = [
    {
        name: 'spring-extract',
        weight: 100,
        handle: async (ctx) => {
            const raw = ctx.data.raw;
            
            // Result<T>
            if (raw?.code !== undefined && raw?.data !== undefined) {
                if (raw.code !== 200 && raw.code !== 0) {
                    ctx.error = { code: raw.code, message: raw.message };
                    ctx.metadata.hasError = true;
                    return;
                }
                
                // Page<T>
                if (raw.data?.content) {
                    ctx.data.list = raw.data.content;
                    ctx.data.total = raw.data.totalElements;
                } else {
                    ctx.data.item = raw.data;
                }
            }
            // Page<T> 直接返回
            else if (raw?.content && raw?.totalElements !== undefined) {
                ctx.data.list = raw.content;
                ctx.data.total = raw.totalElements;
            }
        }
    }
];

export function registerSpringPipeline(): void {
    DataProcessor.registerAll('spring-pre', springPreHandlers);
    DataProcessor.registerAll('spring-post', springPostHandlers);
}

export default registerSpringPipeline;
```

### 3.3 实体管理器集成

```typescript
// src/entity/manager/CoreEntityManager.ts

import { DataProcessor } from '@orbitjs/data-processor';

export abstract class CoreEntityManager extends ComposableBase {
    
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask {
        const controller = new AbortController();
        this.activeTasks.set(action, controller);
        
        const context = createFlowContext(
            'GET',
            this.url,
            this.domain,
            this.getDomainConfig(),
            { ...options, signal: controller.signal },
            this.entityName,
            action,
            this.getScheme()
        );
        
        const execute = async (): Promise<FlowContext> => {
            try {
                // 1. 获取管道关键字
                const preset = context.config.preset;
                const preKey = `${preset}-pre`;
                const postKey = `${preset}-post`;
                
                // 2. 执行前导管道
                await DataProcessor.execute(preKey, context);
                
                // 3. 执行 HTTP 管道
                let allActions = this.getStatic<any[]>('__ACTION_PIPELINE__');
                if (!allActions) {
                    const baseActions = EntityActionRegistrar.getInstance().getPipeline();
                    allActions = [...baseActions, ...(this.customActions || [])];
                    this.setStatic('__ACTION_PIPELINE__', allActions);
                }
                
                await runPipeline(context, allActions);
                
                // 4. 执行后道管道
                await DataProcessor.execute(postKey, context);
                
                // 5. 触发事件
                if (!context.metadata.hasError) {
                    this.emit('success', { action, data: context.data });
                } else {
                    this.emit('error', { action, error: context.error });
                }
                
            } catch (error) {
                context.error = error;
                context.metadata.hasError = true;
            } finally {
                this.activeTasks.delete(action);
            }
            
            return context;
        };
        
        return {
            context: execute(),
            cancel: (reason?: string) => controller.abort(reason),
        };
    }
}
```

---

## 四、特殊场景处理

### 4.1 特殊域注册

```typescript
// 场景：某个域的数据结构完全不同

import { DataProcessor } from '@orbitjs/data-processor';

// 注册特殊域的前导管道
DataProcessor.registerAll('special-domain-pre', [
    {
        name: 'special-auth',
        weight: 100,
        handle: async (ctx) => {
            // 特殊认证逻辑
            ctx.http.headers['X-Special-Auth'] = 'xxx';
        }
    }
]);

// 注册特殊域的后道管道
DataProcessor.registerAll('special-domain-post', [
    {
        name: 'special-extract',
        weight: 100,
        handle: async (ctx) => {
            const raw = ctx.data.raw;
            
            // 特殊数据结构
            if (raw?.dataset) {
                ctx.data.list = raw.dataset.rows;
                ctx.data.total = raw.dataset.totalRows;
            }
        }
    }
]);

// 配置域
Registry.domain.register('special-api', {
    baseUrl: 'https://special.example.com',
    preset: 'special-domain', // 使用特殊关键字
    pageSize: 20,
    pagesizes: [10, 20, 50],
});
```

### 4.2 实体级别特殊处理

```typescript
// 场景：某个实体需要特殊处理

import { DataProcessor } from '@orbitjs/data-processor';

// 注册实体级别的管道
DataProcessor.registerAll('abp-user-post', [
    {
        name: 'user-avatar-transform',
        weight: 80,
        handle: async (ctx) => {
            // 用户头像 URL 补全
            if (ctx.data.list) {
                ctx.data.list = ctx.data.list.map(user => ({
                    ...user,
                    avatar: user.avatar 
                        ? `https://cdn.example.com${user.avatar}`
                        : '/default-avatar.png',
                }));
            }
        }
    }
]);

// 在实体管理器中使用
class UserManager extends BaseEntityManager {
    async getList() {
        const result = await this.request('list', { url: '/users' });
        
        // 执行实体级别的后道管道
        await DataProcessor.execute('abp-user-post', result);
        
        return result;
    }
}
```

### 4.3 动态插入处理器

```typescript
// 场景：运行时动态添加处理器

import { DataProcessor } from '@orbitjs/data-processor';

// 动态添加
DataProcessor.register('abp-post', {
    name: 'dynamic-logging',
    weight: 200, // 高优先级
    shouldExecute: (ctx) => {
        // 只在开发环境执行
        return process.env.NODE_ENV === 'development';
    },
    handle: async (ctx) => {
        console.log('[ABP] Response:', ctx.data.raw);
    }
});
```

---

## 五、通用管道集成

### 5.1 通用管道定义

```typescript
// packages/data-processor/src/common/index.ts

import { DataProcessor } from '../DataProcessorRegistrar';

/**
 * 通用管道定义
 */
export interface CommonPipelineDefinition {
    name: string;
    category: 'param' | 'data' | 'utility';
    description: string;
    createHandler: (options?: any) => DataProcessorHandler;
}

/**
 * 通用管道注册表
 */
const commonPipelines = new Map<string, CommonPipelineDefinition>();

/**
 * 注册通用管道
 */
export function registerCommonPipeline(definition: CommonPipelineDefinition): void {
    commonPipelines.set(definition.name, definition);
}

/**
 * 使用通用管道
 */
export function useCommonPipeline(
    key: string,           // 目标关键字，如 'abp-pre'
    name: string,          // 通用管道名称，如 'pagination-transform'
    options?: any          // 配置选项
): void {
    const definition = commonPipelines.get(name);
    if (!definition) {
        throw new Error(`Common pipeline "${name}" not found`);
    }
    
    const handler = definition.createHandler(options);
    DataProcessor.register(key, handler);
}
```

### 5.2 内置通用管道

```typescript
// packages/data-processor/src/common/pipelines.ts

import { registerCommonPipeline } from './index';

/**
 * 分页参数转换
 */
registerCommonPipeline({
    name: 'pagination-transform',
    category: 'param',
    description: '分页参数转换',
    
    createHandler: (options?: any) => ({
        name: 'pagination-transform',
        weight: 100,
        handle: async (ctx) => {
            const params = ctx.http.queryParams;
            if (!params) return;
            
            const mode = options?.mode || 'auto';
            
            if (mode === 'abp' || (mode === 'auto' && ctx.config.preset === 'abp')) {
                if (params.page !== undefined && params.size !== undefined) {
                    params.skipCount = params.page * params.size;
                    params.maxResultCount = params.size;
                    delete params.page;
                    delete params.size;
                }
            }
        }
    })
});

/**
 * 日期格式化
 */
registerCommonPipeline({
    name: 'date-format',
    category: 'data',
    description: '日期字段格式化',
    
    createHandler: (options?: any) => ({
        name: 'date-format',
        weight: 80,
        handle: async (ctx) => {
            const fields = options?.fields || ['createdAt', 'updatedAt'];
            
            const transform = (item: any) => {
                const result = { ...item };
                fields.forEach((field: string) => {
                    if (result[field]) {
                        const date = new Date(result[field]);
                        if (!isNaN(date.getTime())) {
                            result[field] = date.toLocaleString();
                        }
                    }
                });
                return result;
            };
            
            if (ctx.data.list) {
                ctx.data.list = ctx.data.list.map(transform);
            }
            if (ctx.data.item) {
                ctx.data.item = transform(ctx.data.item);
            }
        }
    })
});

/**
 * 枚举翻译
 */
registerCommonPipeline({
    name: 'enum-translate',
    category: 'data',
    description: '枚举字段翻译',
    
    createHandler: (options?: any) => ({
        name: 'enum-translate',
        weight: 75,
        handle: async (ctx) => {
            const maps = options?.maps || {};
            
            const transform = (item: any) => {
                const result = { ...item };
                
                Object.entries(maps).forEach(([field, map]) => {
                    if (result[field] !== undefined) {
                        const value = result[field];
                        const text = (map as any)[value] || value;
                        result[`${field}Text`] = text;
                    }
                });
                
                return result;
            };
            
            if (ctx.data.list) {
                ctx.data.list = ctx.data.list.map(transform);
            }
            if (ctx.data.item) {
                ctx.data.item = transform(ctx.data.item);
            }
        }
    })
});
```

### 5.3 使用通用管道

```typescript
import { useCommonPipeline } from '@orbitjs/data-processor';

// 在 ABP 前导管道中使用分页转换
useCommonPipeline('abp-pre', 'pagination-transform', { mode: 'abp' });

// 在 ABP 后道管道中使用日期格式化
useCommonPipeline('abp-post', 'date-format', {
    fields: ['creationTime', 'lastModificationTime']
});

// 在 ABP 后道管道中使用枚举翻译
useCommonPipeline('abp-post', 'enum-translate', {
    maps: {
        status: { 0: '禁用', 1: '启用' },
        gender: { 0: '未知', 1: '男', 2: '女' }
    }
});
```

---

## 六、完整示例

### 6.1 应用初始化

```typescript
// main.ts

import { Registry, RegistryHub } from '@orbitjs/core';
import { DataProcessor } from '@orbitjs/data-processor';
import { useCommonPipeline } from '@orbitjs/data-processor';
import registerAbpPipeline from '@orbitjs/data-processor-abp';
import registerSpringPipeline from '@orbitjs/data-processor-spring';

// 1. 注册 ABP 管道
registerAbpPipeline();

// 2. 注册 Spring 管道
registerSpringPipeline();

// 3. 使用通用管道增强 ABP
useCommonPipeline('abp-pre', 'pagination-transform', { mode: 'abp' });
useCommonPipeline('abp-post', 'date-format', {
    fields: ['creationTime', 'lastModificationTime']
});

// 4. 配置域
Registry.domain.register('abp-api', {
    baseUrl: 'https://abp.example.com',
    preset: 'abp',
    pageSize: 20,
    pagesizes: [10, 20, 50, 100],
});

Registry.domain.register('spring-api', {
    baseUrl: 'https://spring.example.com',
    preset: 'spring',
    pageSize: 20,
    pagesizes: [10, 20, 50, 100],
});

// 5. 锁定注册表
RegistryHub.lock();
```

### 6.2 使用实体管理器

```typescript
// 无需任何钩子！
class UserManager extends BaseEntityManager {
    async getList() {
        return await this.request('list', { url: '/users' });
        // 自动执行 abp-pre 管道
        // 自动执行 HTTP 管道
        // 自动执行 abp-post 管道
    }
}

class OrderManager extends BaseEntityManager {
    async getList() {
        return await this.request('list', { url: '/orders' });
    }
}
```

---

## 七、优势总结

### 7.1 与原方案对比

| 维度 | 原方案（分离式） | 新方案（统一式） |
|------|----------------|----------------|
| **注册器数量** | 3个（DataProcessor、DataAdapter、CommonPipeline） | 1个（DataProcessor） ✅ |
| **概念复杂度** | 高（处理器、适配器、通用管道） | 低（只有处理器） ✅ |
| **使用方式** | 不同组件不同API | 统一API ✅ |
| **扩展方式** | 创建适配器或管道 | 注册处理器 ✅ |
| **与HTTP模式一致性** | 不一致 | 完全一致 ✅ |

### 7.2 核心优势

1. **统一简洁**
   - 只有一个注册器 `DataProcessorRegistrar`
   - 只有一个概念 `DataProcessorHandler`
   - 与 HTTP 管道模式完全一致

2. **关键字路由**
   - 通过关键字区分不同场景
   - `abp-pre`、`abp-post`、`spring-pre`、`spring-post`
   - 支持任意自定义关键字

3. **灵活扩展**
   - 特殊域：注册特殊关键字
   - 特殊实体：注册实体级别关键字
   - 动态添加：运行时注册处理器

4. **易于理解**
   - 无需理解适配器、通用管道等概念
   - 只需理解：注册处理器 → 获取管道 → 执行

---

## 八、迁移指南

### 8.1 从原方案迁移

```typescript
// 原方案：使用适配器
DataAdapter.register({
    name: 'abp-paged-result',
    recognize: (raw) => raw?.items && raw?.totalCount,
    extractList: (raw) => ({ list: raw.items, total: raw.totalCount })
});

// 新方案：注册处理器
DataProcessor.register('abp-post', {
    name: 'abp-extract',
    weight: 100,
    handle: async (ctx) => {
        const raw = ctx.data.raw;
        if (raw?.items && raw?.totalCount !== undefined) {
            ctx.data.list = raw.items;
            ctx.data.total = raw.totalCount;
        }
    }
});
```

### 8.2 迁移检查清单

- [ ] 将适配器转换为处理器
- [ ] 将通用管道转换为处理器工厂
- [ ] 使用 `register()` 替代 `register()` + `autoExtract()`
- [ ] 使用 `execute()` 替代 `executePrePipeline()` + `executePostPipeline()`
- [ ] 更新配置文件

---

**简化方案 | 核心思想**: 统一注册器 + 关键字路由 = 简洁高效
