# OrbitJS 包结构重构方案

## 一、新的包结构（按依赖层级划分）

### 第 0 层：核心基础包（7个，零依赖）
- `@orbitjs/error` - 错误处理
- `@orbitjs/logger` - 日志系统
- `@orbitjs/utils` - 工具函数
- `@orbitjs/async` - 异步工具
- `@orbitjs/runtime` - 运行时环境
- `@orbitjs/crypto` - 加密工具
- `@orbitjs/context` - 请求上下文（新增）
  - RequestContext - 请求上下文定义
  - RequestContextBuilder - 上下文构建器
  - 贯穿整个请求生命周期的上下文对象

### 第 1 层：基础设施工具包（6个，只依赖第0层）
- `@orbitjs/registry` - 注册器系统（依赖 error）
- `@orbitjs/cache` - 缓存系统（依赖 logger、utils）
- `@orbitjs/events` - 事件系统（依赖 logger、utils）
- `@orbitjs/task` - 任务系统（依赖 logger、utils、error、runtime）
- `@orbitjs/pipeline` - 统一管道执行器（依赖 logger）
  - executor - 管道执行器
  - types - 类型定义
  - 内置监控、日志、统计功能
- `@orbitjs/composable` - 可组合系统（依赖 logger、async）
  - ComposableBase - 可组合基类
  - AbilityBase - 能力基类
  - DescriptorFactory - 描述符工厂
  - ComposableRegistrar - 能力注册器（包内自包含）

### 第 2 层：功能工具包（3个，依赖第0-1层）
- `@orbitjs/schema` - Schema 定义系统（依赖 registry）
  - 验证规则类型定义
  - Schema 类型定义
  - SchemaRegistrar - Schema 注册器
  - 数据结构定义 + 数据约束
- `@orbitjs/validation` - 验证系统（依赖 error、pipeline、schema）
  - 验证引擎
  - 验证处理器
  - 错误收集和报告
- `@orbitjs/data-processor` - 数据处理系统（依赖 registry、pipeline）
  - registrar - 处理器注册表
  - executor - 处理器执行器
  - weights - 权重定义
  - tags - 标签过滤

### 第 3 层：高级功能包（2个，依赖第0-2层）
- `@orbitjs/http` - HTTP 客户端（依赖 logger、utils、pipeline）
  - HttpClient - HTTP 客户端
  - 请求/响应处理
  - 中间件支持
- `@orbitjs/system-abilities` - 系统能力实现（依赖 composable、registry、events）
  - DomainAbility - 领域能力
  - EventAbility - 事件能力
  - SystemAbility - 系统能力
  - DomEventsAbility - DOM 事件能力

### 第 4 层：业务包（1个）
- `@orbitjs/entity` - 实体管理
  - manager - 实体管理器
  - state - 实体状态
  - schema - 实体模式
  - actions - 实体动作处理器
  - abilities - 实体相关能力

## 二、目录结构

```
src/
├── error/              # 错误处理
├── logger/             # 日志系统
├── utils/              # 工具函数
├── async/              # 异步工具
├── runtime/            # 运行时环境
├── crypto/             # 加密工具
├── context/            # 请求上下文（新增）
│   ├── types/
│   │   ├── request-context.ts  # RequestContext 定义
│   │   └── index.ts
│   ├── RequestContextBuilder.ts  # 构建器
│   └── index.ts
├── registry/           # 注册器系统
├── cache/              # 缓存系统
├── events/             # 事件系统
├── schema/             # Schema 定义系统（新增）
│   ├── types/
│   │   ├── rule.ts     # 验证规则类型
│   │   ├── schema.ts   # Schema 类型
│   │   └── index.ts
│   ├── SchemaRegistrar.ts  # Schema 注册器
│   └── index.ts
├── validation/         # 验证系统
├── task/               # 任务系统
├── pipeline/           # 统一管道执行器（新增）
│   ├── executor.ts     # 管道执行器
│   ├── types.ts        # 类型定义
│   └── index.ts        # 入口
├── data-processor/     # 数据处理系统（新增）
│   ├── DataProcessorRegistrar.ts  # 注册表
│   ├── executor.ts     # 执行器
│   ├── types.ts        # 类型定义
│   ├── weights.ts      # 权重定义
│   ├── errors/         # 错误类
│   └── index.ts        # 入口
├── composable/         # 可组合系统（从 kernel 拆分）
│   ├── ComposableBase.ts
│   ├── AbilityBase.ts
│   ├── DescriptorFactory.ts
│   └── index.ts
├── http/               # HTTP 客户端（从 kernel 拆分）
│   ├── HttpClient.ts
│   ├── middleware/
│   └── index.ts
├── system-abilities/   # 系统能力实现（从 kernel 拆分）
│   ├── system/
│   │   ├── DomainAbility.ts
│   │   ├── EventAbility.ts
│   │   ├── SystemAbility.ts
│   │   └── DomEventsAbility.ts
│   └── index.ts
└── entity/             # 实体管理
    ├── manager/
    ├── state/
    ├── schema/
    ├── actions/
    └── abilities/
```

## 三、依赖关系

