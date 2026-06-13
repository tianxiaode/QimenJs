# 数据处理管道架构设计文档

> **文档版本**: v1.0  
> **创建日期**: 2026-06-13  
> **状态**: 基准文档  
> **目的**: 为数据处理管道系统提供完整的架构设计和实现指南

---

## 目录

1. [背景与问题](#1-背景与问题)
2. [架构设计](#2-架构设计)
3. [核心组件](#3-核心组件)
4. [注册表模式](#4-注册表模式)
5. [通用管道系统](#5-通用管道系统)
6. [数据适配器系统](#6-数据适配器系统)
7. [使用指南](#7-使用指南)
8. [最佳实践](#8-最佳实践)
9. [扩展指南](#9-扩展指南)

---

## 1. 背景与问题

### 1.1 现状问题

在实际项目中，我们经常遇到以下痛点：

#### 问题一：数据处理分散化

```
当前架构：
实体管理 → HTTP管道 → [分散的preset判断] → 返回结果
                ↓
        各处理器内部判断 if (preset === 'abp') {...}
```

**问题表现**：
- 数据处理逻辑分散在多个处理器中
- ABP/Spring 等后端适配通过 `preset` 条件判断分散在各处
- 实体管理器和 HTTP 层的职责边界不够清晰

#### 问题二：钩子函数爆炸

```
项目场景：
├── 域A (ABP后端)
│   ├── 用户管理: PagedResultDto<UserDto>
│   ├── 订单管理: AjaxResponse<List<OrderDto>>
│   └── 商品管理: { success: true, data: ProductDto }
│
├── 域B (Spring后端)
│   ├── 支付服务: Result<Payment> { code, message, data }
│   └── 库存服务: Page<Inventory> { content, totalElements }
│
├── 域C (老旧系统)
│   ├── 报表服务: { status: 200, result: { list, total } }
│   └── 导出服务: { errorCode: 0, data: Blob }
│
└── 域D (第三方API)
    └── 开放平台: { errcode: 0, errmsg: 'ok', data: {...} }
```

**问题表现**：
- 每个实体管理器都要写一堆钩子函数
- 10+ 种不同的数据结构需要手动处理
- 多域场景下钩子数量爆炸
- 代码重复率高，维护成本大

#### 问题三：特殊处理困难

```
ABP 后端的特殊情况：
├── 标准接口: PagedResultDto<T>
├── 特殊接口1: 自定义分页结构
├── 特殊接口2: 需要额外的数据转换
├── 特殊接口3: 需要注入特殊 Header
└── 特殊接口4: 需要自定义错误处理
```

**问题表现**：
- 特殊处理需要修改核心代码
- 无法灵活扩展
- 难以复用处理逻辑

### 1.2 解决目标

1. **彻底解决钩子爆炸问题** - 无需在每个实体管理器中写钩子
2. **支持多域多后端** - 每个域可以有不同的数据结构
3. **零配置开箱即用** - 内置常用适配器，自动识别
4. **灵活扩展** - 支持自定义适配器和管道
5. **高复用率** - 通用管道可复用，减少重复代码

---

## 2. 架构设计

### 2.1 核心架构流程

```
┌─────────────────────────────────────────────────────────────┐
│  实体管理器 (EntityManager)                                  │
│  - 状态管理、事件发射                                        │
│  - 协调管道执行                                              │
└─────────────────────────────────────────────────────────────┘
          ↓                                    ↑
┌──────────────────────────┐    ┌──────────────────────────┐
│  数据前导处理管道         │    │  数据后道处理管道         │
│  (DataPrePipeline)       │    │  (DataPostPipeline)      │
│  - 参数对齐               │    │  - 数据提取               │
│  - 请求转换               │    │  - 错误处理               │
│  - 业务逻辑注入           │    │  - 结果对齐               │
└──────────────────────────┘    └──────────────────────────┘
          ↓                                    ↑
┌─────────────────────────────────────────────────────────────┐
│  HTTP 管道 (HttpPipeline)                                   │
│  [PREPARE → EXCHANGE → PROCESS → ALIGN]                      │
│  - URL构建、Header注入                                       │
│  - Fetch/XHR传输                                             │
│  - JSON解析、基础错误处理                                     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 包结构设计

```
@orbitjs/
├── core                          # 核心包
│   ├── entity-manager            # 实体管理器
│   ├── http                      # HTTP 管道
│   └── pipeline                   # 管道执行器
│
├── data-processor                # 数据处理核心包
│   ├── registrar                 # 数据处理注册器
│   ├── pipeline                   # 前导/后道管道
│   ├── adapters                   # 数据适配器
│   ├── common                     # 通用管道
│   └── types                      # 类型定义
│
├── data-processor-abp            # ABP 数据处理包 [独立包]
│   ├── pre-pipeline              # ABP 前导管道
│   ├── post-pipeline             # ABP 后道管道
│   └── index.ts                  # 导出和注册
│
├── data-processor-spring         # Spring 数据处理包 [独立包]
│   ├── pre-pipeline              # Spring 前导管道
│   ├── post-pipeline             # Spring 后道管道
│   └── index.ts                  # 导出和注册
│
└── data-processor-custom         # 自定义数据处理包 [可选]
```

### 2.3 职责划分

| 组件 | 职责 | 说明 |
|------|------|------|
| **实体管理器** | 状态管理、事件发射、协调管道 | 不处理具体数据转换 |
| **数据前导管道** | 请求参数处理、转换、注入 | 处理发送前的数据 |
| **HTTP 管道** | 传输、基础解析、错误处理 | 专注于网络传输 |
| **数据后道管道** | 响应数据处理、错误处理 | 处理接收后的数据 |
| **数据适配器** | 自动识别和提取数据 | 支持多种数据结构 |
| **通用管道** | 可复用的处理逻辑 | 提高代码复用率 |

---

## 3. 核心组件

### 3.1 数据处理注册器

**位置**: `packages/data-processor/src/registrar/DataProcessorRegistrar.ts`

**设计模式**: 参考 `src/registry/registrars/RegistrarBase.ts` 的实现

```typescript
import { RegistrarBase } from '@orbitjs/core';

/**
 * 数据处理注册器
 * 继承自 RegistrarBase，遵循注册表模式
 */
export class DataProcessorRegistrar extends RegistrarBase<Map<string, DataPipelineSet>> {
    public readonly name = 'data-processor';
    protected storage = new Map<string, DataPipelineSet>();
    
    /**
     * 注册数据处理管道集
     */
    register(preset: PresetType, pipelines: DataPipelineSet): void {
        this.checkLock();
        this.storage.set(preset, pipelines);
    }
    
    /**
     * 获取指定 preset 的管道集
     */
    get(preset: PresetType): DataPipelineSet | undefined {
        return this.storage.get(preset);
    }
    
    /**
     * 执行前导管道
     */
    async executePrePipeline(context: FlowContext): Promise<void> {
        const pipelines = this.get(context.config.preset);
        if (pipelines?.prePipeline) {
            await pipelines.prePipeline.execute(context);
        }
    }
    
    /**
     * 执行后道管道
     */
    async executePostPipeline(context: FlowContext): Promise<void> {
        const pipelines = this.get(context.config.preset);
        if (pipelines?.postPipeline) {
            await pipelines.postPipeline.execute(context);
        }
    }
    
    /**
     * 调试输出
     */
    protected doInspect(): void {
        console.group('🔧 Data Processor Registry');
        const table: any = {};
        this.storage.forEach((pipelines, preset) => {
            table[preset] = {
                prePipeline: pipelines.prePipeline ? '✅' : '❌',
                postPipeline: pipelines.postPipeline ? '✅' : '❌',
            };
        });
        console.table(table);
        console.groupEnd();
    }
    
    static getInstance(): DataProcessorRegistrar {
        return super.getInstance();
    }
}

/**
 * 数据管道集合
 */
export interface DataPipelineSet {
    preset: PresetType;
    prePipeline: DataPipeline;   // 前导管道
    postPipeline: DataPipeline;  // 后道管道
}
```

### 3.2 管道执行器

**位置**: `packages/data-processor/src/pipeline/DataPipeline.ts`

```typescript
/**
 * 数据处理管道基类
 * 支持权重排序和动态插入
 */
export class DataPipeline {
    private handlers: DataPipelineHandler[] = [];
    private sortedCache: DataPipelineHandler[] | null = null;
    
    /**
     * 添加处理器
     */
    use(handler: DataPipelineHandler): this {
        this.handlers.push(handler);
        this.sortedCache = null;
        return this;
    }
    
    /**
     * 执行管道
     */
    async execute(context: FlowContext): Promise<void> {
        const sorted = this.getSortedHandlers();
        
        for (const handler of sorted) {
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
     * 获取排序后的处理器（按权重降序）
     */
    private getSortedHandlers(): DataPipelineHandler[] {
        if (this.sortedCache) {
            return this.sortedCache;
        }
        
        this.sortedCache = [...this.handlers].sort((a, b) => {
            return (b.weight ?? 100) - (a.weight ?? 100);
        });
        
        return this.sortedCache;
    }
}

/**
 * 处理器定义
 */
export interface DataPipelineHandler {
    name: string;
    handle: (context: FlowContext) => Promise<void>;
    weight?: number;  // 权重，默认 100
    shouldExecute?: (context: FlowContext) => boolean;  // 条件执行
}
```

### 3.3 管道扩展器

**位置**: `packages/data-processor/src/pipeline/PipelineExtension.ts`

```typescript
/**
 * 管道扩展器
 * 提供灵活的管道扩展能力
 */
export class PipelineExtension {
    /**
     * 在指定处理器之前插入
     */
    static insertBefore(
        pipeline: DataPipeline,
        targetName: string,
        handler: DataPipelineHandler
    ): void {
        const handlers = pipeline['handlers'] as DataPipelineHandler[];
        const index = handlers.findIndex(h => h.name === targetName);
        
        if (index !== -1) {
            handlers.splice(index, 0, handler);
            pipeline['sortedCache'] = null;
        }
    }
    
    /**
     * 在指定处理器之后插入
     */
    static insertAfter(
        pipeline: DataPipeline,
        targetName: string,
        handler: DataPipelineHandler
    ): void {
        const handlers = pipeline['handlers'] as DataPipelineHandler[];
        const index = handlers.findIndex(h => h.name === targetName);
        
        if (index !== -1) {
            handlers.splice(index + 1, 0, handler);
            pipeline['sortedCache'] = null;
        }
    }
    
    /**
     * 替换指定处理器
     */
    static replace(
        pipeline: DataPipeline,
        targetName: string,
        handler: DataPipelineHandler
    ): void {
        const handlers = pipeline['handlers'] as DataPipelineHandler[];
        const index = handlers.findIndex(h => h.name === targetName);
        
        if (index !== -1) {
            handlers[index] = handler;
            pipeline['sortedCache'] = null;
        }
    }
    
    /**
     * 移除指定处理器
     */
    static remove(
        pipeline: DataPipeline,
        targetName: string
    ): void {
        const handlers = pipeline['handlers'] as DataPipelineHandler[];
        const index = handlers.findIndex(h => h.name === targetName);
        
        if (index !== -1) {
            handlers.splice(index, 1);
            pipeline['sortedCache'] = null;
        }
    }
}
```

---

## 4. 注册表模式

### 4.1 设计原则

参考 `src/registry` 的实现，数据处理系统遵循以下原则：

1. **单例模式**: 每个注册器全局唯一
2. **锁定机制**: 防止运行时修改配置
3. **统一接口**: 继承 `RegistrarBase` 基类
4. **类型安全**: 完整的 TypeScript 类型定义
5. **调试友好**: 提供 `inspect()` 方法

### 4.2 注册器集成

```typescript
// packages/data-processor/src/index.ts

import { RegistryHub } from '@orbitjs/core';
import { DataProcessorRegistrar } from './registrar/DataProcessorRegistrar';
import { DataAdapterRegistrar } from './adapters/DataAdapterRegistrar';
import { CommonPipelineRegistry } from './common/CommonPipelineRegistry';

// 初始化数据处理注册器
RegistryHub.use(DataProcessorRegistrar.getInstance());
RegistryHub.use(DataAdapterRegistrar.getInstance());
RegistryHub.use(CommonPipelineRegistry.getInstance());

// 导出便捷访问
export const DataProcessor = DataProcessorRegistrar.getInstance();
export const DataAdapter = DataAdapterRegistrar.getInstance();
export const CommonPipeline = CommonPipelineRegistry.getInstance();
```

### 4.3 使用方式

```typescript
// 通过 Registry 访问
Registry.dataProcessor.register('abp', abpPipelines);
Registry.dataAdapter.register(AbpPagedResultAdapter);
Registry.commonPipeline.register(PaginationTransformPipeline);

// 或直接使用导出的实例
DataProcessor.register('abp', abpPipelines);
DataAdapter.register(AbpPagedResultAdapter);
CommonPipeline.register(PaginationTransformPipeline);
```

---

## 5. 通用管道系统

### 5.1 通用管道注册器

**位置**: `packages/data-processor/src/common/CommonPipelineRegistry.ts`

```typescript
/**
 * 通用管道定义
 */
export interface CommonPipelineDefinition {
    name: string;
    category: 'param' | 'data' | 'error' | 'utility';
    description: string;
    handler: DataPipelineHandler;
    options?: any;
    tags?: string[];
}

/**
 * 通用管道注册器
 */
export class CommonPipelineRegistry extends RegistrarBase<Map<string, CommonPipelineDefinition>> {
    public readonly name = 'common-pipeline';
    protected storage = new Map<string, CommonPipelineDefinition>();
    
    /**
     * 注册通用管道
     */
    register(definition: CommonPipelineDefinition): void {
        this.checkLock();
        this.storage.set(definition.name, definition);
    }
    
    /**
     * 创建管道实例（可配置参数）
     */
    createInstance(
        name: string,
        options?: any
    ): DataPipelineHandler | undefined {
        const definition = this.storage.get(name);
        if (!definition) return undefined;
        
        if (options) {
            return {
                ...definition.handler,
                name: `${definition.name}-${JSON.stringify(options)}`,
                handle: async (ctx: FlowContext) => {
                    ctx.metadata.pipelineOptions = options;
                    await definition.handler.handle(ctx);
                }
            };
        }
        
        return definition.handler;
    }
    
    /**
     * 按类别获取
     */
    getByCategory(category: string): CommonPipelineDefinition[] {
        return Array.from(this.storage.values())
            .filter(p => p.category === category);
    }
    
    protected doInspect(): void {
        console.group('📦 Common Pipeline Registry');
        
        const categories = {
            param: this.getByCategory('param'),
            data: this.getByCategory('data'),
            error: this.getByCategory('error'),
            utility: this.getByCategory('utility'),
        };
        
        Object.entries(categories).forEach(([cat, pipelines]) => {
            console.log(`\n[${cat}] (${pipelines.length})`);
            pipelines.forEach(p => {
                console.log(`  - ${p.name}: ${p.description}`);
            });
        });
        
        console.groupEnd();
    }
    
    static getInstance(): CommonPipelineRegistry {
        return super.getInstance();
    }
}
```

### 5.2 内置通用管道

#### 参数转换类

| 管道名称 | 说明 | 标签 |
|---------|------|------|
| `pagination-transform` | 分页参数转换，支持 ABP/Spring/Offset | pagination, param |
| `sort-transform` | 排序参数转换，支持多种格式 | sort, param |
| `date-param-transform` | 日期参数格式转换 | date, param |
| `filter-transform` | 过滤参数转换，支持 OData/GraphQL | filter, param |

#### 数据转换类

| 管道名称 | 说明 | 标签 |
|---------|------|------|
| `date-format` | 日期字段格式化 | date, data |
| `enum-translate` | 枚举字段翻译 | enum, data |
| `price-transform` | 价格单位转换（分 ↔ 元） | price, data |
| `field-mapping` | 字段名称映射 | mapping, data |
| `flatten-nested` | 嵌套字段展开 | flatten, data |

#### 工具类

| 管道名称 | 说明 | 标签 |
|---------|------|------|
| `logging` | 请求/响应日志记录 | log, utility |
| `performance-monitor` | 性能监控和统计 | performance, utility |
| `data-validation` | 响应数据校验 | validation, utility |
| `cache-control` | 响应缓存控制 | cache, utility |

### 5.3 使用示例

```typescript
import { CommonPipeline } from '@orbitjs/data-processor';

// 获取通用管道实例
const paginationPipeline = CommonPipeline.createInstance('pagination-transform', {
    mode: 'abp'
});

const dateFormatPipeline = CommonPipeline.createInstance('date-format', {
    fields: ['createdAt', 'updatedAt'],
    format: 'locale'
});

const enumPipeline = CommonPipeline.createInstance('enum-translate', {
    maps: {
        status: {
            0: '禁用',
            1: '启用',
        }
    }
});

// 在管道中使用
const prePipeline = new DataPipeline();
prePipeline.use(paginationPipeline!);

const postPipeline = new DataPipeline();
postPipeline.use(dateFormatPipeline!);
postPipeline.use(enumPipeline!);
```

---

## 6. 数据适配器系统

### 6.1 数据适配器注册器

**位置**: `packages/data-processor/src/adapters/DataAdapterRegistrar.ts`

```typescript
/**
 * 数据结构适配器接口
 */
export interface DataAdapter {
    name: string;
    
    /**
     * 识别函数：判断响应数据是否匹配此适配器
     */
    recognize(raw: any, context: FlowContext): boolean;
    
    /**
     * 提取列表数据
     */
    extractList?(raw: any, context: FlowContext): { list: any[]; total?: number };
    
    /**
     * 提取单项数据
     */
    extractItem?(raw: any, context: FlowContext): any;
    
    /**
     * 提取错误信息
     */
    extractError?(raw: any, context: FlowContext): { code: string | number; message: string; details?: any };
    
    /**
     * 判断是否成功
     */
    isSuccess?(raw: any, context: FlowContext): boolean;
    
    /**
     * 优先级（数字越大优先级越高）
     */
    priority?: number;
}

/**
 * 数据适配器注册器
 */
export class DataAdapterRegistrar extends RegistrarBase<Map<string, DataAdapter>> {
    public readonly name = 'data-adapter';
    protected storage = new Map<string, DataAdapter>();
    
    /**
     * 注册适配器
     */
    register(adapter: DataAdapter): void {
        this.checkLock();
        this.storage.set(adapter.name, adapter);
    }
    
    /**
     * 自动识别并提取数据
     */
    autoExtract(raw: any, context: FlowContext): {
        adapter: DataAdapter | null;
        list?: any[];
        item?: any;
        total?: number;
        error?: any;
        success: boolean;
    } {
        const sorted = this.getSortedAdapters();
        
        for (const adapter of sorted) {
            if (adapter.recognize(raw, context)) {
                const result: any = {
                    adapter,
                    success: true,
                };
                
                if (adapter.isSuccess && !adapter.isSuccess(raw, context)) {
                    result.success = false;
                }
                
                if (adapter.extractError) {
                    const error = adapter.extractError(raw, context);
                    if (error) {
                        result.error = error;
                        result.success = false;
                    }
                }
                
                if (adapter.extractList) {
                    const listData = adapter.extractList(raw, context);
                    if (listData) {
                        result.list = listData.list;
                        result.total = listData.total;
                    }
                }
                
                if (adapter.extractItem) {
                    const item = adapter.extractItem(raw, context);
                    if (item !== undefined) {
                        result.item = item;
                    }
                }
                
                return result;
            }
        }
        
        return {
            adapter: null,
            item: raw,
            success: true,
        };
    }
    
    protected doInspect(): void {
        console.group('🔌 Data Adapter Registry');
        const table: any = {};
        
        this.getSortedAdapters().forEach(adapter => {
            table[adapter.name] = {
                priority: adapter.priority ?? 0,
                hasExtractList: adapter.extractList ? '✅' : '❌',
                hasExtractItem: adapter.extractItem ? '✅' : '❌',
                hasExtractError: adapter.extractError ? '✅' : '❌',
            };
        });
        
        console.table(table);
        console.groupEnd();
    }
    
    private getSortedAdapters(): DataAdapter[] {
        return Array.from(this.storage.values())
            .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }
    
    static getInstance(): DataAdapterRegistrar {
        return super.getInstance();
    }
}
```

### 6.2 内置数据适配器

| 适配器名称 | 数据结构 | 优先级 |
|-----------|---------|--------|
| `abp-paged-result` | `{ items: T[], totalCount: number }` | 100 |
| `abp-ajax-response` | `{ success: boolean, result: T, error: {...} }` | 90 |
| `spring-result` | `{ code: number, message: string, data: T }` | 100 |
| `spring-page` | `{ content: T[], totalElements: number }` | 100 |
| `common-success` | `{ success: boolean, data: T }` | 80 |
| `open-platform` | `{ errcode: number, errmsg: string, data: T }` | 100 |
| `legacy-system` | `{ status: number, result: T }` | 90 |
| `pure-array` | `T[]` | 50 |

### 6.3 自动提取处理器

```typescript
/**
 * 自动数据提取处理器
 * 无需任何配置，自动识别数据结构并提取
 */
export const AutoExtractHandler: DataPipelineHandler = {
    name: 'auto-extract',
    weight: 100,
    
    handle: async (context: FlowContext) => {
        const raw = context.data.raw;
        
        const result = DataAdapter.getInstance().autoExtract(raw, context);
        
        if (result.list) {
            context.data.list = result.list;
        }
        
        if (result.item) {
            context.data.item = result.item;
        }
        
        if (result.total !== undefined) {
            context.data.total = result.total;
        }
        
        if (result.error) {
            context.error = result.error;
            context.metadata.hasError = true;
        }
        
        context.metadata.adapterUsed = result.adapter?.name;
        context.metadata.success = result.success;
    },
};
```

---

## 7. 使用指南

### 7.1 基础使用

#### 步骤 1：初始化

```typescript
// main.ts

import { Registry } from '@orbitjs/core';
import { 
    registerCommonPipelines,
    registerBuiltinAdapters 
} from '@orbitjs/data-processor';
import createAbpDataPipeline from '@orbitjs/data-processor-abp';

// 1. 注册通用管道
registerCommonPipelines();

// 2. 注册内置适配器
registerBuiltinAdapters();

// 3. 注册 ABP 数据管道
createAbpDataPipeline();

// 4. 配置域
Registry.domain.register('api', {
    baseUrl: 'https://api.example.com',
    preset: 'abp',
    pageSize: 20,
    pagesizes: [10, 20, 50, 100],
});

// 5. 锁定注册表（可选）
RegistryHub.lock();
```

#### 步骤 2：使用实体管理器

```typescript
// 无需任何钩子！
class UserManager extends BaseEntityManager {
    async getList() {
        return await this.request('list', { url: '/users' });
        // 自动识别 ABP PagedResultDto
        // 自动提取 list 和 total
        // 自动处理错误
    }
}
```

### 7.2 自定义适配器

```typescript
import { DataAdapter } from '@orbitjs/data-processor';

const CustomAdapter: DataAdapter = {
    name: 'my-custom-adapter',
    priority: 110,
    
    recognize(raw: any) {
        return raw && raw.__type === 'MyCustomResponse';
    },
    
    extractList(raw) {
        return {
            list: raw.payload.records,
            total: raw.payload.count,
        };
    },
    
    extractError(raw) {
        if (raw.status !== 'OK') {
            return {
                code: raw.status,
                message: raw.reason,
            };
        }
        return undefined;
    },
};

// 注册
DataAdapter.register(CustomAdapter);
```

### 7.3 实体级别配置

```typescript
import { EntityPipelineConfigManager, CommonPipeline } from '@orbitjs/data-processor';

const configManager = EntityPipelineConfigManager.getInstance();

// 用户管理：使用通用管道
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

### 7.4 管道扩展

```typescript
import { PipelineExtension } from '@orbitjs/data-processor';

// 获取 ABP 管道
const pipelines = DataProcessor.get('abp');

// 在指定位置插入处理器
PipelineExtension.insertAfter(
    pipelines!.postPipeline,
    'abp-data-extract',
    {
        name: 'custom-transform',
        weight: 90,
        handle: async (ctx) => {
            // 自定义处理逻辑
        }
    }
);

// 替换处理器
PipelineExtension.replace(
    pipelines!.postPipeline,
    'abp-error-handle',
    {
        name: 'custom-error-handle',
        weight: 90,
        handle: async (ctx) => {
            // 自定义错误处理
        }
    }
);
```

---

## 8. 最佳实践

### 8.1 项目结构建议

```
src/
├── config/
│   ├── data-processor.config.ts    # 数据处理配置
│   ├── domains.config.ts           # 域配置
│   └── index.ts                    # 配置入口
│
├── adapters/
│   ├── custom-adapter.ts           # 自定义适配器
│   └── index.ts
│
├── pipelines/
│   ├── custom-pipeline.ts          # 自定义管道
│   └── index.ts
│
└── main.ts                         # 应用入口
```

### 8.2 配置文件示例

```typescript
// config/data-processor.config.ts

import { 
    DataProcessor,
    DataAdapter,
    CommonPipeline,
    EntityPipelineConfigManager 
} from '@orbitjs/data-processor';

// 1. 注册自定义适配器
import { customAdapters } from '../adapters';
customAdapters.forEach(adapter => DataAdapter.register(adapter));

// 2. 配置实体管道
const configManager = EntityPipelineConfigManager.getInstance();

// 用户管理
configManager.configure('abp-api', 'user', {
    postPipeline: {
        insert: [
            CommonPipeline.createInstance('date-format', {
                fields: ['creationTime', 'lastModificationTime']
            })!,
            CommonPipeline.createInstance('enum-translate', {
                maps: {
                    status: { 0: '禁用', 1: '启用' }
                }
            })!,
        ]
    }
});

// 订单管理
configManager.configure('abp-api', 'order', {
    postPipeline: {
        insert: [
            CommonPipeline.createInstance('price-transform', {
                fields: ['amount', 'totalPrice']
            })!,
            CommonPipeline.createInstance('enum-translate', {
                maps: {
                    status: {
                        'PENDING': '待支付',
                        'PAID': '已支付',
                        'SHIPPED': '已发货',
                    }
                }
            })!,
        ]
    }
});
```

### 8.3 调试技巧

```typescript
// 查看所有注册器状态
RegistryHub.debug();

// 查看特定注册器
RegistryHub.debug('data-processor', 'data-adapter', 'common-pipeline');

// 查看管道执行步骤
const result = await userManager.getList();
console.log(result.steps); // 查看执行轨迹
console.log(result.metadata.adapterUsed); // 查看使用的适配器
```

### 8.4 性能优化

```typescript
// 1. 使用管道缓存
// 管道会自动缓存排序结果，避免重复计算

// 2. 条件执行
const handler = {
    name: 'conditional-handler',
    weight: 100,
    shouldExecute: (ctx) => {
        // 只在特定条件下执行
        return ctx.entityName === 'user';
    },
    handle: async (ctx) => {
        // 处理逻辑
    }
};

// 3. 批量注册
DataAdapter.registerAll([
    Adapter1,
    Adapter2,
    Adapter3,
]);
```

---

## 9. 扩展指南

### 9.1 创建新的数据处理包

#### 步骤 1：创建包结构

```
packages/data-processor-nestjs/
├── src/
│   ├── pre-pipeline.ts
│   ├── post-pipeline.ts
│   └── index.ts
├── package.json
└── README.md
```

#### 步骤 2：实现管道

```typescript
// src/pre-pipeline.ts

import { DataPipeline, DataPipelineHandler } from '@orbitjs/data-processor';

const NestJsPreHandlers: DataPipelineHandler[] = [
    {
        name: 'nestjs-pagination',
        weight: 100,
        handle: async (ctx) => {
            // NestJS 特定的分页处理
        }
    }
];

export { NestJsPreHandlers };
```

#### 步骤 3：注册管道

```typescript
// src/index.ts

import { DataProcessor, DataPipeline } from '@orbitjs/data-processor';
import { NestJsPreHandlers } from './pre-pipeline';
import { NestJsPostHandlers } from './post-pipeline';

export function createNestJsDataPipeline(): void {
    const prePipeline = new DataPipeline();
    NestJsPreHandlers.forEach(handler => prePipeline.use(handler));
    
    const postPipeline = new DataPipeline();
    NestJsPostHandlers.forEach(handler => postPipeline.use(handler));
    
    DataProcessor.register('nestjs', {
        preset: 'nestjs',
        prePipeline,
        postPipeline,
    });
}

export default createNestJsDataPipeline;
```

### 9.2 创建新的通用管道

```typescript
// pipelines/custom-pipeline.ts

import { CommonPipelineDefinition } from '@orbitjs/data-processor';

export const CustomPipeline: CommonPipelineDefinition = {
    name: 'custom-transform',
    category: 'data',
    description: '自定义数据转换',
    tags: ['custom', 'data'],
    
    handler: {
        name: 'custom-transform',
        weight: 80,
        
        handle: async (ctx) => {
            const options = ctx.metadata.pipelineOptions || {};
            
            // 自定义处理逻辑
            if (ctx.data.list) {
                ctx.data.list = ctx.data.list.map(item => {
                    // 转换逻辑
                    return transformedItem;
                });
            }
        }
    }
};

// 注册
CommonPipeline.register(CustomPipeline);
```

### 9.3 创建新的数据适配器

```typescript
// adapters/custom-adapter.ts

import { DataAdapter } from '@orbitjs/data-processor';

export const CustomAdapter: DataAdapter = {
    name: 'custom-adapter',
    priority: 100,
    
    recognize(raw: any, ctx: FlowContext) {
        // 识别逻辑
        return raw && raw.customFlag === true;
    },
    
    extractList(raw, ctx) {
        // 提取列表数据
        return {
            list: raw.data.items,
            total: raw.data.total,
        };
    },
    
    extractItem(raw, ctx) {
        // 提取单项数据
        return raw.data;
    },
    
    extractError(raw, ctx) {
        // 提取错误
        if (raw.error) {
            return {
                code: raw.error.code,
                message: raw.error.message,
            };
        }
        return undefined;
    },
    
    isSuccess(raw, ctx) {
        // 判断是否成功
        return raw.success === true;
    }
};

// 注册
DataAdapter.register(CustomAdapter);
```

---

## 10. 总结

### 10.1 核心优势

| 特性 | 传统方案 | 新方案 |
|------|---------|--------|
| **代码量** | 每个实体都要写钩子 | 零钩子 ✅ |
| **维护成本** | 高，分散在各处 | 低，集中管理 ✅ |
| **扩展性** | 需修改每个实体 | 注册适配器即可 ✅ |
| **多域支持** | 每个域都要写钩子 | 自动识别 ✅ |
| **复用率** | 约 20% | 约 80% ✅ |
| **调试难度** | 高，逻辑分散 | 低，可视化工具 ✅ |
| **学习曲线** | 需了解每个后端 | 零配置即可用 ✅ |

### 10.2 关键设计点

1. **注册表模式**: 遵循 `src/registry` 的设计，确保一致性和可维护性
2. **管道架构**: 前导管道 + HTTP 管道 + 后道管道，职责清晰
3. **数据适配器**: 自动识别 10+ 种数据结构，零配置使用
4. **通用管道**: 13 个内置管道，80%+ 复用率
5. **灵活扩展**: 支持插入、替换、移除处理器
6. **独立包**: ABP/Spring 等作为独立包，按需引入

### 10.3 迁移路径

```
阶段 1：创建新架构（不破坏现有代码）
  ├── 创建数据处理注册器
  ├── 实现数据适配器
  └── 实现通用管道

阶段 2：并行运行验证
  ├── 同时运行新旧逻辑
  ├── 对比结果确保一致性
  └── 编写单元测试

阶段 3：逐步迁移
  ├── 修改实体管理器集成新管道
  ├── 移除旧的分散处理逻辑
  └── 更新文档和示例

阶段 4：发布和推广
  ├── 发布独立包到 npm
  ├── 提供迁移指南
  └── 收集社区反馈
```

---

## 附录

### A. 类型定义

```typescript
// types/index.ts

export interface FlowContext {
    readonly domain: string;
    readonly entityName?: string;
    readonly action?: ENTITY_ACTION;
    config: DomainConfig;
    params: any;
    error: any | null;
    schema?: Schema;
    isAborted: boolean;
    
    metadata: {
        isTransportFailure: boolean;
        hasError: boolean;
        contentType: string;
        isJson: boolean;
        isText: boolean;
        isBlob: boolean;
        action: string;
        isUpload: boolean;
        isDownload: boolean;
        isErrorHandled: boolean;
        isProcessed?: boolean;
        fileName?: string;
        isDownloadHandled?: boolean;
        [key: string]: any;
    };
    
    data: {
        source: any;
        parsed: any;
        raw: any | null;
        list: any[];
        item: any;
        total: number;
        pagination?: {
            isRequestAligned: boolean;
            isResponseAligned: boolean;
            total: number;
            pageSize: number;
            pageIndex: number;
        };
    };
    
    http: {
        url: string;
        status: number;
        isSuccess: boolean;
        headers: Record<string, string>;
        method: HttpMethod;
        rawResponse?: any;
        queryParams?: Record<string, any>;
        body?: any;
        pathParams: (string | number)[];
        timeout: number;
        responseType: HttpResponseType;
        withCredentials?: boolean;
        signal?: AbortSignal;
        onProgress?: (ev: ProgressEvent) => void;
        controller: AbortController;
        responseHeaders: Record<string, string>;
    };
    
    steps: ExecutionStep[];
    alignToFrontend(target: any): any;
}

export interface ExecutionStep {
    name: string;
    duration: number;
    status: string;
}
```

### B. 错误码定义

```typescript
// errors.ts

export enum DataProcessorErrorCode {
    PIPELINE_NOT_FOUND = 'PIPELINE_NOT_FOUND',
    ADAPTER_NOT_FOUND = 'ADAPTER_NOT_FOUND',
    HANDLER_EXECUTION_FAILED = 'HANDLER_EXECUTION_FAILED',
    INVALID_PIPELINE_CONFIG = 'INVALID_PIPELINE_CONFIG',
    DATA_EXTRACT_FAILED = 'DATA_EXTRACT_FAILED',
}
```

### C. 参考资源

- [注册表设计文档](../src/registry/README.md)
- [管道执行器源码](../src/kernel/pipeline/runner.ts)
- [实体管理器源码](../src/entity/manager/CoreEntityManager.ts)
- [HTTP 客户端源码](../src/kernel/http/HttpClient.ts)

---

**文档维护者**: OrbitJS 团队  
**最后更新**: 2026-06-13  
**反馈渠道**: GitHub Issues
