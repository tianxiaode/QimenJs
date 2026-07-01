# 数据处理管道最佳实践

## 理解数据处理管道

数据处理管道是 HTTP 管道的扩展，专门处理不同后端框架的数据格式差异。它通过标签（tags）机制与 HTTP 管道协同工作：

```
HTTP 管道（8 个内置处理器）
  │
  ├─ PREPARE 阶段
  │   CommonParamsEnricher → TokenInjector → UrlBuilder
  │
  ├─ EXCHANGE 阶段
  │   FetchTransport / XhrTransport
  │
  ├─ PROCESS 阶段
  │   ResponseAnalyzer → DataParser
  │
  └─ ALIGN 阶段
      DownloadInterceptor

数据处理管道（按需引入）
  │
  ├─ 前道（pre）— 在 HTTP 请求前处理参数
  │   abp-pagination / spring-pagination
  │   abp-tenant-header
  │
  └─ 后道（post）— 在 HTTP 响应后处理数据
      abp-extract / spring-extract
      abp-audit-clean / abp-soft-delete-filter
      abp-error / spring-error
```

## 1. 按后端类型引入对应的处理器包

```typescript
// ABP 后端
import '@orbitjs/data-processor-abp';

// Spring 后端
import '@orbitjs/data-processor-spring';

// 两者都用（不同 domain 对接不同后端）
import '@orbitjs/data-processor-abp';
import '@orbitjs/data-processor-spring';
```

**原因**：引入即自动注册，不需要手动调用注册函数。ABP 和 Spring 的处理器通过标签（`abp` / `spring`）区分，不会冲突。

## 2. 分页参数用前端格式，让管道自动转换

```typescript
// 正确 - 统一用前端格式
const ctx = await client.get('/users', {
  data: { params: { pageIndex: 1, pageSize: 20 } },
});

// ABP 管道自动转换为：?skipCount=20&takeCount=20
// Spring 管道自动转换为：?page=1&size=20
```

**原因**：前端代码不应该关心后端的分页格式。`abp-pagination` 将 `pageIndex/pageSize` 转为 `skipCount/takeCount`，`spring-pagination` 转为 `page/size`。切换后端只需换处理器包，业务代码不变。

## 3. 响应数据从 context.data 取，不要从 response.data 取

```typescript
// ABP 后端返回 PagedResultDto
// { items: [...], totalCount: 100 }
//
// Spring 后端返回 Page<T>
// { content: [...], totalElements: 100, ... }
//
// 两种格式经过管道处理后，context.data 结构一致：

const ctx = await client.get('/users');
ctx.data.list;          // 列表数据（统一）
ctx.data.total;         // 总数（统一）
ctx.data.pagination;    // 分页信息（统一）
ctx.data.item;          // 单项数据
```

**原因**：`abp-extract` 和 `spring-extract` 将各自后端的分页格式解包为统一的 `context.data` 结构。业务代码不需要判断后端类型。

## 4. 自定义配置时调用注册函数

```typescript
// 默认配置（引入即生效）
import '@orbitjs/data-processor-abp';

// 自定义配置
import { registerAbpHandlers } from '@orbitjs/data-processor-abp';
registerAbpHandlers({
  tenantId: 'my-tenant',       // 注入 __tenant Header
  defaultPageSize: 20,          // 默认每页 20 条
  removeAuditFields: true,      // 移除审计字段
  filterSoftDeleted: true,      // 过滤软删除记录
});

import { registerSpringHandlers } from '@orbitjs/data-processor-spring';
registerSpringHandlers({
  defaultPageSize: 20,          // 默认每页 20 条
  zeroBasedPageIndex: true,     // Spring 标准 0-based 页码
});
```

## 5. ABP 审计字段和软删除由管道自动处理

```typescript
// ABP 后端返回的实体通常包含审计字段：
// { id: 1, name: 'test', creationTime: '...', creatorId: '...', isDeleted: false }
//
// 管道自动处理：
// - abp-audit-clean: 移除 creationTime, creatorId, lastModificationTime 等
// - abp-soft-delete-filter: 过滤 isDeleted=true 的记录

const ctx = await client.get('/users');
ctx.data.list;  // 已移除审计字段，已过滤软删除记录
```

**原因**：审计字段是后端基础设施数据，前端通常不需要。软删除记录在列表中应该被过滤。这些逻辑放在管道中统一处理，避免每个组件重复过滤。

## 6. 按需注册单个处理器

```typescript
import { DataProcessor } from '@orbitjs/data-processor';
import { createAbpPaginationHandler } from '@orbitjs/data-processor-abp';
import { createSpringExtractHandler } from '@orbitjs/data-processor-spring';

// 只注册需要的处理器
DataProcessor.register(createAbpPaginationHandler({ defaultPageSize: 50 }));
DataProcessor.register(createSpringExtractHandler());
```

**原因**：如果只需要部分功能（如只要分页转换，不要审计清理），可以单独注册处理器，而不是注册整个管道。

## 7. 管道执行顺序由权重决定

```
前道管道（pre）执行顺序：
  TRANSFORM (1000)   abp-pagination / spring-pagination
  ENRICHMENT (3000)  abp-tenant-header

后道管道（post）执行顺序：
  EXTRACT (5000)     abp-extract / spring-extract
  ALIGN (6000)       abp-audit-clean → abp-soft-delete-filter
  ERROR (7000)       abp-error / spring-error
```

**原因**：处理器按 `weight + offset` 升序执行。同阶段内通过 `offset` 微调顺序。不要依赖注册顺序，始终通过权重控制。

## 反模式清单

| 反模式 | 正确做法 |
|--------|----------|
| 手动转换分页参数格式 | 引入处理器包，用前端格式传参 |
| 从 response.data 手动解包 PagedResultDto | 从 context.data 取统一格式数据 |
| 每个组件手动过滤审计字段/软删除 | 管道自动处理 |
| 同时引入 ABP 和 Spring 全部处理器 | 按需引入或按需注册 |
| 依赖注册顺序控制执行顺序 | 用 weight + offset 控制 |
| 在业务代码中判断后端类型 | 管道透明处理，业务代码无感知 |
