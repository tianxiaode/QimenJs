# 数据处理管道执行时机和复用方案

## 一、执行时机区分

### 1.1 约定式命名

**关键字命名规则**：
```
{preset}        → 完整管道（前道 + 后道）
{preset}-pre    → 前道管道
{preset}-post   → 后道管道
```

**示例**：
- `abp` → ABP 完整管道
- `abp-pre` → ABP 前道管道
- `abp-post` → ABP 后道管道

### 1.2 实体管理器自动路由

```typescript
// src/entity/manager/CoreEntityManager.ts

export abstract class CoreEntityManager extends ComposableBase {
    
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask {
        const context = createFlowContext(...);
        
        const execute = async (): Promise<RequestContext> => {
            try {
                // 1. 获取 preset
                const preset = context.config.preset;
                
                // 2. 自动构建管道关键字
                const preKey = `${preset}-pre`;   // 'abp-pre'
                const postKey = `${preset}-post`; // 'abp-post'
                
                // 3. 执行前道管道
                await DataProcessor.execute(preKey, context);
                
                // 4. 执行 HTTP 管道
                await runPipeline(context, httpPipeline);
                
                // 5. 执行后道管道
                await DataProcessor.execute(postKey, context);
                
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

**优势**：
- ✅ 约定优于配置
- ✅ 自动路由，无需手动判断
- ✅ 简单直观

---

## 二、处理器复用方案

### 2.1 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **多次注册** | 简单直接 | 重复代码，难以维护 ❌ |
| **标签过滤** | 灵活 | 需要额外的过滤逻辑 |
| **处理器工厂** | 复用性好 | 需要工厂函数 |
| **管道组合** | 最灵活 | 需要组合逻辑 |

### 2.2 推荐方案：处理器工厂 + 管道组合

#### 方案设计

```typescript
// src/data-processor/common/index.ts

/**
 * 处理器工厂
 * 用于创建可复用的处理器
 */
export class ProcessorFactory {
    private static factories = new Map<string, ProcessorFactoryFn>();
    
    /**
     * 注册处理器工厂
     */
    static register(name: string, factory: ProcessorFactoryFn): void {
        this.factories.set(name, factory);
    }
    
    /**
     * 创建处理器实例
     */
    static create(name: string, options?: any): DataProcessorHandler {
        const factory = this.factories.get(name);
        if (!factory) {
            throw new Error(`Processor factory "${name}" not found`);
        }
        return factory(options);
    }
}