```
@orbitjs/entity
    ├─ @orbitjs/context          # 使用 RequestContextBuilder
    ├─ @orbitjs/composable
    │   └─ @orbitjs/utils
    ├─ @orbitjs/http
    │   ├─ @orbitjs/logger
    │   ├─ @orbitjs/utils
    │   ├─ @orbitjs/pipeline
    │   └─ @orbitjs/context      # 使用 RequestContext
    ├─ @orbitjs/abilities
    ├─ @orbitjs/events
    │   ├─ @orbitjs/logger
    │   └─ @orbitjs/utils
    ├─ @orbitjs/cache
    │   ├─ @orbitjs/logger
    │   └─ @orbitjs/utils
    ├─ @orbitjs/registry
    │   └─ @orbitjs/error
    └─ @orbitjs/async

@orbitjs/data-processor
    ├─ @orbitjs/context          # 使用 RequestContext
    ├─ @orbitjs/registry
    │   └─ @orbitjs/error
    ├─ @orbitjs/pipeline
    │   └─ @orbitjs/logger
    └─ @orbitjs/types

@orbitjs/validation
    ├─ @orbitjs/registry
    │   └─ @orbitjs/error
    └─ @orbitjs/pipeline
        └─ @orbitjs/logger

@orbitjs/http
    ├─ @orbitjs/context          # 使用 RequestContext
    ├─ @orbitjs/logger
    ├─ @orbitjs/utils
    └─ @orbitjs/pipeline
        └─ @orbitjs/logger
```

## 四、构建方式

### 单一 package.json + 多入口构建

使用 `scripts/build.js` 和 `scripts/build-config.json` 配置，从单一源码构建出多个独立包。

### 构建命令

```bash
# 构建所有包
npm run build

# 构建指定包
npm run build:kernel
npm run build:entity

# 清理后构建
npm run build:clean
```

### 构建配置

在 `scripts/build-config.json` 中定义每个包的：
- 入口文件（entry）
- 输出目录（outDir）
- 源码目录（rootDir）
- 依赖关系（dependencies）
- 包名（packageName）

## 五、使用方式

### 安装

```bash
# 安装特定包
npm install @orbitjs/utils
npm install @orbitjs/cache
npm install @orbitjs/kernel
npm install @orbitjs/entity
```

### 导入

```typescript
// 使用工具函数
import { string, array } from '@orbitjs/utils';

// 使用缓存
import { CacheFactory } from '@orbitjs/cache';

// 使用 HTTP 客户端
import { HttpClient } from '@orbitjs/kernel';

// 使用实体管理
import { CoreEntityManager } from '@orbitjs/entity';
```

## 六、包的体积估算

| 包名 | 依赖数 | 体积（gzip） | 使用场景 |
|------|--------|--------------|----------|
| @orbitjs/utils | 0 | ~20KB | 任何项目 |
| @orbitjs/logger | 0 | ~10KB | 任何项目 |
| @orbitjs/cache | 2 | ~30KB | 需要缓存的项目 |
| @orbitjs/events | 2 | ~25KB | 需要事件的项目 |
| @orbitjs/kernel | 6 | ~100KB | 通用基础设施 |
| @orbitjs/entity | 8 | ~200KB | 实体管理场景 |

## 七、迁移步骤

### 阶段一：创建新目录结构
1. 创建 `src/runtime` 目录（从 `src/runtime-env` 迁移）
2. 创建 `src/cache` 目录（从 `src/kernel/cache` 迁移）
3. 创建 `src/events` 目录（从 `src/kernel/events/core` 迁移）
4. 创建 `src/task` 目录（从 `src/tasks` 迁移）

### 阶段二：重组 kernel 包
1. 保留 `composable`、`http`、`pipeline`、`abilities`
2. 移除 `cache`、`events`（已独立）
3. 移除 `entities`、`actions`（移到 entity 包）

### 阶段三：创建 entity 包
1. 创建 `src/entity` 目录
2. 迁移实体管理器、状态、模式、动作处理器
3. 迁移实体相关能力

### 阶段四：更新导入路径
1. 更新所有文件中的导入路径
2. 使用新的包名导入

### 阶段五：测试和发布
1. 运行测试确保功能正常
2. 构建所有包
3. 发布到 npm

## 八、关键优势

### 1. cache 完全独立
- 不依赖 kernel 或 entity
- 可以在任何项目中使用
- 体积小，功能完整

### 2. kernel 作为通用基础设施
- 包含 composable、http、pipeline、abilities
- 不包含实体管理
- 可以在多种项目中复用

### 3. entity 作为业务包
- 包含完整的实体管理功能
- 依赖 kernel 包
- 特定业务场景使用

### 4. 单一 package.json
- 维护简单
- 版本管理统一
- 构建配置集中

### 5. 依赖关系清晰
- 每个包的依赖明确
- 无循环依赖
- 版本管理简单

## 九、注意事项

### 1. 导入路径更新
所有文件中的导入路径需要更新为新的包结构：
- `@orbitjs/runtime-env` → `@orbitjs/runtime`
- `@orbitjs/tasks` → `@orbitjs/task`
- 内部模块使用相对路径

### 2. 类型定义
确保每个包都有完整的类型定义导出。

### 3. 测试覆盖
每个包都应该有独立的测试。

### 4. 文档完善
每个包都应该有 README 和使用示例。

## 十、引用方式说明

### 1. 在代码文件中引用

**使用 `@/` 路径别名**（推荐）：

