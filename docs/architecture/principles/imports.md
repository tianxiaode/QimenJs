# 引用规范

## 基本原则

### 1. 使用 `@/` 路径别名

在源码和测试中，统一使用 `@/` 别名引用其他包。

```typescript
// ✅ 推荐
import { Logger } from '@/logger';
import { Pipeline } from '@/pipeline';
import { RequestContext } from '@/context';

// ❌ 不推荐
import { Logger } from '../../logger';
import { Logger } from '../logger';
```

**原因**：
- 路径简洁，不受文件位置影响
- 统一的引用方式
- 避免相对路径层级混乱
- TypeScript 和 Jest 都已配置支持

### 2. 引用包的入口文件

优先引用包的入口文件（index.ts），而不是内部文件。

```typescript
// ✅ 推荐
import { doValidate } from '@/validation';
import { DataProcessor } from '@/data-processor';

// ⚠️ 必要时才使用
import { ValidationError } from '@/validation/errors';
import { DataProcessorWeight } from '@/data-processor/weights';

// ❌ 避免
import { internalHelper } from '@/validation/internal/helper';
```

**原因**：
- 包的入口文件是公开 API
- 内部文件可能变化
- 更好的封装性

### 3. 使用 `import type` 引入类型

仅引入类型时，使用 `import type`。

```typescript
// ✅ 推荐
import type { RequestContext } from '@/context';
import type { ILogger } from '@/logger';

// ✅ 也可以
import { RequestContext } from '@/context';
```

**原因**：
- 更清晰的意图
- 更好的类型擦除
- 减小运行时体积

## 引用规则

### 同层引用

```typescript
// ✅ 允许：引用更低层的包
// 在 data-processor (L2) 中
import { Logger } from '@/logger';           // L0
import { Pipeline } from '@/pipeline';       // L1
import { RequestContext } from '@/context';  // L0

// ❌ 禁止：引用同层或更高层的包
import { Validation } from '@/validation';   // L2 - 同层
import { Http } from '@/http';               // L3 - 更高层
```

### 跨包引用示例

#### 从 validation 引用其他包

```typescript
// src/validation/core/executor.ts
import { Pipeline } from '@/pipeline';           // L1
import { Logger } from '@/logger';               // L0
import { RegistrarBase } from '@/registry/registrars/RegistrarBase';  // L1
```

#### 从 data-processor 引用其他包

```typescript
// src/data-processor/DataProcessorRegistrar.ts
import { RegistrarBase } from '@/registry/registrars/RegistrarBase';  // L1
import type { RequestContext } from '@/context';  // L0
import { Pipeline } from '@/pipeline';            // L1
```

#### 从 entity 引用其他包

```typescript
// src/entity/manager/CoreEntityManager.ts
import { ComposableBase } from '@/composable/ComposableBase';  // L1
import { HttpClient } from '@/http/HttpClient';                // L3
import { DataProcessor } from '@/data-processor';              // L2
import { Logger } from '@/logger';                             // L0
import { RequestContextBuilder } from '@/context';             // L0
```

## 配置说明

### TypeScript 配置（tsconfig.json）

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@orbitjs/async": ["src/async"],
      "@orbitjs/cache": ["src/cache"],
      "@orbitjs/composable": ["src/composable"],
      "@orbitjs/context": ["src/context"],
      "@orbitjs/data-processor": ["src/data-processor"],
      "@orbitjs/error": ["src/error"],
      "@orbitjs/events": ["src/events"],
      "@orbitjs/http": ["src/http"],
      "@orbitjs/logger": ["src/logger"],
      "@orbitjs/pipeline": ["src/pipeline"],
      "@orbitjs/registry": ["src/registry"],
      "@orbitjs/runtime": ["src/runtime"],
      "@orbitjs/task": ["src/task"],
      "@orbitjs/utils": ["src/utils"],
      "@orbitjs/validation": ["src/validation"]
    }
  }
}
```

### Jest 配置（jest.config.ts）

```typescript
const config = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@orbitjs/async$': '<rootDir>/src/async',
    '^@orbitjs/cache$': '<rootDir>/src/cache',
    // ... 其他包
  },
};
```

## 常见错误

### 错误 1：使用深层相对路径

```typescript
// ❌ 错误
import { Logger } from '../../../logger';
import { Pipeline } from '../../pipeline/executor';

// ✅ 正确
import { Logger } from '@/logger';
import { Pipeline } from '@/pipeline';
```

### 错误 2：跨包直接引用内部文件

```typescript
// ❌ 错误
import { internalHelper } from '@/validation/internal/helper';

// ✅ 正确
import { doValidate } from '@/validation';
```

### 错误 3：循环引用

```typescript
// ❌ 错误：A 引用 B，B 又引用 A
// A.ts
import { B } from './B';

// B.ts
import { A } from './A';
```

### 错误 4：反向引用

```typescript
// ❌ 错误：logger (L0) 引用 entity (L4)
// src/logger/Logger.ts
import { Entity } from '@/entity';
```

## 最佳实践

### 1. 包的入口文件

每个包都应该有清晰的 `index.ts` 入口文件：

```typescript
// src/pipeline/index.ts
export * from './types';        // 导出类型
export * from './executor';     // 导出执行器
export { Pipeline, pipeline } from './executor';

// 使用时
import { Pipeline, PipelineResult, ExecutionStep } from '@/pipeline';
```

### 2. 类型导出

类型也应该通过包入口导出：

```typescript
// src/pipeline/types.ts
export interface PipelineResult<T = any> { ... }
export interface ExecutionStep { ... }
export interface IPipelineExecutor { ... }

// src/pipeline/index.ts
export * from './types';

// 使用时
import type { PipelineResult, ExecutionStep } from '@/pipeline';
```

### 3. 避免引用整个包

```typescript
// ❌ 不推荐
import * as Utils from '@/utils';

// ✅ 推荐
import { string, array } from '@/utils';
```

## 检查工具

### 引用检查工具（计划中）

```bash
# 检查所有引用是否合法
npm run check-imports

# 检查特定文件的引用
npm run check-imports -- src/http/HttpClient.ts
```

## 参考资料

- [依赖管理原则](./dependencies.md) - 包的依赖关系
- [tsconfig.json](../../../tsconfig.json) - TypeScript 配置
- [jest.config.ts](../../../jest.config.ts) - Jest 配置
