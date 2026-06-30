# OrbitJS 架构文档

本目录包含 OrbitJS 的完整架构文档，包括架构原则、包说明、构建规范等。

## 文档结构

```
docs/architecture/
├── README.md                    # 本文件
├── principles/                  # 架构原则
│   ├── dependencies.md         # 依赖管理原则
│   ├── imports.md              # 引用规范
│   ├── boundary-defense.md     # 边界与防御原则
│   ├── building.md             # 构建原则
│   └── testing.md              # 测试原则
├── packages/                    # 包文档
│   ├── README.md               # 包汇总
│   ├── error.md                # error 包
│   ├── logger.md               # logger 包
│   ├── utils.md                # utils 包
│   ├── async.md                # async 包
│   ├── runtime.md              # runtime 包
│   ├── crypto.md               # crypto 包
│   ├── context.md              # context 包
│   ├── registry.md             # registry 包
│   ├── cache.md                # cache 包
│   ├── events.md               # events 包
│   ├── task.md                 # task 包
│   ├── pipeline.md             # pipeline 包
│   ├── composable.md           # composable 包
│   ├── validation.md           # validation 包
│   ├── data-processor.md       # data-processor 包
│   ├── http.md                 # http 包
│   ├── system-abilities.md     # system-abilities 包
│   └── entity.md               # entity 包
└── design-decisions/           # 设计决策记录
    └── ...
```

## 快速导航

### 架构原则
- [依赖管理原则](./principles/dependencies.md) - 包的依赖关系和层级
- [引用规范](./principles/imports.md) - 如何正确引用其他包
- [边界与防御原则](./principles/boundary-defense.md) - 输入校验和防御代码的职责划分
- [构建原则](./principles/building.md) - 如何构建和打包
- [测试原则](./principles/testing.md) - 如何编写和组织测试

### 包文档
- [包汇总](./packages/README.md) - 所有包的概览
- 各包详细文档见 `packages/` 目录

### 设计决策
- [设计决策记录](../design-decisions/README.md) - 重要的设计决策

## 架构概览

### 包层级结构

```
第 0 层：核心基础包（7个，零依赖）
├── @orbitjs/error
├── @orbitjs/logger
├── @orbitjs/utils
├── @orbitjs/async
├── @orbitjs/runtime
├── @orbitjs/crypto
└── @orbitjs/context

第 1 层：基础设施工具包（6个，只依赖第0层）
├── @orbitjs/registry
├── @orbitjs/cache
├── @orbitjs/events
├── @orbitjs/task
├── @orbitjs/pipeline
└── @orbitjs/composable

第 2 层：功能工具包（4个，依赖第0-1层）
├── @orbitjs/schema
├── @orbitjs/validation
├── @orbitjs/data-processor
└── @orbitjs/event-dom

第 3 层：高级功能包（2个，依赖第0-2层）
├── @orbitjs/http
└── @orbitjs/system-abilities

第 4 层：业务包（1个）
└── @orbitjs/entity
```

### 核心原则

1. **零循环依赖** - 严格按照层级依赖，不能反向引用
2. **单一职责** - 每个包只负责一个明确的功能
3. **最小依赖** - 只依赖必要的包
4. **类型安全** - 所有包都有完整的类型定义
5. **可独立使用** - 每个包都可以独立安装和使用

## 如何使用本文档

### 新成员入门
1. 阅读 [架构概览](#架构概览)
2. 阅读 [依赖管理原则](./principles/dependencies.md)
3. 阅读 [引用规范](./principles/imports.md)
4. 查看感兴趣的包文档

### 开发者
1. 开发前阅读相关包的文档
2. 遵循引用规范
3. 遵循测试原则
4. 记录重要的设计决策

### 维护者
1. 定期更新包文档
2. 记录包的状态和问题
3. 更新架构原则（如有变化）
4. 审查设计决策

## 相关文档

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - 架构总览
- [BUILD_PROGRESS.md](../../BUILD_PROGRESS.md) - 构建进度
- [README.md](../../README.md) - 项目说明