```typescript
// ✅ 推荐：使用 @/ 别名
import { Logger } from '@/logger';
import { CacheFactory } from '@/cache/CacheFactory';
import { Pipeline } from '@/pipeline';
import { DataProcessor } from '@/data-processor';
import { doValidate } from '@/validation';
import { RegistrarBase } from '@/registry/registrars/RegistrarBase';

// ❌ 不推荐：使用相对路径
import { Logger } from '../../logger';
import { CacheFactory } from '../cache/CacheFactory';
```

**为什么使用 `@/` 别名**：
- 路径简洁，不受文件位置影响
- 统一的引用方式
- 避免相对路径层级混乱
- TypeScript 和 Jest 都已配置支持

### 2. 在单元测试中引用

**同样使用 `@/` 别名**：

```typescript
// test/unit/validation/core.test.ts
import { doValidate, validationExecutor } from '@/validation';
import { ValidationError } from '@/validation/errors';

// test/unit/cache/CacheFactory.test.ts
import { CacheFactory } from '@/cache/CacheFactory';
import { MemoryProvider } from '@/cache/MemoryProvider';
import { Logger } from '@/logger/Logger';
```

**测试文件组织**：
```
test/
├── unit/                    # 单元测试
│   ├── validation/          # 验证模块测试
│   │   ├── core.test.ts
│   │   └── errors.test.ts
│   ├── cache/               # 缓存模块测试
│   │   └── CacheFactory.test.ts
│   └── pipeline/            # 管道模块测试
│       └── executor.test.ts
└── integration/             # 集成测试
    └── ...
```

### 3. 跨包引用示例

#### 从 validation 引用其他包

```typescript
// src/validation/core/executor.ts
import { Pipeline } from '@/pipeline';           // 引用 pipeline 包
import { Logger } from '@/logger';               // 引用 logger 包
import { RegistrarBase } from '@/registry/registrars/RegistrarBase';  // 引用 registry 包
```

#### 从 data-processor 引用其他包

```typescript
// src/data-processor/DataProcessorRegistrar.ts
import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import { RequestContext } from '@/types';
import { Pipeline } from '@/pipeline';
```

#### 从 entity 引用其他包

```typescript
// src/entity/manager/CoreEntityManager.ts
import { ComposableBase } from '@/composable/ComposableBase';
import { HttpClient } from '@/http/HttpClient';
import { DataProcessor } from '@/data-processor';
import { Logger } from '@/logger';
```

### 4. 配置说明

