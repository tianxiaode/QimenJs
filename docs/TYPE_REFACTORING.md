# 类型定义重构说明

## 问题

原始设计中存在循环引用风险：

```
registry → data-processor → kernel/types (FlowContext)
    ↓
registry/index.ts 引用了 data-processor
```

## 解决方案

创建独立的类型定义包 `src/types`，将 `FlowContext` 等核心类型定义移到这里。

## 新的依赖关系

```
src/types/              # 独立类型包（无依赖）
    ↓
src/registry/           # 注册表（依赖 types）
    ↓
src/data-processor/     # 数据处理（依赖 types, registry）
    ↓
src/kernel/             # 核心功能（依赖 types）
```

## 目录结构

```
src/
├── types/                      # 独立类型包 [新增]
│   ├── flow-context.ts         # FlowContext 定义
│   └── index.ts                # 导出
│
├── registry/                   # 注册表
│   ├── index.ts                # 引用 data-processor
│   └── types.ts                # DomainConfig 等
│
├── data-processor/             # 数据处理
│   ├── DataProcessorRegistrar.ts
│   ├── types.ts                # 引用 ../types
│   └── index.ts
│
└── kernel/                     # 核心功能
    └── types/
        └── actions.ts          # 引用 ../../types
```

## 使用方式

### 在数据处理包中

```typescript
// src/data-processor/types.ts
import { FlowContext } from '../types';
```

### 在 kernel 中

```typescript
// src/kernel/types/actions.ts
export { 
    FlowContext,
    ExecutionStep,
    RequestTask,
    EntityRequestTask,
    StreamTask,
    RetryOptions
} from '../../types';
```

### 在应用代码中

```typescript
// 从 kernel 导入（推荐）
import { FlowContext } from '@/kernel/types';

// 或从独立类型包导入
import { FlowContext } from '@/types';
```

## 优势

1. **避免循环引用** - 类型定义独立，不依赖任何实现
2. **清晰的依赖关系** - 单向依赖，易于理解
3. **易于维护** - 类型定义集中管理
4. **类型安全** - 完整的 TypeScript 支持

## 迁移指南

如果其他模块需要使用 `FlowContext`：

1. **推荐**：从 `@/kernel/types` 导入（保持兼容）
2. **可选**：从 `@/types` 导入（直接使用）

```typescript
// 方式一（推荐）
import { FlowContext } from '@/kernel/types';

// 方式二
import { FlowContext } from '@/types';
```

两种方式都可以，因为 `kernel/types` 已经重新导出了这些类型。
