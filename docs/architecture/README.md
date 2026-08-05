# QimenJS 架构文档

本目录包含 QimenJS 的完整架构文档，按核心概念组织。

## 核心架构文档

| 文档 | 说明 |
|------|------|
| [ComposableBase 能力模式](./composable-ability-pattern.md) | 能力注入机制、use/with、abilityState、dispose 生命周期、InferAbilities 类型推导、内置能力一览 |
| [注册表系统](./registry-system.md) | RegistryHub、DomainRegistrar（多平台对接核心）、SystemRegistrar、MimeTypeRegistrar、PatternRegistrar、锁定机制 |
| [事件系统](./event-system.md) | 7 种事件总线、EventScope、domEvents/listens/childEvents、handler 命名规则、EventForwarder、ComponentEntityDispatch、ACTION_PAIRS |
| [组件编译引擎与模板系统](./compile-engine-and-template.md) | 编译时预编译、实例化管线（3 Phase）、NodeMap、组件间通信、编译优化策略、useTemplate |
| [HTTP 管道与平台适配](./http-pipeline.md) | HttpClient、4 阶段管道、DataProcessor、ABP/Spring 适配、preset 联动、自定义平台适配 |
| [验证管道与 Schema](./validation-pipeline.md) | 验证管道模式、7 个验证阶段、ValidatorRegistrar、自定义验证器、Schema 协作、i18n 错误消息 |
| [实体管理与权限系统](./entity-and-permission.md) | 5 种 EntityManager、实体事件协同、defaultEntityErrorHandler/LoadingHandler、PermissionRegistrar、权限事件驱动、组件自动应用权限 |
| [i18n 国际化系统](./i18n-system.md) | 零依赖设计、模板节点自动翻译、系统总线语言切换、错误码多语言查找、resolveI18nValue |
| [主题系统](./theme-system.md) | CSS 变量驱动、ThemeRegistrar、flattenTokens、themeAware、10 个中国传统色主题 |
| [路由系统](./router-system.md) | Hash/History 双模式、RouteEventBus、路径参数匹配、路由守卫 |
| [任务队列与 Worker](./task-queue-and-worker.md) | GlobalTaskQueue、优先级调度、WorkerManager、HashTask 子系统 |
| [日志与错误处理](./logger-and-error.md) | Logger 层次、级别过滤、ErrorBase 体系、KernelErrorCode、错误码与 i18n 联动 |
| [钩子函数体系](./lifecycle-hooks.md) | 完整钩子列表、初始化/运行时/销毁执行顺序、实体操作钩子 |

## 其他文档

### 架构原则
- [依赖管理原则](./principles/dependencies.md) - 包的依赖关系和层级
- [引用规范](./principles/imports.md) - 如何正确引用其他包
- [边界与防御原则](./principles/boundary-defense.md) - 输入校验和防御代码的职责划分

### 组件层参考
- [组件能力索引](./component-ability-index.md) - 组件-能力映射、事件体系、分页设计等
- [UI 组件层设计方案](./ui-component-design.md) - 组件层整体设计

### 包文档
- [包汇总](./packages/README.md) - 所有包的概览
- 各包详细文档见 `packages/` 目录

### 设计决策
- [设计决策记录](../design-decisions/README.md) - 重要的设计决策

## 架构概览

### 包层级结构

```
第 0 层：核心基础包（9 个，零依赖或极轻依赖）
├── @qimenjs/error
├── @qimenjs/logger
├── @qimenjs/utils
├── @qimenjs/async
├── @qimenjs/runtime
├── @qimenjs/crypto
├── @qimenjs/types
├── @qimenjs/i18n
└── @qimenjs/context

第 1 层：基础设施工具包（6 个，只依赖第 0 层）
├── @qimenjs/registry
├── @qimenjs/cache
├── @qimenjs/events
├── @qimenjs/task
├── @qimenjs/composable
└── @qimenjs/pipeline

第 2 层：功能工具包（7 个，依赖第 0-1 层）
├── @qimenjs/schema
├── @qimenjs/validation
├── @qimenjs/event-dom
├── @qimenjs/mime
├── @qimenjs/pattern
├── @qimenjs/data-processor
└── @qimenjs/permission

第 3 层：高级功能包（5 个，依赖第 0-2 层）
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
├── @qimenjs/markdown
├── @qimenjs/theme
├── @qimenjs/icon
└── @qimenjs/imperative
```

### 核心原则

1. **零循环依赖** - 严格按照层级依赖，不能反向引用
2. **单一职责** - 每个包只负责一个明确的功能
3. **最小依赖** - 只依赖必要的包
4. **类型安全** - 所有包都有完整的类型定义
5. **可独立使用** - 每个包都可以独立安装和使用

### 关键架构模式

1. **Ability/Composable 模式** - `ComposableBase` 基类 + `AbilityDefinition` 纯对象，通过 `withAbilities` 注入到类原型，`InferAbilities` 自动推导接口 → [详见](./composable-ability-pattern.md)
2. **Registry 模式** - `RegistrarBase<M>` 抽象基类 + `RegistryHub` 中央管理 → [详见](./registry-system.md)
3. **Pipeline 模式** - weight+offset 排序、熔断、追踪、计时、统计 → [详见](./http-pipeline.md)
4. **Entity Manager 模式** - 5 种 Manager 通过 `extends + withAbilities + InferAbilities` 组合获得不同功能 → [详见](./entity-and-permission.md)
5. **Component 模式** - 编译时预编译 + 运行时纯克隆实例化 + 管道化初始化 → [详见](./compile-engine-and-template.md)
6. **EventBus 模式** - 分层总线 + scopeId 隔离，7 种专用总线 → [详见](./event-system.md)
7. **自动注册模式** - 模块导入时自动注册，"引入即注册"约定

## 相关文档

- [最佳实践](../best-practices/) - 各模块最佳实践
- [设计决策](../design-decisions/README.md) - 重要的设计决策