#### TypeScript 配置（tsconfig.json）

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@orbitjs/async": ["src/async"],
      "@orbitjs/cache": ["src/cache"],
      "@orbitjs/composable": ["src/composable"],
      "@orbitjs/data-processor": ["src/data-processor"],
      "@orbitjs/error": ["src/error"],
      "@orbitjs/events": ["src/events"],
      "@orbitjs/http": ["src/http"],
      "@orbitjs/logger": ["src/logger"],
      "@orbitjs/pipeline": ["src/pipeline"],
      "@orbitjs/registry": ["src/registry"],
      "@orbitjs/validation": ["src/validation"],
      // ... 其他包
    }
  }
}
```

#### Jest 配置（jest.config.ts）

```typescript
const config = {
  moduleNameMapper: {
    '^@/(.*)

## 十、新增架构说明

### 1. 统一管道执行器（@orbitjs/pipeline）

**设计理念**：一次实现，处处复用

**核心功能**：
- 权重 + 偏移量排序
- 熔断机制
- 执行跟踪
- 性能计时
- 统计信息
- 日志记录
- 错误处理

**使用场景**：
- validation - 验证管道执行
- data-processor - 数据处理管道执行
- http - HTTP 管道执行（待实现）

**优势**：
- 避免重复代码
- 统一监控体验
- 统一日志格式
- 易于维护和扩展

### 2. 数据处理系统（@orbitjs/data-processor）

**设计理念**：单一职责，注册与执行分离

**核心组件**：
- `DataProcessorRegistrar` - 处理器注册表
  - 只负责注册和获取
  - 支持权重排序
  - 支持 tags 过滤
- `DataProcessorExecutor` - 处理器执行器
  - 使用统一 pipeline 执行
  - 提供统计和报告

**权重系统**：
```typescript
enum DataProcessorWeight {
    PREPARATION = 0,      // 准备阶段
    TRANSFORM = 1000,     // 数据转换
    VALIDATION = 2000,    // 数据验证
    ENRICHMENT = 3000,    // 数据增强
    EXCHANGE = 4000,      // 数据交换
    EXTRACT = 5000,       // 数据提取
    ALIGN = 6000,         // 数据对齐
    ERROR = 7000,         // 错误处理
    FINALIZE = 8000,      // 最终处理
}
```

**Tags 系统**：
- 支持多标签过滤
- 实现处理器复用
- 示例：`['abp', 'pre']` 表示 ABP 前导管道

### 3. 验证系统重构（@orbitjs/validation）

**重构内容**：
- 创建 `ValidationExecutor`
- 使用统一 pipeline 执行器
- 简化 `doValidate` 函数

**重构前后对比**：
```typescript
// 重构前：自己实现执行逻辑（60+ 行）
for (const item of processors) {
    const step = { ... };
    if (context.terminate) { ... }
    const start = performance.now();
    await item.execute(context);
    const end = performance.now();
    step.duration = end - start;
    context.steps.push(step);
}

// 重构后：使用统一 pipeline（1 行）
const result = await validationExecutor.execute(context, processors, rule.type);
```

**新增功能**：
- 统计信息（`getStats()`）
- 日志记录（使用 logger）
- 执行报告（`printReport()`）

### 4. 类型系统（@orbitjs/types）

**目的**：避免循环依赖

**核心类型**：
- `RequestContext` - 请求上下文
- `ExecutionStep` - 执行步骤
- `IExecutableContext` - 可执行上下文接口

**位置**：`src/types/flow-context.ts`

### 5. 架构优势总结

| 维度 | 改进前 | 改进后 |
|------|--------|--------|
| **代码重复** | 每个模块自己实现 | 统一 pipeline 实现 |
| **监控能力** | 各模块不一致 | 统一监控 |
| **日志格式** | 各模块不一致 | 统一 logger |
| **调试体验** | 各模块不同 | 统一报告 |
| **维护成本** | 多处维护 | 单点维护 |
| **扩展性** | 需逐个修改 | 一次修改全局生效 |

### 6. 使用示例

#### Pipeline 执行器
```typescript
import { Pipeline } from '@/pipeline';

const executor = new Pipeline();
const result = await executor.execute(context, processors, {
    enableTracking: true,
    enableTiming: true,
    pipelineName: 'MyPipeline',
});
executor.printReport(result);
```

#### 数据处理
```typescript
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    tags: ['abp', 'pre'],
    handle: async (ctx) => { /* ... */ }
});

// 执行管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');
await dataProcessorExecutor.execute(context, pipeline, 'pre');
```

#### 验证
```typescript
import { doValidate, validationExecutor } from '@/validation';

const result = await doValidate(value, rule);
const stats = validationExecutor.getStats();
validationExecutor.printReport(result);
```
: '<rootDir>/src/$1',
    '^@orbitjs/async

## 十、新增架构说明

### 1. 统一管道执行器（@orbitjs/pipeline）

**设计理念**：一次实现，处处复用

**核心功能**：
- 权重 + 偏移量排序
- 熔断机制
- 执行跟踪
- 性能计时
- 统计信息
- 日志记录
- 错误处理

**使用场景**：
- validation - 验证管道执行
- data-processor - 数据处理管道执行
- http - HTTP 管道执行（待实现）

**优势**：
- 避免重复代码
- 统一监控体验
- 统一日志格式
- 易于维护和扩展

### 2. 数据处理系统（@orbitjs/data-processor）

**设计理念**：单一职责，注册与执行分离

**核心组件**：
- `DataProcessorRegistrar` - 处理器注册表
  - 只负责注册和获取
  - 支持权重排序
  - 支持 tags 过滤
- `DataProcessorExecutor` - 处理器执行器
  - 使用统一 pipeline 执行
  - 提供统计和报告

**权重系统**：
```typescript
enum DataProcessorWeight {
    PREPARATION = 0,      // 准备阶段
    TRANSFORM = 1000,     // 数据转换
    VALIDATION = 2000,    // 数据验证
    ENRICHMENT = 3000,    // 数据增强
    EXCHANGE = 4000,      // 数据交换
    EXTRACT = 5000,       // 数据提取
    ALIGN = 6000,         // 数据对齐
    ERROR = 7000,         // 错误处理
    FINALIZE = 8000,      // 最终处理
}
```

**Tags 系统**：
- 支持多标签过滤
- 实现处理器复用
- 示例：`['abp', 'pre']` 表示 ABP 前导管道

### 3. 验证系统重构（@orbitjs/validation）

**重构内容**：
- 创建 `ValidationExecutor`
- 使用统一 pipeline 执行器
- 简化 `doValidate` 函数

**重构前后对比**：
```typescript
// 重构前：自己实现执行逻辑（60+ 行）
for (const item of processors) {
    const step = { ... };
    if (context.terminate) { ... }
    const start = performance.now();
    await item.execute(context);
    const end = performance.now();
    step.duration = end - start;
    context.steps.push(step);
}

// 重构后：使用统一 pipeline（1 行）
const result = await validationExecutor.execute(context, processors, rule.type);
```

**新增功能**：
- 统计信息（`getStats()`）
- 日志记录（使用 logger）
- 执行报告（`printReport()`）

### 4. 类型系统（@orbitjs/types）

**目的**：避免循环依赖

**核心类型**：
- `RequestContext` - 请求上下文
- `ExecutionStep` - 执行步骤
- `IExecutableContext` - 可执行上下文接口

**位置**：`src/types/flow-context.ts`

### 5. 架构优势总结

| 维度 | 改进前 | 改进后 |
|------|--------|--------|
| **代码重复** | 每个模块自己实现 | 统一 pipeline 实现 |
| **监控能力** | 各模块不一致 | 统一监控 |
| **日志格式** | 各模块不一致 | 统一 logger |
| **调试体验** | 各模块不同 | 统一报告 |
| **维护成本** | 多处维护 | 单点维护 |
| **扩展性** | 需逐个修改 | 一次修改全局生效 |

### 6. 使用示例

#### Pipeline 执行器
```typescript
import { Pipeline } from '@/pipeline';

const executor = new Pipeline();
const result = await executor.execute(context, processors, {
    enableTracking: true,
    enableTiming: true,
    pipelineName: 'MyPipeline',
});
executor.printReport(result);
```

#### 数据处理
```typescript
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    tags: ['abp', 'pre'],
    handle: async (ctx) => { /* ... */ }
});

// 执行管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');
await dataProcessorExecutor.execute(context, pipeline, 'pre');
```

#### 验证
```typescript
import { doValidate, validationExecutor } from '@/validation';

const result = await doValidate(value, rule);
const stats = validationExecutor.getStats();
validationExecutor.printReport(result);
```
: '<rootDir>/src/async',
    '^@orbitjs/cache

## 十、新增架构说明

### 1. 统一管道执行器（@orbitjs/pipeline）

**设计理念**：一次实现，处处复用

**核心功能**：
- 权重 + 偏移量排序
- 熔断机制
- 执行跟踪
- 性能计时
- 统计信息
- 日志记录
- 错误处理

**使用场景**：
- validation - 验证管道执行
- data-processor - 数据处理管道执行
- http - HTTP 管道执行（待实现）

**优势**：
- 避免重复代码
- 统一监控体验
- 统一日志格式
- 易于维护和扩展

### 2. 数据处理系统（@orbitjs/data-processor）

**设计理念**：单一职责，注册与执行分离

**核心组件**：
- `DataProcessorRegistrar` - 处理器注册表
  - 只负责注册和获取
  - 支持权重排序
  - 支持 tags 过滤
- `DataProcessorExecutor` - 处理器执行器
  - 使用统一 pipeline 执行
  - 提供统计和报告

**权重系统**：
```typescript
enum DataProcessorWeight {
    PREPARATION = 0,      // 准备阶段
    TRANSFORM = 1000,     // 数据转换
    VALIDATION = 2000,    // 数据验证
    ENRICHMENT = 3000,    // 数据增强
    EXCHANGE = 4000,      // 数据交换
    EXTRACT = 5000,       // 数据提取
    ALIGN = 6000,         // 数据对齐
    ERROR = 7000,         // 错误处理
    FINALIZE = 8000,      // 最终处理
}
```

**Tags 系统**：
- 支持多标签过滤
- 实现处理器复用
- 示例：`['abp', 'pre']` 表示 ABP 前导管道

### 3. 验证系统重构（@orbitjs/validation）

**重构内容**：
- 创建 `ValidationExecutor`
- 使用统一 pipeline 执行器
- 简化 `doValidate` 函数

**重构前后对比**：
```typescript
// 重构前：自己实现执行逻辑（60+ 行）
for (const item of processors) {
    const step = { ... };
    if (context.terminate) { ... }
    const start = performance.now();
    await item.execute(context);
    const end = performance.now();
    step.duration = end - start;
    context.steps.push(step);
}

// 重构后：使用统一 pipeline（1 行）
const result = await validationExecutor.execute(context, processors, rule.type);
```

**新增功能**：
- 统计信息（`getStats()`）
- 日志记录（使用 logger）
- 执行报告（`printReport()`）

### 4. 类型系统（@orbitjs/types）

**目的**：避免循环依赖

**核心类型**：
- `RequestContext` - 请求上下文
- `ExecutionStep` - 执行步骤
- `IExecutableContext` - 可执行上下文接口

**位置**：`src/types/flow-context.ts`

### 5. 架构优势总结

| 维度 | 改进前 | 改进后 |
|------|--------|--------|
| **代码重复** | 每个模块自己实现 | 统一 pipeline 实现 |
| **监控能力** | 各模块不一致 | 统一监控 |
| **日志格式** | 各模块不一致 | 统一 logger |
| **调试体验** | 各模块不同 | 统一报告 |
| **维护成本** | 多处维护 | 单点维护 |
| **扩展性** | 需逐个修改 | 一次修改全局生效 |

### 6. 使用示例

#### Pipeline 执行器
```typescript
import { Pipeline } from '@/pipeline';

const executor = new Pipeline();
const result = await executor.execute(context, processors, {
    enableTracking: true,
    enableTiming: true,
    pipelineName: 'MyPipeline',
});
executor.printReport(result);
```

#### 数据处理
```typescript
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    tags: ['abp', 'pre'],
    handle: async (ctx) => { /* ... */ }
});

// 执行管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');
await dataProcessorExecutor.execute(context, pipeline, 'pre');
```

#### 验证
```typescript
import { doValidate, validationExecutor } from '@/validation';

const result = await doValidate(value, rule);
const stats = validationExecutor.getStats();
validationExecutor.printReport(result);
```
: '<rootDir>/src/cache',
    '^@orbitjs/composable

## 十、新增架构说明

### 1. 统一管道执行器（@orbitjs/pipeline）

**设计理念**：一次实现，处处复用

**核心功能**：
- 权重 + 偏移量排序
- 熔断机制
- 执行跟踪
- 性能计时
- 统计信息
- 日志记录
- 错误处理

**使用场景**：
- validation - 验证管道执行
- data-processor - 数据处理管道执行
- http - HTTP 管道执行（待实现）

**优势**：
- 避免重复代码
- 统一监控体验
- 统一日志格式
- 易于维护和扩展

### 2. 数据处理系统（@orbitjs/data-processor）

**设计理念**：单一职责，注册与执行分离

**核心组件**：
- `DataProcessorRegistrar` - 处理器注册表
  - 只负责注册和获取
  - 支持权重排序
  - 支持 tags 过滤
- `DataProcessorExecutor` - 处理器执行器
  - 使用统一 pipeline 执行
  - 提供统计和报告

**权重系统**：
```typescript
enum DataProcessorWeight {
    PREPARATION = 0,      // 准备阶段
    TRANSFORM = 1000,     // 数据转换
    VALIDATION = 2000,    // 数据验证
    ENRICHMENT = 3000,    // 数据增强
    EXCHANGE = 4000,      // 数据交换
    EXTRACT = 5000,       // 数据提取
    ALIGN = 6000,         // 数据对齐
    ERROR = 7000,         // 错误处理
    FINALIZE = 8000,      // 最终处理
}
```

**Tags 系统**：
- 支持多标签过滤
- 实现处理器复用
- 示例：`['abp', 'pre']` 表示 ABP 前导管道

### 3. 验证系统重构（@orbitjs/validation）

**重构内容**：
- 创建 `ValidationExecutor`
- 使用统一 pipeline 执行器
- 简化 `doValidate` 函数

**重构前后对比**：
```typescript
// 重构前：自己实现执行逻辑（60+ 行）
for (const item of processors) {
    const step = { ... };
    if (context.terminate) { ... }
    const start = performance.now();
    await item.execute(context);
    const end = performance.now();
    step.duration = end - start;
    context.steps.push(step);
}

// 重构后：使用统一 pipeline（1 行）
const result = await validationExecutor.execute(context, processors, rule.type);
```

**新增功能**：
- 统计信息（`getStats()`）
- 日志记录（使用 logger）
- 执行报告（`printReport()`）

### 4. 类型系统（@orbitjs/types）

**目的**：避免循环依赖

**核心类型**：
- `RequestContext` - 请求上下文
- `ExecutionStep` - 执行步骤
- `IExecutableContext` - 可执行上下文接口

**位置**：`src/types/flow-context.ts`

### 5. 架构优势总结

| 维度 | 改进前 | 改进后 |
|------|--------|--------|
| **代码重复** | 每个模块自己实现 | 统一 pipeline 实现 |
| **监控能力** | 各模块不一致 | 统一监控 |
| **日志格式** | 各模块不一致 | 统一 logger |
| **调试体验** | 各模块不同 | 统一报告 |
| **维护成本** | 多处维护 | 单点维护 |
| **扩展性** | 需逐个修改 | 一次修改全局生效 |

### 6. 使用示例

#### Pipeline 执行器
```typescript
import { Pipeline } from '@/pipeline';

const executor = new Pipeline();
const result = await executor.execute(context, processors, {
    enableTracking: true,
    enableTiming: true,
    pipelineName: 'MyPipeline',
});
executor.printReport(result);
```

#### 数据处理
```typescript
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    tags: ['abp', 'pre'],
    handle: async (ctx) => { /* ... */ }
});

// 执行管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');
await dataProcessorExecutor.execute(context, pipeline, 'pre');
```

#### 验证
```typescript
import { doValidate, validationExecutor } from '@/validation';

const result = await doValidate(value, rule);
const stats = validationExecutor.getStats();
validationExecutor.printReport(result);
```
: '<rootDir>/src/composable',
    '^@orbitjs/data-processor

## 十、新增架构说明

### 1. 统一管道执行器（@orbitjs/pipeline）

**设计理念**：一次实现，处处复用

**核心功能**：
- 权重 + 偏移量排序
- 熔断机制
- 执行跟踪
- 性能计时
- 统计信息
- 日志记录
- 错误处理

**使用场景**：
- validation - 验证管道执行
- data-processor - 数据处理管道执行
- http - HTTP 管道执行（待实现）

**优势**：
- 避免重复代码
- 统一监控体验
- 统一日志格式
- 易于维护和扩展

### 2. 数据处理系统（@orbitjs/data-processor）

**设计理念**：单一职责，注册与执行分离

**核心组件**：
- `DataProcessorRegistrar` - 处理器注册表
  - 只负责注册和获取
  - 支持权重排序
  - 支持 tags 过滤
- `DataProcessorExecutor` - 处理器执行器
  - 使用统一 pipeline 执行
  - 提供统计和报告

**权重系统**：
```typescript
enum DataProcessorWeight {
    PREPARATION = 0,      // 准备阶段
    TRANSFORM = 1000,     // 数据转换
    VALIDATION = 2000,    // 数据验证
    ENRICHMENT = 3000,    // 数据增强
    EXCHANGE = 4000,      // 数据交换
    EXTRACT = 5000,       // 数据提取
    ALIGN = 6000,         // 数据对齐
    ERROR = 7000,         // 错误处理
    FINALIZE = 8000,      // 最终处理
}
```

**Tags 系统**：
- 支持多标签过滤
- 实现处理器复用
- 示例：`['abp', 'pre']` 表示 ABP 前导管道

### 3. 验证系统重构（@orbitjs/validation）

**重构内容**：
- 创建 `ValidationExecutor`
- 使用统一 pipeline 执行器
- 简化 `doValidate` 函数

**重构前后对比**：
```typescript
// 重构前：自己实现执行逻辑（60+ 行）
for (const item of processors) {
    const step = { ... };
    if (context.terminate) { ... }
    const start = performance.now();
    await item.execute(context);
    const end = performance.now();
    step.duration = end - start;
    context.steps.push(step);
}

// 重构后：使用统一 pipeline（1 行）
const result = await validationExecutor.execute(context, processors, rule.type);
```

**新增功能**：
- 统计信息（`getStats()`）
- 日志记录（使用 logger）
- 执行报告（`printReport()`）

### 4. 类型系统（@orbitjs/types）

**目的**：避免循环依赖

**核心类型**：
- `RequestContext` - 请求上下文
- `ExecutionStep` - 执行步骤
- `IExecutableContext` - 可执行上下文接口

**位置**：`src/types/flow-context.ts`

### 5. 架构优势总结

| 维度 | 改进前 | 改进后 |
|------|--------|--------|
| **代码重复** | 每个模块自己实现 | 统一 pipeline 实现 |
| **监控能力** | 各模块不一致 | 统一监控 |
| **日志格式** | 各模块不一致 | 统一 logger |
| **调试体验** | 各模块不同 | 统一报告 |
| **维护成本** | 多处维护 | 单点维护 |
| **扩展性** | 需逐个修改 | 一次修改全局生效 |

### 6. 使用示例

#### Pipeline 执行器
```typescript
import { Pipeline } from '@/pipeline';

const executor = new Pipeline();
const result = await executor.execute(context, processors, {
    enableTracking: true,
    enableTiming: true,
    pipelineName: 'MyPipeline',
});
executor.printReport(result);
```

#### 数据处理
```typescript
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    tags: ['abp', 'pre'],
    handle: async (ctx) => { /* ... */ }
});

// 执行管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');
await dataProcessorExecutor.execute(context, pipeline, 'pre');
```

#### 验证
```typescript
import { doValidate, validationExecutor } from '@/validation';

const result = await doValidate(value, rule);
const stats = validationExecutor.getStats();
validationExecutor.printReport(result);
```
: '<rootDir>/src/data-processor',
    // ... 其他包
  },
};
```

### 5. 引用规则

#### ✅ 推荐做法

```typescript
// 1. 使用 @/ 别名引用包内模块
import { Logger } from '@/logger';
import { Pipeline } from '@/pipeline';

