# Context 包设计

**日期**: 2026-06-15  
**状态**: 已完成  
**影响范围**: context 包、http 包、data-processor 包、entity 包

## 背景

RequestContext 是贯穿整个请求生命周期的上下文对象，之前存在以下问题：

1. **位置不当** - 在 types 包中，但包含 HTTP 特定字段
2. **职责不清** - 被误认为是 HTTP 专属
3. **循环依赖风险** - 多个包都需要使用

## 决策

### 1. 创建独立的 context 包

**决策**: 将 RequestContext 移到独立的 context 包

**原因**:
- 避免循环依赖
- 明确职责：整个流程的上下文，不是 HTTP 专属
- 便于独立使用和测试

**包结构**:
```
src/context/
├── types/
│   ├── request-context.ts  # RequestContext 定义
│   └── index.ts
├── RequestContextBuilder.ts  # 构建器
└── index.ts
```

### 2. RequestContext 的完整定义

**决策**: RequestContext 包含完整的请求、响应、数据载体等信息

**原因**:
- 贯穿整个流程：实体管理 → 数据前导处理 → HTTP 管道 → 数据后导处理 → 实体管理
- 所有阶段都需要访问和修改上下文
- 统一的数据结构，便于传递

**结构**:
```typescript
export interface RequestContext {
    // 标识信息
    identity: {
        domain: string;
        entityName?: string;
        action?: string;
    };
    
    // 请求信息
    request: { /* ... */ };
    
    // 响应信息
    response: { /* ... */ };
    
    // 数据载体
    data: {
        params: any;
        source: any;
        parsed: any;
        raw: any | null;
        list: any[];
        item: any;
        total: number;
        pagination?: PaginationInfo;
    };
    
    // 状态与控制
    isAborted: boolean;
    error: any | null;
    steps: ExecutionStep[];
    
    // 元数据
    metadata: Record<string, any>;
    
    // Schema
    schema?: any;
    
    // 方法
    alignToFrontend(target: any): any;
}
```

### 3. RequestContextBuilder

**决策**: 使用构建器模式创建 RequestContext

**原因**:
- RequestContext 结构复杂，直接创建容易出错
- 链式调用，代码清晰
- 便于测试和扩展

**使用示例**:
```typescript
const context = RequestContextBuilder
    .create()
    .withIdentity({ domain: 'user', entityName: 'User', action: 'list' })
    .withParams({ page: 1, size: 10 })
    .withRequest({
        url: '/api/users',
        method: 'GET'
    })
    .build();
```

## 影响

### 正面影响
- 避免循环依赖
- 职责清晰
- 便于扩展
- 统一流程

### 负面影响
- 需要更新所有使用 RequestContext 的代码
- 增加了一个新包

## 替代方案

### 方案 A: 保留在 types 包
- **优点**: 无需移动
- **缺点**: 循环依赖风险，职责不清
- **结论**: 不采用

### 方案 B: 放在 http 包
- **优点**: HTTP 相关
- **缺点**: 误认为是 HTTP 专属，其他包使用不便
- **结论**: 不采用

### 方案 C: 独立 context 包（采用）
- **优点**: 职责清晰，避免循环依赖
- **缺点**: 增加包数量
- **结论**: 采用

## 实施细节

### 修改的文件

1. **新建文件**:
   - `src/context/types/request-context.ts`
   - `src/context/RequestContextBuilder.ts`
   - `src/context/index.ts`

2. **更新文件**:
   - `src/types/flow-context.ts` - 简化，只保留核心类型
   - `src/data-processor/types.ts` - 从 context 包导入 RequestContext
   - `ARCHITECTURE.md` - 添加 context 包说明

### 依赖关系

```
@orbitjs/context (第 0 层)
    ↓
@orbitjs/http (第 3 层) - 使用 RequestContext
@orbitjs/data-processor (第 2 层) - 使用 RequestContext
@orbitjs/entity (第 4 层) - 使用 RequestContextBuilder
```

## 后续工作

1. **更新所有使用 RequestContext 的代码**
2. **编写单元测试**
3. **添加使用文档**
4. **性能优化**

## 参考资料

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - 架构文档
- [BUILD_PROGRESS.md](../../BUILD_PROGRESS.md) - 构建进度
