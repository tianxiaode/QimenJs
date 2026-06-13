# 数据处理管道快速参考

> 快速查阅手册 | 详细文档请参考 [DATA_PROCESSOR_ARCHITECTURE.md](./DATA_PROCESSOR_ARCHITECTURE.md)

---

## 一、快速开始

### 1. 基础初始化

```typescript
import { Registry } from '@orbitjs/core';
import { registerCommonPipelines, registerBuiltinAdapters } from '@orbitjs/data-processor';
import createAbpDataPipeline from '@orbitjs/data-processor-abp';

// 1. 注册通用管道和适配器
registerCommonPipelines();
registerBuiltinAdapters();

// 2. 注册后端管道
createAbpDataPipeline();

// 3. 配置域
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'abp',
    pageSize: 20,
    pagesizes: [10, 20, 50, 100],
});
```

### 2. 使用实体管理器

```typescript
// 无需任何钩子！
class UserManager extends BaseEntityManager {
    async getList() {
        return await this.request('list', { url: '/users' });
    }
}
```

---

## 二、通用管道速查表

### 参数转换类

| 管道名称 | 用途 | 配置示例 |
|---------|------|---------|
| `pagination-transform` | 分页参数转换 | `{ mode: 'abp' \| 'spring' \| 'offset' }` |
| `sort-transform` | 排序参数转换 | `{ format: 'spring' \| 'array' \| 'object' }` |
| `date-param-transform` | 日期参数转换 | `{ format: 'iso' \| 'timestamp', fields: ['startDate'] }` |
| `filter-transform` | 过滤参数转换 | `{ format: 'odata' \| 'graphql', fields: ['name'] }` |

### 数据转换类

| 管道名称 | 用途 | 配置示例 |
|---------|------|---------|
| `date-format` | 日期格式化 | `{ fields: ['createdAt'], format: 'locale' \| 'iso' }` |
| `enum-translate` | 枚举翻译 | `{ maps: { status: { 0: '禁用', 1: '启用' } } }` |
| `price-transform` | 价格转换 | `{ fields: ['price'], direction: 'toYuan' \| 'toCent' }` |
| `field-mapping` | 字段映射 | `{ mapping: { oldName: 'newName' } }` |
| `flatten-nested` | 嵌套展开 | `{ fields: ['user'] }` |

### 工具类

| 管道名称 | 用途 | 配置示例 |
|---------|------|---------|
| `logging` | 日志记录 | `{ level: 'debug' \| 'info' \| 'warn' }` |
| `performance-monitor` | 性能监控 | `{ threshold: 1000 }` |
| `data-validation` | 数据校验 | `{ rules: [{ field: 'id', required: true }] }` |
| `cache-control` | 缓存控制 | `{ strategy: 'localStorage', ttl: 60000 }` |

---

## 三、数据适配器速查表

| 适配器名称 | 数据结构 | 优先级 |
|-----------|---------|--------|
| `abp-paged-result` | `{ items: T[], totalCount: number }` | 100 |
| `abp-ajax-response` | `{ success: boolean, result: T }` | 90 |
| `spring-result` | `{ code: number, message: string, data: T }` | 100 |
| `spring-page` | `{ content: T[], totalElements: number }` | 100 |
| `common-success` | `{ success: boolean, data: T }` | 80 |
| `open-platform` | `{ errcode: number, errmsg: string, data: T }` | 100 |
| `legacy-system` | `{ status: number, result: T }` | 90 |
| `pure-array` | `T[]` | 50 |

---

## 四、常用配置模板

### 模板 1：ABP 标准配置

```typescript
import { EntityPipelineConfigManager, CommonPipeline } from '@orbitjs/data-processor';

const configManager = EntityPipelineConfigManager.getInstance();

configManager.configure('abp-api', 'user', {
    prePipeline: {
        insert: [
            CommonPipeline.createInstance('pagination-transform', { mode: 'abp' })!,
        ]
    },
    postPipeline: {
        insert: [
            CommonPipeline.createInstance('date-format', {
                fields: ['creationTime', 'lastModificationTime'],
                format: 'locale'
            })!,
            CommonPipeline.createInstance('enum-translate', {
                maps: {
                    status: { 0: '禁用', 1: '启用' },
                    gender: { 0: '未知', 1: '男', 2: '女' }
                }
            })!,
        ]
    }
});
```

### 模板 2：电商订单配置

```typescript
configManager.configure('abp-api', 'order', {
    prePipeline: {
        insert: [
            CommonPipeline.createInstance('pagination-transform')!,
            CommonPipeline.createInstance('sort-transform', { format: 'spring' })!,
        ]
    },
    postPipeline: {
        insert: [
            CommonPipeline.createInstance('price-transform', {
                fields: ['amount', 'totalPrice', 'discount'],
                direction: 'toYuan'
            })!,
            CommonPipeline.createInstance('enum-translate', {
                maps: {
                    status: {
                        'PENDING': '待支付',
                        'PAID': '已支付',
                        'SHIPPED': '已发货',
                        'COMPLETED': '已完成',
                    }
                }
            })!,
            CommonPipeline.createInstance('date-format', {
                fields: ['createTime', 'payTime', 'shipTime'],
                format: 'custom',
                pattern: 'YYYY-MM-DD HH:mm:ss'
            })!,
        ]
    }
});
```

### 模板 3：开发环境配置