// 2. 引用包的入口文件
import { doValidate } from '@/validation';
import { DataProcessor } from '@/data-processor';

// 3. 引用具体的子模块（当需要时）
import { ValidationError } from '@/validation/errors';
import { DataProcessorWeight } from '@/data-processor/weights';
```

#### ❌ 避免的做法

```typescript
// 1. 不要使用深层相对路径
import { Logger } from '../../../logger';

// 2. 不要跨包直接引用内部文件
import { internalHelper } from '@/validation/internal/helper';

// 3. 不要循环引用
// A 引用 B，B 又引用 A
```

### 6. 包的入口文件

每个包都应该有清晰的 `index.ts` 入口文件：

```typescript
// src/pipeline/index.ts
export * from './types';        // 导出类型
export * from './executor';     // 导出执行器
export { Pipeline, pipeline } from './executor';

// 使用时
import { Pipeline, PipelineResult, ExecutionStep } from '@/pipeline';
```

### 7. 类型引用

**类型也应该通过包入口导出**：

```typescript
// src/pipeline/types.ts
export interface PipelineResult<T = any> { ... }
export interface ExecutionStep { ... }
export interface IPipelineExecutor { ... }

// src/pipeline/index.ts
export * from './types';

// 使用时
import type { PipelineResult, ExecutionStep } from '@/pipeline';
// 或
import { PipelineResult, ExecutionStep } from '@/pipeline';
```

### 8. 常见问题

#### Q: 什么时候用 `@/` 什么时候用 `@orbitjs/`？

**A: 在源码和测试中都使用 `@/`**：
- `@/` - 源码和测试中使用
- `@orbitjs/xxx` - 发布后的包名（构建配置中使用）

#### Q: 如何引用父包？

**A: 通过包名引用，不要用相对路径**：

```typescript
// ❌ 错误
import { something } from '../';

