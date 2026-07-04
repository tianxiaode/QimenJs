# 依赖管理原则

## 层级依赖原则

QimenJS 采用严格的层级依赖结构，共分为 5 层：

### 第 0 层：核心基础包（7 个，零依赖）

```
@qimenjs/error
@qimenjs/logger
@qimenjs/utils
@qimenjs/async
@qimenjs/runtime
@qimenjs/crypto
@qimenjs/types
```

**规则**：
- 可以依赖外部 npm 包
- 不能依赖任何 QimenJS 包

### 第 1 层：基础设施工具包（6 个）

```
@qimenjs/registry    → error
@qimenjs/cache       → logger, utils
@qimenjs/events      → logger, utils
@qimenjs/validation  → registry
@qimenjs/task        → logger, utils, error, runtime
@qimenjs/context     → registry
```

**规则**：
- 可以依赖第 0 层的包
- 不能依赖同层或更高层的包

### 第 2 层：功能工具包（4 个）

```
@qimenjs/schema        → registry
@qimenjs/pipeline      → logger, context
@qimenjs/composable    → logger, async
@qimenjs/event-dom     → events, utils, runtime, logger, error, async
```

**规则**：
- 可以依赖第 0-1 层的包
- 不能依赖同层或更高层的包

### 第 3 层：高级功能包（3 个）

```
@qimenjs/data-processor   → registry, context, pipeline
@qimenjs/http             → context, pipeline, registry, task
@qimenjs/system-abilities → events, composable, registry, event-dom
```

**规则**：
- 可以依赖第 0-2 层的包
- 不能依赖同层或更高层的包

### 第 4 层：业务包（1 个）

```
@qimenjs/entity → composable, schema, context, http, cache, error, system-abilities, data-processor, registry, utils
```

**规则**：
- 可以依赖第 0-3 层的包
- 不能依赖同层的包

## 依赖检查规则

### 1. 禁止循环依赖

```
错误：A → B → C → A
```

### 2. 禁止反向依赖

```
错误：@qimenjs/logger → @qimenjs/entity  // logger 是第 0 层，不能依赖第 4 层
```

### 3. 禁止跨层依赖

```
错误：@qimenjs/utils → @qimenjs/entity  // 跨了 4 层
```

## 依赖可视化

```
entity (L4)
  ├─ composable (L2)
  ├─ schema (L2)
  ├─ context (L1)
  ├─ http (L3)
  ├─ cache (L1)
  ├─ error (L0)
  ├─ system-abilities (L3)
  ├─ data-processor (L3)
  ├─ registry (L1)
  └─ utils (L0)

http (L3)
  ├─ context (L1)
  ├─ pipeline (L2)
  ├─ registry (L1)
  └─ task (L1)

system-abilities (L3)
  ├─ events (L1)
  ├─ composable (L2)
  ├─ registry (L1)
  └─ event-dom (L2)

data-processor (L3)
  ├─ registry (L1)
  ├─ context (L1)
  └─ pipeline (L2)

event-dom (L2)
  ├─ events (L1)
  ├─ utils (L0)
  ├─ runtime (L0)
  ├─ logger (L0)
  ├─ error (L0)
  └─ async (L0)

composable (L2)
  ├─ logger (L0)
  └─ async (L0)

pipeline (L2)
  ├─ logger (L0)
  └─ context (L1)

schema (L2)
  └─ registry (L1)

context (L1)
  └─ registry (L1)

task (L1)
  ├─ logger (L0)
  ├─ utils (L0)
  ├─ error (L0)
  └─ runtime (L0)

validation (L1)
  └─ registry (L1)

cache (L1)
  ├─ logger (L0)
  └─ utils (L0)

events (L1)
  ├─ logger (L0)
  └─ utils (L0)

registry (L1)
  └─ error (L0)
```

## 参考资料

- [文档导航](../../SUMMARY.md) - 文档总览
- [引用规范](./imports.md) - 如何引用其他包
