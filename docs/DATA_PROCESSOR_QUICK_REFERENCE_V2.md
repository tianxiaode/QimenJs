# 数据处理管道快速参考 (简化版)

> 快速查阅手册 | 详细文档: [DATA_PROCESSOR_SIMPLIFIED.md](./DATA_PROCESSOR_SIMPLIFIED.md)

---

## 一、核心概念

### 统一注册器模式

```
DataProcessorRegistrar
├── register(key, handler)     - 注册处理器
├── getPipeline(key)           - 获取管道列表
└── execute(key, context)      - 执行管道

关键字规则：
├── 'abp-pre'     - ABP 前导管道
├── 'abp-post'    - ABP 后道管道
├── 'spring-pre'  - Spring 前导管道
├── 'spring-post' - Spring 后道管道
└── 'custom-xxx'  - 自定义管道
```

---

## 二、快速开始

### 1. 初始化

```typescript
import { Registry } from '@orbitjs/core';
import { DataProcessor } from '@orbitjs/data-processor';
import registerAbpPipeline from '@orbitjs/data-processor-abp';

// 注册 ABP 管道
registerAbpPipeline();

// 配置域
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'abp',
    pageSize: 20,
    pagesizes: [10, 20, 50, 100],
});
```

### 2. 使用

```typescript
// 无需任何钩子！
class UserManager extends BaseEntityManager {
    async getList() {
        return await this.request('list', { url: '/users' });
    }
}
```

---

## 三、API 速查

### 注册处理器

```typescript
// 单个注册
DataProcessor.register('abp-post', {
    name: 'my-handler',
    weight: 100,
    handle: async (ctx) => {
        // 处理逻辑
    }
});

// 批量注册
DataProcessor.registerAll('abp-post', [
    { name: 'handler1', weight: 100, handle: async (ctx) => { /* ... */ } },
    { name: 'handler2', weight: 90, handle: async (ctx) => { /* ... */ } }
]);
```

### 获取管道

```typescript
// 获取管道列表
const pipeline = DataProcessor.getPipeline('abp-post');

// 查看管道内容
console.log(pipeline);
```

### 执行管道

```typescript
// 执行管道
await DataProcessor.execute('abp-post', context);
```

### 移除处理器

```typescript
// 移除特定处理器
DataProcessor.unregister('abp-post', 'handler-name');

// 移除整个管道
DataProcessor.unregister('abp-post');
```

---

## 四、常用处理器模板

### 参数转换类

```typescript
// 分页参数转换
{
    name: 'pagination-transform',
    weight: 100,
    handle: async (ctx) => {
        const params = ctx.http.queryParams;
        if (params?.page !== undefined && params?.size !== undefined) {
            params.skipCount = params.page * params.size;
            params.maxResultCount = params.size;
            delete params.page;
            delete params.size;
        }
    }
}

// 排序参数转换
{
    name: 'sort-transform',
    weight: 90,
    handle: async (ctx) => {
        const params = ctx.http.queryParams;
        if (params?.sort) {
            params.sort = `${params.sort},${params.order || 'asc'}`;
            delete params.order;
        }
    }
}
```

### 数据提取类

```typescript
// ABP 数据提取
{
    name: 'abp-extract',
    weight: 100,
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
}

// Spring 数据提取
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
    }
}
```

### 数据转换类

```typescript
// 日期格式化
{
    name: 'date-format',
    weight: 80,
    handle: async (ctx) => {
        const fields = ['createdAt', 'updatedAt'];
        
        const transform = (item: any) => {
            const result = { ...item };
            fields.forEach(field => {
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
}

// 枚举翻译
{
    name: 'enum-translate',
    weight: 75,
    handle: async (ctx) => {
        const maps = {
            status: { 0: '禁用', 1: '启用' },
            gender: { 0: '未知', 1: '男', 2: '女' }
        };
        
        const transform = (item: any) => {
            const result = { ...item };
            Object.entries(maps).forEach(([field, map]) => {
                if (result[field] !== undefined) {
                    result[`${field}Text`] = (map as any)[result[field]] || result[field];
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
}

// 价格转换
{
    name: 'price-transform',
    weight: 80,
    handle: async (ctx) => {
        const fields = ['price', 'amount'];
        
        const transform = (item: any) => {
            const result = { ...item };
            fields.forEach(field => {
                if (result[field] !== undefined) {
                    result[field] = result[field] / 100; // 分 → 元
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
}
```

### 错误处理类

```typescript
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
}

// 通用错误处理
{
    name: 'common-error',
    weight: 90,
    handle: async (ctx) => {
        const raw = ctx.data.raw;
        
        // 检查常见的错误字段
        if (raw?.errcode !== undefined && raw.errcode !== 0) {
            ctx.error = {
                code: raw.errcode,
                message: raw.errmsg || raw.message || 'Error',
            };
            ctx.metadata.hasError = true;
        }
    }
}
```

---