// ✅ 正确
import { something } from '@/parent-package';
```

#### Q: 如何避免循环引用？

**A: 遵循依赖关系，不要反向引用**：

```
正确的依赖方向：
validation → pipeline → logger
data-processor → pipeline → logger

❌ 错误的反向引用：
logger → validation  // logger 不应该知道 validation
pipeline → data-processor  // pipeline 不应该知道 data-processor
```

## 十、新增架构说明

### 1. 统一管道执行器（@orbitjs/pipeline）

**设计理念**：一次实现，处处复用

**核心功能**：
- 权重 + 偏移量排序
- 熔断机制
- 执行跟踪
- 性能计时
- 统计信息
- 日志记录
- 错误处理

**使用场景**：
- validation - 验证管道执行
- data-processor - 数据处理管道执行
- http - HTTP 管道执行（待实现）

**优势**：
- 避免重复代码
- 统一监控体验
- 统一日志格式
- 易于维护和扩展

### 2. 数据处理系统（@orbitjs/data-processor）

**设计理念**：单一职责，注册与执行分离

**核心组件**：
- `DataProcessorRegistrar` - 处理器注册表
  - 只负责注册和获取
  - 支持权重排序
  - 支持 tags 过滤
- `DataProcessorExecutor` - 处理器执行器
  - 使用统一 pipeline 执行
  - 提供统计和报告

**权重系统**：
```typescript
enum DataProcessorWeight {
    PREPARATION = 0,      // 准备阶段
    TRANSFORM = 1000,     // 数据转换
    VALIDATION = 2000,    // 数据验证
    ENRICHMENT = 3000,    // 数据增强
    EXCHANGE = 4000,      // 数据交换
    EXTRACT = 5000,       // 数据提取
    ALIGN = 6000,         // 数据对齐
    ERROR = 7000,         // 错误处理
    FINALIZE = 8000,      // 最终处理
}
```

**Tags 系统**：
- 支持多标签过滤
- 实现处理器复用
- 示例：`['abp', 'pre']` 表示 ABP 前导管道

### 3. 验证系统重构（@orbitjs/validation）

**重构内容**：
- 创建 `ValidationExecutor`
- 使用统一 pipeline 执行器
- 简化 `doValidate` 函数

**重构前后对比**：
```typescript
// 重构前：自己实现执行逻辑（60+ 行）
for (const item of processors) {
    const step = { ... };
    if (context.terminate) { ... }
    const start = performance.now();
    await item.execute(context);
    const end = performance.now();
    step.duration = end - start;
    context.steps.push(step);
}

