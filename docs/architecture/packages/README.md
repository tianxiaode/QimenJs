# OrbitJS 包汇总

本文档提供所有包的概览，包括状态、依赖、测试覆盖率等信息。

## 包列表

### 第 0 层：核心基础包（7 个，零依赖）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/error](./error.md) | 完成 | 通过 | 100% | 错误处理 |
| [@orbitjs/logger](./logger.md) | 完成 | 通过 | 100% | 日志系统 |
| [@orbitjs/utils](./utils.md) | 完成 | 通过 | ~95% | 工具函数 |
| [@orbitjs/async](./async.md) | 完成 | 通过 | ~90% | 异步工具 |
| [@orbitjs/runtime](./runtime.md) | 完成 | 通过 | ~85% | 运行时环境 |
| [@orbitjs/crypto](./crypto.md) | 完成 | 通过 | 81% | 加密工具 |
| [@orbitjs/types](./types.md) | 完成 | 通过 | - | 全局共享类型 |

### 第 1 层：基础设施工具包（6 个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/registry](./registry.md) | 完成 | 通过 | ~80% | 注册器系统 |
| [@orbitjs/cache](./cache.md) | 完成 | 通过 | ~85% | 缓存系统 |
| [@orbitjs/events](./events.md) | 完成 | 通过 | ~80% | 事件系统 |
| [@orbitjs/validation](./validation.md) | 完成 | 通过 | 82% | 验证系统 |
| [@orbitjs/task](./task.md) | 完成 | 通过 | ~85% | 任务系统 |
| [@orbitjs/context](./context.md) | 完成 | 通过 | ~76% | 请求上下文 |

### 第 2 层：功能工具包（4 个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/schema](./schema.md) | 完成 | 通过 | 89% | Schema 定义系统 |
| [@orbitjs/pipeline](./pipeline.md) | 完成 | 通过 | ~95% | 管道执行器 |
| [@orbitjs/composable](./composable.md) | 完成 | 通过 | 90% | 可组合能力系统 |
| [@orbitjs/event-dom](./event-dom.md) | 完成 | 通过 | 100% | DOM 事件适配器 |

### 第 3 层：高级功能包（3 个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/data-processor](./data-processor.md) | 完成 | 通过 | 88% | 数据处理器 |
| [@orbitjs/http](./http.md) | 完成 | 通过 | 87% | HTTP 客户端 |
| [@orbitjs/system-abilities](./system-abilities.md) | 完成 | 通过 | 88% | 系统能力集 |

### 第 4 层：业务包（1 个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/entity](./entity.md) | 完成 | 通过 | 83% | 实体管理框架 |

## 统计信息

| 指标 | 数值 |
|------|------|
| 总包数 | 21 |
| 已完成 | 21 |
| 全局分支覆盖率 | 87% |
| 测试套件 | 203 |
| 测试用例 | 2235 |

## 依赖关系图

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
- [构建进度](../../build-progress/README.md) - 构建进度
- [依赖管理原则](../principles/dependencies.md) - 依赖关系
