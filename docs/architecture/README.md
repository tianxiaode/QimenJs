# QimenJS 架构文档

本目录包含 QimenJS 的完整架构文档，包括架构原则、包说明等。

## 文档结构

```
docs/architecture/
├── README.md                    # 本文件
├── component-ability-index.md  # 组件能力索引（组件-能力映射、事件体系、分页设计等）
├── render-pipeline.md          # 渲染流程设计（基于 LayoutNode 的创建/初始化/渲染流程）
├── ui-component-design.md      # UI 组件层设计方案
├── token-management.md         # Token 管理设计
├── principles/                  # 架构原则
│   ├── dependencies.md         # 依赖管理原则
│   ├── imports.md              # 引用规范
│   └── boundary-defense.md     # 边界与防御原则
└── packages/                    # 包文档
    ├── README.md               # 包汇总
    ├── composable.md           # composable 包
    ├── component-ability-mapping.md # 组件-能力映射
    ├── context.md              # context 包
    ├── data-processor.md       # data-processor 包
    ├── error.md                # error 包
    ├── event-dom.md            # event-dom 包
    ├── i18n.md                 # i18n 包
    ├── icon.md                 # icon 包
    ├── oauth2.md               # oauth2 包
    ├── permission.md           # permission 包
    ├── schema.md               # schema 包
    ├── system-abilities.md     # system-abilities 包
    ├── theme.md                # theme 包
    ├── utils.md                # utils 包
    └── validation.md           # validation 包
```

## 快速导航

### 架构原则
- [依赖管理原则](./principles/dependencies.md) - 包的依赖关系和层级
- [引用规范](./principles/imports.md) - 如何正确引用其他包
- [边界与防御原则](./principles/boundary-defense.md) - 输入校验和防御代码的职责划分

### 组件层
- [组件能力索引](./component-ability-index.md) - 组件-能力映射、事件体系、分页设计等（增量更新）
- [渲染流程设计](./render-pipeline.md) - 基于 LayoutNode 的创建/初始化/渲染流程
- [UI 组件层设计方案](./ui-component-design.md) - 组件层整体设计

### 包文档
- [包汇总](./packages/README.md) - 所有包的概览
- 各包详细文档见 `packages/` 目录

### 设计决策
- [设计决策记录](../design-decisions/README.md) - 重要的设计决策

## 架构概览

### 包层级结构

```
第 0 层：核心基础包（8 个，零依赖或极轻依赖）
├── @qimenjs/error
├── @qimenjs/logger
├── @qimenjs/utils
├── @qimenjs/async
├── @qimenjs/runtime
├── @qimenjs/crypto
├── @qimenjs/types
└── @qimenjs/i18n

第 1 层：基础设施工具包（7 个，只依赖第 0 层）
├── @qimenjs/registry
├── @qimenjs/cache
├── @qimenjs/events
├── @qimenjs/validation
├── @qimenjs/task
├── @qimenjs/composable
└── @qimenjs/context

第 2 层：功能工具包（5 个，依赖第 0-1 层）
├── @qimenjs/schema
├── @qimenjs/pipeline
├── @qimenjs/event-dom
├── @qimenjs/mime
└── @qimenjs/pattern

第 3 层：高级功能包（6 个，依赖第 0-2 层）
├── @qimenjs/data-processor
├── @qimenjs/http
├── @qimenjs/system-abilities
├── @qimenjs/oauth2
├── @qimenjs/data-processor-abp
└── @qimenjs/data-processor-spring

第 4 层：业务包（2 个）
├── @qimenjs/entity
└── @qimenjs/router

UI 层（8 个，依赖应用层及以下）
├── @qimenjs/component-core
├── @qimenjs/component-abilities
├── @qimenjs/component
├── @qimenjs/layout
├── @qimenjs/theme
├── @qimenjs/icon
├── @qimenjs/imperative
└── @qimenjs/permission
```

### 核心原则

1. **零循环依赖** - 严格按照层级依赖，不能反向引用
2. **单一职责** - 每个包只负责一个明确的功能
3. **最小依赖** - 只依赖必要的包
4. **类型安全** - 所有包都有完整的类型定义
5. **可独立使用** - 每个包都可以独立安装和使用

### 关键架构模式

1. **Ability/Composable 模式** - `ComposableBase` 基类 + `AbilityDefinition` 纯对象，通过 `Object.defineProperty` 复制到宿主
2. **Registry 模式** - `RegistrarBase<M>` 抽象基类 + `RegistryHub` 中央管理
3. **Pipeline 模式** - weight+offset 排序、熔断、追踪、计时、统计
4. **Entity Manager 模式** - 5 种 Manager 通过 Ability 组合获得不同功能
5. **Component 模式** - `TemplateComponent.withTemplate()` 预编译 + 纯克隆实例化
6. **EventBridge 单例模式** - 统一 eventScope 路由，解决跨作用域事件通信
7. **自动注册模式** - 模块导入时自动注册，"引入即注册"约定

## 相关文档

- [构建进度](../build-progress/README.md) - 构建进度
- [ComposableBase 最佳实践](../best-practices/composable-best-practices.md) - 能力系统最佳实践
