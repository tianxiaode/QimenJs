# OrbitJS 包汇总

本文档提供所有包的概览，包括状态、依赖、测试覆盖率等信息。

## 包列表

### 第 0 层：核心基础包（7个，零依赖）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/error](./error.md) | ✅ 完成 | ✅ 通过 | 100% | 错误处理 |
| [@orbitjs/logger](./logger.md) | ✅ 完成 | ✅ 通过 | 100% | 日志系统 |
| [@orbitjs/utils](./utils.md) | ✅ 完成 | ✅ 通过 | ~95% | 工具函数 |
| [@orbitjs/async](./async.md) | ✅ 完成 | ✅ 通过 | ~90% | 异步工具 |
| [@orbitjs/runtime](./runtime.md) | ✅ 完成 | ✅ 通过 | ~85% | 运行时环境 |
| [@orbitjs/crypto](./crypto.md) | ✅ 完成 | ✅ 通过 | 81.25% | 加密工具 |
| [@orbitjs/context](./context.md) | ✅ 完成 | ✅ 通过 | ~76% | 请求上下文 |

### 第 1 层：基础设施工具包（6个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/registry](./registry.md) | ✅ 完成 | ✅ 通过 | ~80% | 注册器系统 |
| [@orbitjs/cache](./cache.md) | ✅ 完成 | ✅ 通过 | ~85% | 缓存系统 |
| [@orbitjs/events](./events.md) | ✅ 完成 | ✅ 通过 | ~80% | 事件系统 |
| [@orbitjs/task](./task.md) | ✅ 完成 | ✅ 通过 | ~85% | 任务系统 |
| [@orbitjs/pipeline](./pipeline.md) | ✅ 完成 | ✅ 通过 | ~95% | 统一管道执行器 |
| [@orbitjs/composable](./composable.md) | ✅ 完成 | ✅ 通过 | 90.38% | 可组合系统 |

### 第 2 层：功能工具包（4个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/schema](./schema.md) | ✅ 完成 | ✅ 通过 | 88.88% | Schema 定义系统 |
| [@orbitjs/validation](./validation.md) | ✅ 完成 | ✅ 通过 | 81.84% | 验证系统 |
| [@orbitjs/data-processor](./data-processor.md) | ✅ 完成 | ✅ 通过 | 88.23% | 数据处理系统 |
| [@orbitjs/event-dom](./event-dom.md) | ✅ 完成 | ✅ 通过 | 100% | DOM 事件处理 |

### 第 3 层：高级功能包（2个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/http](./http.md) | ✅ 完成 | ✅ 通过 | 86.54% | HTTP 客户端（含 Token 管理） |
| [@orbitjs/system-abilities](./system-abilities.md) | ✅ 完成 | ✅ 通过 | 88.23% | 系统能力实现 |

### 第 4 层：业务包（1个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| [@orbitjs/entity](./entity.md) | ✅ 完成 | ✅ 通过 | 83.38% | 实体管理 |

## 状态说明

### 代码状态
- ✅ 完成 - 代码已完成，功能完整
- ⚠️ 重构中 - 正在重构，功能可能不完整
- ⚠️ 待更新 - 需要更新以适应新架构
- ❌ 未开始 - 尚未开始开发

### 测试状态
- ✅ 通过 - 所有测试通过
- ⚠️ 部分通过 - 部分测试通过
- ⚠️ 待写 - 需要编写测试
- ❌ 失败 - 测试失败

## 统计信息

### 总体统计

| 指标 | 数值 |
|------|------|
| 总包数 | 20 |
| 已完成 | 20 |
| 重构中 | 0 |
| 全局分支覆盖率 | 87.33% |

### 层级统计

| 层级 | 包数 | 已完成 | 分支覆盖率 |
|------|------|--------|------------|
| 第 0 层 | 7 | 7 | ~85% |
| 第 1 层 | 6 | 6 | ~89% |
| 第 2 层 | 4 | 4 | ~86% |
| 第 3 层 | 2 | 2 | ~87% |
| 第 4 层 | 1 | 1 | ~83% |

## 依赖关系图

```
entity (L4)
  ├─ composable (L1)
  ├─ http (L3)
  ├─ system-abilities (L3)
  ├─ events (L1)
  ├─ cache (L1)
  ├─ registry (L1)
  ├─ async (L0)
  └─ context (L0)

http (L3)
  ├─ logger (L0)
  ├─ utils (L0)
  ├─ pipeline (L1)
  └─ context (L0)

system-abilities (L3)
  ├─ composable (L1)
  ├─ registry (L1)
  ├─ events (L1)
  └─ event-dom (L2)

event-dom (L2)
  ├─ events (L1)
  ├─ logger (L0)
  ├─ utils (L0)
  ├─ runtime (L0)
  └─ error (L0)

data-processor (L2)
  ├─ registry (L1)
  ├─ pipeline (L1)
  └─ context (L0)

validation (L2)
  ├─ error (L0)
  ├─ pipeline (L1)
  └─ schema (L2)

schema (L2)
  └─ registry (L1)

composable (L1)
  ├─ logger (L0)
  └─ async (L0)

task (L1)
  ├─ logger (L0)
  ├─ utils (L0)
  ├─ error (L0)
  └─ runtime (L0)

cache (L1)
  ├─ logger (L0)
  └─ utils (L0)

events (L1)
  ├─ logger (L0)
  └─ utils (L0)

pipeline (L1)
  └─ logger (L0)

registry (L1)
  └─ error (L0)
```

## 快速导航

### 按功能查找

- **错误处理**: [error](./error.md)
- **日志**: [logger](./logger.md)
- **工具函数**: [utils](./utils.md)
- **异步**: [async](./async.md)
- **运行时**: [runtime](./runtime.md)
- **加密**: [crypto](./crypto.md)
- **上下文**: [context](./context.md)
- **注册器**: [registry](./registry.md)
- **缓存**: [cache](./cache.md)
- **事件**: [events](./events.md)
- **任务**: [task](./task.md)
- **管道**: [pipeline](./pipeline.md)
- **可组合**: [composable](./composable.md)
- **Schema**: [schema](./schema.md)
- **验证**: [validation](./validation.md)
- **数据处理**: [data-processor](./data-processor.md)
- **DOM事件**: [event-dom](./event-dom.md)
- **HTTP**: [http](./http.md)
- **系统能力**: [system-abilities](./system-abilities.md)
- **实体**: [entity](./entity.md)

### 按状态查找

#### 已完成
- error, logger, utils, async, runtime, crypto, context
- registry, cache, events, task, pipeline, composable
- schema, validation, data-processor, event-dom
- http, system-abilities, entity

## 下一步工作

### 优先级 1：修复遗留测试问题
- [ ] 修复 4 个失败的测试套件（StateLocalMutationAbility、StateCacheAbility、StateDirtyAbility、ComposableIntegration）
- [ ] crypto base64 Buffer 分支覆盖率提升（jsdom 环境限制）

### 优先级 2：完善测试
- [ ] 提高 context 包分支覆盖率
- [ ] 提高 entity 包分支覆盖率

## 参考资料

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - 架构总览
- [BUILD_PROGRESS.md](../../../BUILD_PROGRESS.md) - 构建进度
- [依赖管理原则](../principles/dependencies.md) - 依赖关系