```typescript
if (process.env.NODE_ENV === 'development') {
    DynamicPipelineManager.addDomainHandler('abp-api', 'pre',
        CommonPipeline.createInstance('logging', { level: 'debug' })!
    );
    
    DynamicPipelineManager.addDomainHandler('abp-api', 'post',
        CommonPipeline.createInstance('performance-monitor', { threshold: 500 })!
    );
}
```

---

## 五、管道扩展操作

### 插入处理器

```typescript
import { PipelineExtension } from '@orbitjs/data-processor';

const pipelines = DataProcessor.get('abp');

// 在指定处理器之前插入
PipelineExtension.insertBefore(
    pipelines!.postPipeline,
    'abp-data-extract',
    { name: 'custom-handler', weight: 110, handle: async (ctx) => { /* ... */ } }
);

// 在指定处理器之后插入
PipelineExtension.insertAfter(
    pipelines!.postPipeline,
    'abp-data-extract',
    { name: 'custom-handler', weight: 90, handle: async (ctx) => { /* ... */ } }
);
```

### 替换处理器

```typescript
PipelineExtension.replace(
    pipelines!.postPipeline,
    'abp-error-handle',
    { name: 'custom-error', weight: 90, handle: async (ctx) => { /* ... */ } }
);
```

### 移除处理器

```typescript
PipelineExtension.remove(pipelines!.postPipeline, 'abp-tenant-header');
```

---

## 六、自定义扩展

### 自定义适配器

```typescript
import { DataAdapter } from '@orbitjs/data-processor';

const CustomAdapter: DataAdapter = {
    name: 'my-adapter',
    priority: 110,
    
    recognize(raw: any) {
        return raw && raw.__type === 'MyResponse';
    },
    
    extractList(raw) {
        return { list: raw.records, total: raw.count };
    },
    
    extractError(raw) {
        if (raw.status !== 'OK') {
            return { code: raw.status, message: raw.reason };
        }
        return undefined;
    }
};

DataAdapter.register(CustomAdapter);
```

### 自定义通用管道

```typescript
import { CommonPipelineDefinition } from '@orbitjs/data-processor';

const CustomPipeline: CommonPipelineDefinition = {
    name: 'my-transform',
    category: 'data',
    description: '自定义转换',
    tags: ['custom'],
    
    handler: {
        name: 'my-transform',
        weight: 80,
        handle: async (ctx) => {
            // 处理逻辑
        }
    }
};

CommonPipeline.register(CustomPipeline);
```

---

## 七、调试技巧

### 查看注册器状态

```typescript
// 查看所有
RegistryHub.debug();

// 查看特定注册器
RegistryHub.debug('data-processor', 'data-adapter', 'common-pipeline');
```

### 查看执行轨迹

```typescript
const result = await userManager.getList();

console.log('执行步骤:', result.steps);
console.log('使用的适配器:', result.metadata.adapterUsed);
console.log('是否成功:', result.metadata.success);
```

### 性能分析

```typescript
result.steps.forEach(step => {
    console.log(`${step.name}: ${step.duration}ms (${step.status})`);
});
```

---

## 八、常见问题

### Q1: 如何处理特殊的数据结构？

**A**: 创建自定义适配器，设置高优先级：

```typescript
const SpecialAdapter: DataAdapter = {
    name: 'special-adapter',
    priority: 120, // 高于内置适配器
    recognize(raw) { /* ... */ },
    extractList(raw) { /* ... */ }
};
```

### Q2: 如何在特定实体上应用特殊处理？

**A**: 使用实体级别配置：

```typescript
configManager.configure('api', 'special-entity', {
    postPipeline: {
        insert: [customHandler]
    }
});
```

### Q3: 如何动态添加处理器？

**A**: 使用动态管道管理器：

```typescript
DynamicPipelineManager.addHandler('api', 'entity', 'post', {
    name: 'dynamic-handler',
    weight: 100,
    handle: async (ctx) => { /* ... */ }
});
```

### Q4: 如何复用管道配置？

**A**: 创建管道预设：

```typescript
function createStandardPipeline() {
    const pipeline = new DataPipeline();
    pipeline.use(CommonPipeline.createInstance('pagination-transform')!);
    pipeline.use(CommonPipeline.createInstance('date-format', { /* ... */ })!);
    return pipeline;
}

// 复用
configManager.configure('api', 'entity1', {
    customPostPipeline: createStandardPipeline()
});
configManager.configure('api', 'entity2', {
    customPostPipeline: createStandardPipeline()
});
```

---

## 九、性能优化建议

1. **使用管道缓存**: 管道自动缓存排序结果
2. **条件执行**: 使用 `shouldExecute` 避免不必要的处理
3. **批量注册**: 使用 `registerAll` 一次性注册多个
4. **锁定注册表**: 应用启动后锁定，防止运行时修改

```typescript
// 应用启动完成后
RegistryHub.lock();
```

---

## 十、迁移检查清单

- [ ] 注册通用管道 (`registerCommonPipelines()`)
- [ ] 注册内置适配器 (`registerBuiltinAdapters()`)
- [ ] 注册后端管道 (ABP/Spring 等)
- [ ] 配置域 (`Registry.domain.register()`)
- [ ] 配置实体管道 (可选)
- [ ] 移除旧的钩子函数
- [ ] 测试数据提取是否正确
- [ ] 测试错误处理是否正常
- [ ] 锁定注册表 (`RegistryHub.lock()`)

---

**快速参考 | 详细文档**: [DATA_PROCESSOR_ARCHITECTURE.md](./DATA_PROCESSOR_ARCHITECTURE.md)