## 五、特殊场景处理

### 特殊域

```typescript
// 注册特殊域管道
DataProcessor.registerAll('special-domain-post', [
    {
        name: 'special-extract',
        weight: 100,
        handle: async (ctx) => {
            const raw = ctx.data.raw;
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

### 实体级别

```typescript
// 注册实体级别管道
DataProcessor.registerAll('abp-user-post', [
    {
        name: 'user-avatar',
        weight: 80,
        handle: async (ctx) => {
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
        await DataProcessor.execute('abp-user-post', result);
        return result;
    }
}
```

### 条件执行

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

---

## 六、通用管道使用

### 使用内置通用管道

```typescript
import { useCommonPipeline } from '@orbitjs/data-processor';

// 分页转换
useCommonPipeline('abp-pre', 'pagination-transform', { mode: 'abp' });

// 日期格式化
useCommonPipeline('abp-post', 'date-format', {
    fields: ['creationTime', 'lastModificationTime']
});

// 枚举翻译
useCommonPipeline('abp-post', 'enum-translate', {
    maps: {
        status: { 0: '禁用', 1: '启用' },
        gender: { 0: '未知', 1: '男', 2: '女' }
    }
});

// 价格转换
useCommonPipeline('abp-post', 'price-transform', {
    fields: ['amount', 'totalPrice'],
    direction: 'toYuan'
});
```

### 内置通用管道列表

| 名称 | 类别 | 说明 |
|------|------|------|
| `pagination-transform` | param | 分页参数转换 |
| `sort-transform` | param | 排序参数转换 |
| `date-format` | data | 日期格式化 |
| `enum-translate` | data | 枚举翻译 |
| `price-transform` | data | 价格转换 |
| `logging` | utility | 日志记录 |
| `performance-monitor` | utility | 性能监控 |

---

## 七、调试技巧

### 查看注册器状态

```typescript
// 查看所有
RegistryHub.debug('data-processor');

// 或直接调用
DataProcessor.inspect();
```

### 查看管道内容

```typescript
// 获取管道
const pipeline = DataProcessor.getPipeline('abp-post');

// 打印
console.log('ABP 后道管道:', pipeline);
```

### 查看执行轨迹

```typescript
const result = await userManager.getList();

console.log('执行步骤:', result.steps);
result.steps.forEach(step => {
    console.log(`  ${step.name}: ${step.duration}ms (${step.status})`);
});
```

---

## 八、常见问题

### Q1: 如何处理特殊数据结构？

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

### Q2: 如何在特定实体上应用特殊处理？

**A**: 使用实体级别关键字：

```typescript
DataProcessor.register('abp-user-post', handler);

// 在实体管理器中执行
await DataProcessor.execute('abp-user-post', context);
```

### Q3: 如何动态添加处理器？

**A**: 直接调用 register：

```typescript
DataProcessor.register('abp-post', {
    name: 'dynamic-handler',
    weight: 100,
    handle: async (ctx) => { /* ... */ }
});
```

### Q4: 如何移除不需要的处理器？

**A**: 使用 unregister：

```typescript
DataProcessor.unregister('abp-post', 'handler-name');
```

---

## 九、完整示例

### ABP 项目配置

```typescript
import { Registry, RegistryHub } from '@orbitjs/core';
import { DataProcessor, useCommonPipeline } from '@orbitjs/data-processor';
import registerAbpPipeline from '@orbitjs/data-processor-abp';

// 1. 注册 ABP 管道
registerAbpPipeline();

// 2. 使用通用管道增强
useCommonPipeline('abp-pre', 'pagination-transform', { mode: 'abp' });
useCommonPipeline('abp-post', 'date-format', {
    fields: ['creationTime', 'lastModificationTime']
});
useCommonPipeline('abp-post', 'enum-translate', {
    maps: {
        status: { 0: '禁用', 1: '启用' }
    }
});

// 3. 添加自定义处理器
DataProcessor.register('abp-post', {
    name: 'custom-transform',
    weight: 80,
    handle: async (ctx) => {
        // 自定义处理
    }
});

// 4. 配置域
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'abp',
    pageSize: 20,
    pagesizes: [10, 20, 50, 100],
});

// 5. 锁定
RegistryHub.lock();
```

---

## 十、迁移检查清单

- [ ] 安装 `@orbitjs/data-processor` 包
- [ ] 安装后端包（如 `@orbitjs/data-processor-abp`）
- [ ] 注册管道 (`registerAbpPipeline()`)
- [ ] 使用通用管道增强（可选）
- [ ] 配置域 (`Registry.domain.register()`)
- [ ] 移除旧的钩子函数
- [ ] 测试数据提取
- [ ] 测试错误处理
- [ ] 锁定注册表 (`RegistryHub.lock()`)

---

**快速参考 | 详细文档**: [DATA_PROCESSOR_SIMPLIFIED.md](./DATA_PROCESSOR_SIMPLIFIED.md)
