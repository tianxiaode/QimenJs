# 引用规范

## 基本原则

### 1. 使用 `@/` 路径别名

在源码和测试中，统一使用 `@/` 别名引用其他包。

```typescript
// 推荐
import { Logger } from '@/logger';
import { Pipeline } from '@/pipeline';
import { RequestContext } from '@/context';

// 不推荐
import { Logger } from '../../logger';
```

### 2. 引用包的入口文件

优先引用包的入口文件（index.ts），而不是内部文件。

```typescript
// 推荐
import { doValidate } from '@/validation';

// 必要时才使用
import { ValidationError } from '@/validation/errors';

// 避免
import { internalHelper } from '@/validation/internal/helper';
```

### 3. 使用 `import type` 引入类型

仅引入类型时，使用 `import type`。

```typescript
// 推荐
import type { RequestContext } from '@/context';
import type { ILogger } from '@/logger';
```

## 引用规则

### 同层引用

```typescript
// 允许：引用更低层的包
// 在 data-processor (L3) 中
import { Logger } from '@/logger';           // L0
import { Pipeline } from '@/pipeline';       // L2
import { RequestContext } from '@/context';  // L1

// 禁止：引用同层或更高层的包
import { Http } from '@/http';               // L3 - 同层
import { Entity } from '@/entity';           // L4 - 更高层
```

## 配置说明

### TypeScript 配置（tsconfig.json）

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@orbit-js/async": ["src/async"],
      "@orbit-js/cache": ["src/cache"],
      "@orbit-js/composable": ["src/composable"],
      "@orbit-js/context": ["src/context"],
      "@orbit-js/crypto": ["src/crypto"],
      "@orbit-js/data-processor": ["src/data-processor"],
      "@orbit-js/entity": ["src/entity"],
      "@orbit-js/error": ["src/error"],
      "@orbit-js/event-dom": ["src/event-dom"],
      "@orbit-js/events": ["src/events"],
      "@orbit-js/http": ["src/http"],
      "@orbit-js/logger": ["src/logger"],
      "@orbit-js/pipeline": ["src/pipeline"],
      "@orbit-js/registry": ["src/registry"],
      "@orbit-js/runtime": ["src/runtime"],
      "@orbit-js/schema": ["src/schema"],
      "@orbit-js/system-abilities": ["src/system-abilities"],
      "@orbit-js/task": ["src/task"],
      "@orbit-js/types": ["src/types"],
      "@orbit-js/utils": ["src/utils"],
      "@orbit-js/validation": ["src/validation"]
    }
  }
}
```

## 常见错误

### 错误 1：使用深层相对路径

```typescript
// 错误
import { Logger } from '../../../logger';

// 正确
import { Logger } from '@/logger';
```

### 错误 2：反向引用

```typescript
// 错误：logger (L0) 引用 entity (L4)
import { Entity } from '@/entity';
```

### 错误 3：循环引用

```typescript
// 错误：A 引用 B，B 又引用 A
```

## 参考资料

- [依赖管理原则](./dependencies.md) - 包的依赖关系
- [tsconfig.json](../../../tsconfig.json) - TypeScript 配置