// 重构后：使用统一 pipeline（1 行）
const result = await validationExecutor.execute(context, processors, rule.type);
```

**新增功能**：
- 统计信息（`getStats()`）
- 日志记录（使用 logger）
- 执行报告（`printReport()`）

### 4. 类型系统（@orbitjs/types）

**目的**：避免循环依赖

**核心类型**：
- `RequestContext` - 请求上下文
- `ExecutionStep` - 执行步骤
- `IExecutableContext` - 可执行上下文接口

**位置**：`src/types/flow-context.ts`

### 5. 架构优势总结

| 维度 | 改进前 | 改进后 |
|------|--------|--------|
| **代码重复** | 每个模块自己实现 | 统一 pipeline 实现 |
| **监控能力** | 各模块不一致 | 统一监控 |
| **日志格式** | 各模块不一致 | 统一 logger |
| **调试体验** | 各模块不同 | 统一报告 |
| **维护成本** | 多处维护 | 单点维护 |
| **扩展性** | 需逐个修改 | 一次修改全局生效 |

### 6. 使用示例

#### Pipeline 执行器
```typescript
import { Pipeline } from '@/pipeline';

const executor = new Pipeline();
const result = await executor.execute(context, processors, {
    enableTracking: true,
    enableTiming: true,
    pipelineName: 'MyPipeline',
});
executor.printReport(result);
```

#### 数据处理
```typescript
import { DataProcessor, dataProcessorExecutor } from '@/data-processor';

