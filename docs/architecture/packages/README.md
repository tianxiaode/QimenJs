# QimenJS 包汇总

本文档提供所有包的概览，包括状态、依赖、测试覆盖率等信息。

## 包列表

### 第 0 层：核心基础包（8 个，零依赖）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| @qimenjs/error | 完成 | 通过 | 100% | 错误处理 |
| @qimenjs/logger | 完成 | 通过 | 100% | 日志系统 |
| @qimenjs/utils | 完成 | 通过 | ~95% | 工具函数 |
| @qimenjs/async | 完成 | 通过 | ~90% | 异步工具 |
| @qimenjs/runtime | 完成 | 通过 | ~85% | 运行时环境 |
| @qimenjs/crypto | 完成 | 通过 | 81% | 加密工具 |
| @qimenjs/types | 完成 | 通过 | - | 全局共享类型 |
| @qimenjs/i18n | 完成 | 通过 | ~90% | 国际化 |

### 第 1 层：基础设施工具包（6 个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| @qimenjs/registry | 完成 | 通过 | ~80% | 注册器系统 |
| @qimenjs/cache | 完成 | 通过 | ~85% | 缓存系统 |
| @qimenjs/events | 完成 | 通过 | ~80% | 事件系统 |
| @qimenjs/validation | 完成 | 通过 | 82% | 验证系统 |
| @qimenjs/task | 完成 | 通过 | ~85% | 任务系统 |
| @qimenjs/context | 完成 | 通过 | ~76% | 请求上下文 |

### 第 2 层：功能工具包（6 个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| @qimenjs/schema | 完成 | 通过 | 89% | Schema 定义系统 |
| @qimenjs/pipeline | 完成 | 通过 | ~95% | 管道执行器 |
| @qimenjs/composable | 完成 | 通过 | 90% | 可组合能力系统 |
| @qimenjs/event-dom | 完成 | 通过 | 100% | DOM 事件适配器 |
| @qimenjs/mime | 完成 | 通过 | ~90% | MIME 类型解析 |
| @qimenjs/pattern | 完成 | 通过 | ~85% | 设计模式工具 |

### 第 3 层：高级功能包（6 个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| @qimenjs/data-processor | 完成 | 通过 | 88% | 数据处理器 |
| @qimenjs/http | 完成 | 通过 | 87% | HTTP 客户端 |
| @qimenjs/system-abilities | 完成 | 通过 | 88% | 系统能力集 |
| @qimenjs/oauth2 | 完成 | 通过 | ~85% | OAuth2 认证 |
| @qimenjs/data-processor-abp | 完成 | 通过 | ~85% | ABP 数据处理器 |
| @qimenjs/data-processor-spring | 完成 | 通过 | ~85% | Spring 数据处理器 |

### 第 4 层：业务包（1 个）

| 包名 | 状态 | 测试 | 分支覆盖率 | 说明 |
|------|------|------|------------|------|
| @qimenjs/entity | 完成 | 通过 | 83% | 实体管理框架 |

## 统计信息

| 指标 | 数值 |
|------|------|
| 总包数 | 27 |
| 已完成 | 27 |
| 全局分支覆盖率 | ~87% |

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

oauth2 (L3)
  ├─ http (L3)
  ├─ context (L1)
  └─ logger (L0)

data-processor-abp (L3)
  ├─ data-processor (L3)
  └─ context (L1)

data-processor-spring (L3)
  ├─ data-processor (L3)
  └─ context (L1)

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

mime (L2)
  └─ utils (L0)

pattern (L2)
  └─ utils (L0)

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

- [架构概览](../README.md) - 架构原则和层级
- [构建进度](../../build-progress/README.md) - 各包构建进度
- [依赖管理原则](../principles/dependencies.md) - 依赖关系
