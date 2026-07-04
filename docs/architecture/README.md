# OrbitJS 架构文档

本目录包含 OrbitJS 的完整架构文档，包括架构原则、包说明等。

## 文档结构

```
docs/architecture/
├── README.md                    # 本文件
├── principles/                  # 架构原则
│   ├── dependencies.md         # 依赖管理原则
│   ├── imports.md              # 引用规范
│   └── boundary-defense.md     # 边界与防御原则
└── packages/                    # 包文档
    ├── README.md               # 包汇总
    ├── composable.md           # composable 包
    ├── context.md              # context 包
    ├── data-processor.md       # data-processor 包
    ├── error.md                # error 包
    ├── event-dom.md            # event-dom 包
    ├── schema.md               # schema 包
    ├── system-abilities.md     # system-abilities 包
    ├── utils.md                # utils 包
    └── validation.md           # validation 包
```

## 快速导航

### 架构原则
- [依赖管理原则](./principles/dependencies.md) - 包的依赖关系和层级
- [引用规范](./principles/imports.md) - 如何正确引用其他包
- [边界与防御原则](./principles/boundary-defense.md) - 输入校验和防御代码的职责划分

### 包文档
- [包汇总](./packages/README.md) - 所有包的概览
- 各包详细文档见 `packages/` 目录

### 设计决策
- [设计决策记录](../design-decisions/README.md) - 重要的设计决策

## 架构概览

### 包层级结构

```
第 0 层：核心基础包（7 个，零依赖）
├── @orbitjs/error
├── @orbitjs/logger
├── @orbitjs/utils
├── @orbitjs/async
├── @orbitjs/runtime
├── @orbitjs/crypto
└── @orbitjs/types

第 1 层：基础设施工具包（6 个，只依赖第 0 层）
├── @orbitjs/registry
├── @orbitjs/cache
├── @orbitjs/events
├── @orbitjs/validation
├── @orbitjs/task
└── @orbitjs/context

第 2 层：功能工具包（4 个，依赖第 0-1 层）
├── @orbitjs/schema
├── @orbitjs/pipeline
├── @orbitjs/composable
└── @orbitjs/event-dom

第 3 层：高级功能包（3 个，依赖第 0-2 层）
├── @orbitjs/data-processor
├── @orbitjs/http
└── @orbitjs/system-abilities

第 4 层：业务包（1 个）
└── @orbitjs/entity
```

### 核心原则

1. **零循环依赖** - 严格按照层级依赖，不能反向引用
2. **单一职责** - 每个包只负责一个明确的功能
3. **最小依赖** - 只依赖必要的包
4. **类型安全** - 所有包都有完整的类型定义
5. **可独立使用** - 每个包都可以独立安装和使用

## 相关文档

- [构建进度](../build-progress/README.md) - 构建进度
- [ComposableBase 最佳实践](../best-practices/composable-best-practices.md) - 能力系统最佳实践
