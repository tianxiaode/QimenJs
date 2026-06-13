# 数据处理管道使用指南

## 快速开始

### 1. 基础使用

数据处理注册器已经自动注册到 RegistryHub，可以直接使用：

```typescript
import { Registry } from '@/registry';

// 通过 Registry 访问
Registry.dataProcessor.register('abp-post', {
    name: 'abp-extract',
    weight: 100,
    handle: async (ctx) => {
        // 数据提取逻辑
    }
});

// 或使用便捷实例
import { DataProcessor } from '@/data-processor';

DataProcessor.register('abp-post', {
    name: 'abp-extract',
    weight: 100,
    handle: async (ctx) => {
        // 数据提取逻辑
    }
});
```

### 2. 注册处理器

#### 单个注册

```typescript
DataProcessor.register('abp-pre', {
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
});
```

#### 批量注册

```typescript
DataProcessor.registerAll('abp-post', [
    {
        name: 'abp-extract',
        weight: 100,
        handle: async (ctx) => {
            const raw = ctx.data.raw;
            if (raw?.items && raw?.totalCount !== undefined) {
                ctx.data.list = raw.items;
                ctx.data.total = raw.totalCount;
            }
        }
    },
    {
        name: 'abp-error',
        weight: 90,
        handle: async (ctx) => {
            const raw = ctx.data.raw;
            if (raw?.error) {
                ctx.error = {
                    code: raw.error.code,
                    message: raw.error.message,
                };
                ctx.metadata.hasError = true;
            }
        }
    }
]);
```

### 3. 执行管道

```typescript
import { FlowContext } from '@/kernel/types';

// 执行前导管道
await DataProcessor.execute('abp-pre', context);

// 执行后道管道
await DataProcessor.execute('abp-post', context);
```

### 4. 条件执行

```typescript
DataProcessor.register('abp-post', {
    name: 'conditional-handler',
    weight: 100,
    shouldExecute: (ctx) => {
        // 只在特定条件下执行
        return ctx.entityName === 'user' && ctx.action === 'list';
    },
    handle: async (ctx) => {
        // 处理逻辑
    }
});
```

### 5. 调试

```typescript
// 查看所有管道
RegistryHub.debug('data-processor');

// 或直接调用
DataProcessor.inspect();

// 查看特定管道
const pipeline = DataProcessor.getPipeline('abp-post');
console.log(pipeline);
```

## 完整示例

### ABP 数据处理管道

```typescript
// src/data-processor-abp/index.ts

import { DataProcessor } from '@/data-processor';

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
    DataProcessor.registerAll('abp-pre', abpPreHandlers);
    DataProcessor.registerAll('abp-post', abpPostHandlers);
}

export default registerAbpPipeline;
```

### 集成到实体管理器

```typescript
// src/entity/manager/CoreEntityManager.ts

import { DataProcessor } from '@/data-processor';

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
                const allActions = this.getStatic<any[]>('__ACTION_PIPELINE__');
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

### 应用初始化

```typescript
// src/main.ts

import { Registry, RegistryHub } from '@/registry';
import { DataProcessor } from '@/data-processor';
import registerAbpPipeline from '@/data-processor-abp';

// 1. 注册 ABP 管道
registerAbpPipeline();

// 2. 配置域
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'abp',
    pageSize: 20,
    pagesizes: [10, 20, 50, 100],
});

// 3. 锁定注册表
RegistryHub.lock();
```

## API 参考

### DataProcessorRegistrar

| 方法 | 说明 | 参数 |
|------|------|------|
| `register(key, handler)` | 注册单个处理器 | key: 管道关键字, handler: 处理器 |
| `registerAll(key, handlers)` | 批量注册处理器 | key: 管道关键字, handlers: 处理器列表 |
| `getPipeline(key)` | 获取管道列表 | key: 管道关键字 |
| `execute(key, context)` | 执行管道 | key: 管道关键字, context: 流上下文 |
| `unregister(key, handlerName?)` | 移除处理器 | key: 管道关键字, handlerName: 处理器名称（可选） |
| `get(key, handlerName)` | 获取处理器 | key: 管道关键字, handlerName: 处理器名称 |
| `has(key)` | 检查管道是否存在 | key: 管道关键字 |
| `size(key)` | 获取处理器数量 | key: 管道关键字 |
| `clear()` | 清空所有管道 | - |
| `inspect()` | 调试输出 | - |

### DataProcessorHandler

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 处理器名称（唯一标识） |
| `handle` | function | 是 | 处理函数 |
| `weight` | number | 否 | 权重（默认 100，数字越大优先级越高） |
| `shouldExecute` | function | 否 | 条件执行函数 |
| `description` | string | 否 | 描述信息 |

## 常见问题

### Q: 如何处理特殊的数据结构？

**A**: 注册自定义处理器：

```typescript
DataProcessor.register('custom-post', {
    name: 'custom-extract',
    weight: 100,
    handle: async (ctx) => {
        // 自定义提取逻辑
    }
});
```

### Q: 如何在特定实体上应用特殊处理？

**A**: 使用实体级别关键字：

```typescript
DataProcessor.register('abp-user-post', handler);

// 在实体管理器中执行
await DataProcessor.execute('abp-user-post', context);
```

### Q: 如何动态添加处理器？

**A**: 直接调用 register：

```typescript
DataProcessor.register('abp-post', {
    name: 'dynamic-handler',
    weight: 100,
    handle: async (ctx) => { /* ... */ }
});
```

### Q: 如何移除不需要的处理器？

**A**: 使用 unregister：

```typescript
DataProcessor.unregister('abp-post', 'handler-name');
```
