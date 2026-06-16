# 上下文包重构设计

## 目标

创建一个统一的上下文派生架构，使得：
1. Pipeline 有自己的基础上下文
2. ValidationContext 从基础上下文派生
3. RequestContext 从基础上下文派生
4. 未来新增上下文类型时可以方便地扩展

## 当前结构分析

### IExecutableContext (Pipeline)
```typescript
interface IExecutableContext {
    steps: ExecutionStep[];      // 执行步骤
    error?: any;                 // 错误信息
    metadata: {                  // 元数据
        hasError?: boolean;
        terminate?: boolean;
        [key: string]: any;
    };
}
```

### ValidationContext
```typescript
interface ValidationContext {
    value: any;                  // 当前值
    rawValue: any;               // 初始值
    rule: ValidationRule;        // 验证规则
    errors: IValidationError[];  // 错误列表
    path?: string;               // 路径
    terminate?: boolean;         // 熔断信号
    status: { ... };             // 状态信息
    steps: ExecutionStep[];      // 执行步骤
    metadata: { ... };           // 元数据
}
```

### RequestContext
```typescript
interface RequestContext {
    identity: { ... };           // 标识信息
    request: { ... };            // 请求信息
    response: { ... };           // 响应信息
    data: { ... };               // 数据载体
    isAborted: boolean;          // 是否中止
    error: any;                  // 错误信息
    steps: ExecutionStep[];      // 执行步骤
    metadata: { ... };           // 元数据
}
```

## 设计方案

### 1. 基础执行上下文 (BaseContext)

```typescript
/**
 * 基础执行上下文
 * 
 * 所有上下文的基类，提供通用的执行追踪和元数据管理
 */
interface BaseContext {
    // === 执行追踪 ===
    steps: ExecutionStep[];      // 执行步骤记录
    error?: any;                 // 错误信息
    
    // === 元数据 ===
    metadata: {
        hasError?: boolean;      // 是否有错误
        terminate?: boolean;     // 是否终止
        [key: string]: any;      // 允许扩展
    };
}
```

### 2. 验证上下文 (ValidationContext)

```typescript
/**
 * 验证上下文
 * 
 * 从 BaseContext 派生，添加验证特定的字段
 */
interface ValidationContext extends BaseContext {
    // === 数据双轨制 ===
    value: any;                  // 当前值
    readonly rawValue: any;      // 初始值
    
    // === 规则引用 ===
    readonly rule: ValidationRule;
    
    // === 验证状态 ===
    errors: IValidationError[];  // 错误列表
    path?: string;               // 路径
    terminate?: boolean;         // 熔断信号
    status: {
        isUndefined: boolean;
        isNull: boolean;
        isNaN: boolean;
        isEmpty: boolean;
        isModified: boolean;
    };
}
```

### 3. 请求上下文 (RequestContext)

```typescript
/**
 * 请求上下文
 * 
 * 从 BaseContext 派生，添加 HTTP 请求/响应特定的字段
 */
interface RequestContext extends BaseContext {
    // === 标识信息 ===
    identity: { ... };
    
    // === 请求信息 ===
    request: { ... };
    
    // === 响应信息 ===
    response: { ... };
    
    // === 数据载体 ===
    data: { ... };
    
    // === 状态控制 ===
    isAborted: boolean;
}
```

## 实现计划

### Phase 1: 创建基础上下文
1. 在 `src/context` 中创建 `BaseContext` 接口
2. 定义通用的 `ExecutionStep` 类型
3. 提供基础上下文的工具函数

### Phase 2: 重构 ValidationContext
1. 修改 `ValidationContext` 继承 `BaseContext`
2. 保持现有功能不变
3. 更新测试

### Phase 3: 重构 RequestContext
1. 修改 `RequestContext` 继承 `BaseContext`
2. 保持现有功能不变
3. 更新测试

### Phase 4: 更新 Pipeline
1. 确保 Pipeline 使用 `BaseContext` 作为基础
2. 更新 `IExecutableContext` 为 `BaseContext`
3. 更新测试

## 优势

1. **统一性**: 所有上下文共享基础结构
2. **可扩展性**: 新增上下文类型时只需继承 `BaseContext`
3. **类型安全**: TypeScript 的类型系统确保正确性
4. **代码复用**: 通用的工具函数可以在基类中实现
5. **维护性**: 修改基础结构时所有派生类自动受益

## 注意事项

1. **向后兼容**: 确保现有代码不受影响
2. **性能**: 避免过度抽象带来的性能损失
3. **简洁性**: 保持接口简洁，不要过度设计
4. **文档**: 为每个接口提供清晰的文档和示例

## 文件结构

```
src/context/
├── base/
│   ├── BaseContext.ts          # 基础上下文接口
│   ├── ExecutionStep.ts        # 执行步骤类型
│   ├── index.ts                # 导出
│   └── utils.ts                # 工具函数
├── validation/
│   ├── ValidationContext.ts    # 验证上下文
│   └── index.ts                # 导出
├── request/
│   ├── RequestContext.ts       # 请求上下文
│   └── index.ts                # 导出
├── types/
│   └── index.ts                # 类型导出
└── index.ts                    # 主导出
```

## 下一步

1. 创建 `BaseContext` 接口
2. 定义统一的 `ExecutionStep` 类型
3. 重构 `ValidationContext`
4. 重构 `RequestContext`
5. 更新所有测试