// 注册处理器
DataProcessor.register({
    name: 'abp-pagination',
    weight: DataProcessorWeight.TRANSFORM,
    tags: ['abp', 'pre'],
    handle: async (ctx) => { /* ... */ }
});

// 执行管道
const pipeline = DataProcessor.getPipeline('abp', 'pre');
await dataProcessorExecutor.execute(context, pipeline, 'pre');
```

#### 验证
```typescript
import { doValidate, validationExecutor } from '@/validation';

const result = await doValidate(value, rule);
const stats = validationExecutor.getStats();
validationExecutor.printReport(result);
```


### 7. 请求上下文系统（@orbitjs/context）

**设计理念**：独立包，避免循环依赖

**核心组件**：
- `RequestContext` - 请求上下文定义
  - 标识信息（identity）
  - 请求信息（request）
  - 响应信息（response）
  - 数据载体（data）
  - 状态与控制（isAborted、error、steps）
  - 元数据（metadata）
  - Schema
- `RequestContextBuilder` - 上下文构建器
  - 链式调用
  - 完整的构建方法
  - 克隆功能

**使用流程**：
```
实体管理（Entity Manager）
    ↓ 提交动作（数据）
    ↓ 转换为 RequestContext
    ↓
数据前导处理管道
    ↓ 处理参数、验证、转换
    ↓
HTTP 管道
    ↓ 发送请求、接收响应
    ↓
数据后导处理管道
    ↓ 解析、对齐、转换
    ↓
实体管理
    ↓ 更新状态、返回结果
```

**使用示例**：
```typescript
import { RequestContextBuilder } from '@orbitjs/context';

// 实体管理中创建上下文
const context = RequestContextBuilder
    .create()
    .withIdentity({ domain: 'user', entityName: 'User', action: 'list' })
    .withParams({ page: 1, size: 10 })
    .withRequest({
        url: '/api/users',
        method: 'GET'
    })
    .build();

// 数据前导处理
const preProcessor = DataProcessor.getPipeline('user', 'pre');
await dataProcessorExecutor.execute(context, preProcessor);

// HTTP 请求
const httpPipeline = HttpPipeline.getPipeline('user');
await httpExecutor.execute(context, httpPipeline);

// 数据后导处理
const postProcessor = DataProcessor.getPipeline('user', 'post');
await dataProcessorExecutor.execute(context, postProcessor);

// 返回结果
return context.data.list;
```

**架构优势**：
- 避免循环依赖：context 包独立，其他包依赖它
- 职责清晰：RequestContext 是整个流程的上下文，不是 HTTP 专属
- 便于扩展：可以根据需要添加新的字段和方法
- 构建器模式：方便构建和测试
- 统一流程：实体管理、数据处理、HTTP 请求都使用同一个上下文