type ProcessorFactoryFn = (options?: any) => DataProcessorHandler;
```

#### 使用示例

```typescript
// 1. 定义处理器工厂
ProcessorFactory.register('date-format', (options?: any) => ({
    name: `date-format-${options?.id || 'default'}`,
    weight: options?.weight ?? 80,
    handle: async (ctx) => {
        const fields = options?.fields || ['createdAt', 'updatedAt'];
        
        const transform = (item: any) => {
            const result = { ...item };
            fields.forEach((field: string) => {
                if (result[field]) {
                    result[field] = new Date(result[field]).toLocaleString();
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
}));

// 2. 在不同管道中使用
// ABP 后道管道
DataProcessor.register('abp-post', 
    ProcessorFactory.create('date-format', {
        fields: ['creationTime', 'lastModificationTime'],
        weight: 80
    })
);

// Spring 后道管道
DataProcessor.register('spring-post', 
    ProcessorFactory.create('date-format', {
        fields: ['createdAt', 'updatedAt'],
        weight: 80
    })
);

// 自定义管道
DataProcessor.register('custom-post', 
    ProcessorFactory.create('date-format', {
        fields: ['timestamp'],
        weight: 90
    })
);
```

---

## 三、完整解决方案

### 3.1 内置处理器工厂

```typescript
// src/data-processor/common/factories.ts

/**
 * 注册所有内置处理器工厂
 */
export function registerBuiltinFactories(): void {
    // 分页参数转换
    ProcessorFactory.register('pagination-transform', (options?: any) => ({
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
    }));
    
    // 日期格式化
    ProcessorFactory.register('date-format', (options?: any) => ({
        name: `date-format-${options?.id || 'default'}`,
        weight: options?.weight ?? 80,
        handle: async (ctx) => {
            const fields = options?.fields || ['createdAt', 'updatedAt'];
            const format = options?.format || 'locale';
            
            const transform = (item: any) => {
                const result = { ...item };
                fields.forEach((field: string) => {
                    if (result[field]) {
                        const date = new Date(result[field]);
                        if (!isNaN(date.getTime())) {
                            result[field] = format === 'locale' 
                                ? date.toLocaleString() 
                                : date.toISOString();
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
    }));
    
    // 枚举翻译
    ProcessorFactory.register('enum-translate', (options?: any) => ({
        name: `enum-translate-${options?.id || 'default'}`,
        weight: options?.weight ?? 75,
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
    }));
    
    // 价格转换
    ProcessorFactory.register('price-transform', (options?: any) => ({
        name: `price-transform-${options?.id || 'default'}`,
        weight: options?.weight ?? 80,
        handle: async (ctx) => {
            const fields = options?.fields || ['price', 'amount'];
            const direction = options?.direction || 'toYuan';
            
            const transform = (item: any) => {
                const result = { ...item };
                fields.forEach((field: string) => {
                    if (result[field] !== undefined) {
                        result[field] = direction === 'toYuan' 
                            ? result[field] / 100 
                            : result[field] * 100;
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
    }));
}
```

### 3.2 ABP 管道注册

```typescript
// src/data-processor-abp/index.ts

import { DataProcessor } from '@/data-processor';
import { ProcessorFactory } from '@/data-processor/common';

/**
 * 注册 ABP 数据处理管道
 */
export function registerAbpPipeline(): void {
    // 前道管道
    DataProcessor.registerAll('abp-pre', [
        // ABP 分页参数转换
        ProcessorFactory.create('pagination-transform', { mode: 'abp' }),
        
        // ABP 租户 Header
        {
            name: 'abp-tenant-header',
            weight: 90,
            handle: async (ctx) => {
                const tenantId = ctx.config.custom?.tenantId;
                if (tenantId) {
                    ctx.http.headers['Abp-TenantId'] = tenantId;
                }
            }
        }
    ]);
    
    // 后道管道
    DataProcessor.registerAll('abp-post', [
        // ABP 数据提取
        {
            name: 'abp-extract',
            weight: 100,
            handle: async (ctx) => {
                const raw = ctx.data.raw;
                
                if (raw?.items && raw?.totalCount !== undefined) {
                    ctx.data.list = raw.items;
                    ctx.data.total = raw.totalCount;
                } else if (raw?.id) {
                    ctx.data.item = raw;
                }
            }
        },
        
        // ABP 错误处理
        {
            name: 'abp-error',
            weight: 90,
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
        },
        
        // 日期格式化（复用）
        ProcessorFactory.create('date-format', {
            fields: ['creationTime', 'lastModificationTime']
        })
    ]);
}
```

### 3.3 Spring 管道注册

```typescript
// src/data-processor-spring/index.ts

import { DataProcessor } from '@/data-processor';
import { ProcessorFactory } from '@/data-processor/common';

/**
 * 注册 Spring 数据处理管道
 */
export function registerSpringPipeline(): void {
    // 前道管道
    DataProcessor.registerAll('spring-pre', [
        // Spring 分页参数（无需转换）
        {
            name: 'spring-pagination-default',
            weight: 100,
            handle: async (ctx) => {
                // Spring 已经使用 page/size，无需转换
            }
        }
    ]);
    
    // 后道管道
    DataProcessor.registerAll('spring-post', [
        // Spring 数据提取
        {
            name: 'spring-extract',
            weight: 100,
            handle: async (ctx) => {
                const raw = ctx.data.raw;
                
                if (raw?.code !== undefined && raw?.data !== undefined) {
                    if (raw.code !== 200 && raw.code !== 0) {
                        ctx.error = { code: raw.code, message: raw.message };
                        ctx.metadata.hasError = true;
                        return;
                    }
                    
                    if (raw.data?.content) {
                        ctx.data.list = raw.data.content;
                        ctx.data.total = raw.data.totalElements;
                    } else {
                        ctx.data.item = raw.data;
                    }
                }
            }
        },
        
        // 日期格式化（复用）
        ProcessorFactory.create('date-format', {
            fields: ['createdAt', 'updatedAt']
        })
    ]);
}
```

---

## 四、使用示例

### 4.1 应用初始化

```typescript
// src/main.ts

import { Registry, RegistryHub } from '@/registry';
import { registerBuiltinFactories } from '@/data-processor/common';
import registerAbpPipeline from '@/data-processor-abp';
import registerSpringPipeline from '@/data-processor-spring';

// 1. 注册内置处理器工厂
registerBuiltinFactories();

// 2. 注册 ABP 管道
registerAbpPipeline();

// 3. 注册 Spring 管道
registerSpringPipeline();

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

### 4.2 实体管理器使用

```typescript
// 无需任何配置，自动路由
class UserManager extends BaseEntityManager {
    async getList() {
        // 自动执行 abp-pre → HTTP → abp-post
        return await this.request('list', { url: '/users' });
    }
}

class OrderManager extends BaseEntityManager {
    async getList() {
        // 自动执行 spring-pre → HTTP → spring-post
        return await this.request('list', { url: '/orders' });
    }
}
```

### 4.3 自定义处理器复用

```typescript
// 自定义处理器工厂
ProcessorFactory.register('my-custom-transform', (options?: any) => ({
    name: `my-custom-${options?.id || 'default'}`,
    weight: options?.weight ?? 80,
    handle: async (ctx) => {
        // 自定义处理逻辑
    }
}));

// 在多个管道中复用
DataProcessor.register('abp-post', 
    ProcessorFactory.create('my-custom-transform', { id: 'abp' })
);

DataProcessor.register('spring-post', 
    ProcessorFactory.create('my-custom-transform', { id: 'spring' })
);

DataProcessor.register('custom-post', 
    ProcessorFactory.create('my-custom-transform', { id: 'custom' })
);
```

---

## 五、方案优势

### 5.1 执行时机清晰

| 方式 | 说明 |
|------|------|
| `{preset}-pre` | 前道管道，请求前执行 |
| `{preset}-post` | 后道管道，响应后执行 |
| 自动路由 | 实体管理器自动构建关键字 |

### 5.2 处理器复用灵活

| 特性 | 说明 |
|------|------|
| **处理器工厂** | 创建可配置的处理器实例 |
| **一次定义** | 工厂只需定义一次 |
| **多次使用** | 在不同管道中复用 |
| **配置灵活** | 每次使用可传不同配置 |

### 5.3 代码组织清晰

```
src/data-processor/
├── common/
│   ├── factories.ts          # 内置处理器工厂
│   └── index.ts              # ProcessorFactory
│
├── data-processor-abp/
│   └── index.ts              # ABP 管道注册
│
└── data-processor-spring/
    └── index.ts              # Spring 管道注册
```

---

## 六、总结

### 核心设计

1. **约定式命名**：`{preset}-pre` / `{preset}-post`
2. **自动路由**：实体管理器自动构建关键字
3. **处理器工厂**：一次定义，多次复用
4. **配置灵活**：每次使用可传不同配置

### 使用流程

```
1. 定义处理器工厂（一次）
   ↓
2. 在管道中注册（多次复用）
   ↓
3. 实体管理器自动路由
   ↓
4. 执行对应管道
```

这个方案既解决了执行时机问题，又实现了处理器的高效复用！
