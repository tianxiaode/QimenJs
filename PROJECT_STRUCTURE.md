# QimenJS 项目结构说明

> 本文档供新会话快速了解项目框架，避免每次遍历。最后更新：2026-07-10，基于 v0.2.0。

## 项目概览

| 属性 | 值 |
|------|-----|
| 项目名称 | QimenJS (qimenjs) |
| 版本 | 0.2.0 |
| 定位 | 现代化 TypeScript 基础设施库 — 奇门遁甲，排兵布阵 |
| 语言 | TypeScript 5.0+ (target ES2021, module ESNext) |
| 运行时依赖 | **零** (仅 devDependencies) |
| 包管理 | pnpm |
| 测试 | Jest 29+ / ts-jest (jsdom, 80% 覆盖率阈值) |
| 构建 | 自定义 scripts/build.js |
| 仓库 | https://github.com/tianxiaode/QimenJs |

## 五层架构

```
Layer 0 (基础层)  → error, logger, utils, async, runtime, crypto, i18n, context
Layer 1 (核心层)  → registry, events, cache, pipeline, composable, task, schema
Layer 2 (数据层)  → data-processor, validation, event-dom, mime, pattern, template
Layer 3 (服务层)  → http, oauth2, data-processor-abp, data-processor-spring, system-abilities
Layer 4 (应用层)  → entity, types
UI 层             → component-core, component-abilities, component, layout, renderer, theme, imperative, permission
```

依赖方向：高层可依赖低层，不可反向。UI 层依赖应用层及以下。

## 核心架构模式

### 1. Ability/Composable 模式

框架最核心的设计模式。`ComposableBase` 是所有可组合对象的基类，`AbilityDefinition` 是普通对象，其属性/方法/getter/setter 通过 `Object.defineProperty` 复制到宿主。

- 组件通过 `static readonly abilities` 数组声明所需能力
- 能力有特殊协议属性：`__propAliases`（属性别名映射）、`__initProps`（从 props 初始化）、`__init__`（初始化方法名）
- 关键文件：`src/composable/ComposableBase.ts`

### 2. Registry 模式

`RegistrarBase<M>` 抽象基类派生出多个单例注册器，`RegistryHub` 中央管理所有注册器。

注册器类型：System, Domain, Schema, Validator, DataProcessor, MimeType, Pattern, Component, Permission

- 关键文件：`src/registry/RegistryHub.ts`、`src/registry/registrars/RegistrarBase.ts`

### 3. Pipeline 模式

`Pipeline` 执行器支持 weight+offset 排序、熔断、追踪、计时、统计。

- HTTP 请求管道：PREPARE(100) → EXCHANGE(200) → PROCESS(300) → ALIGN(400)
- 数据处理管道：DataProcessorRegistrar + Pipeline
- 验证管道：ValidatorRegistrar + Pipeline
- 关键文件：`src/pipeline/executor.ts`

### 4. Entity Manager 模式

`CoreEntityManager`（能力：Event+Domain+System+Schema）→ `BaseEntityManager` → 5 种具体 Manager：

| Manager | 能力组合 |
|---------|---------|
| LocalReadonlyEntityManager | FlatLocalState + LocalList + LocalGet |
| LocalCrudEntityManager | + FlatLocalMutation + FlatLocalDelete |
| RemoteReadonlyEntityManager | + SchemaProxy + Cache + Dirty + Search + DomainPaging + FlatRemoteState + FlatRemoteList + FlatRemoteGetAll + RemoteGet + FlatRemoteQuery |
| RemoteCrudEntityManager | + RemoteCreate + Update + Delete + Toggle |
| RemoteTreeEntityManager | + TreePath + TreeLifecycle + TreeSearch + TreeView + TreeRemoteState |

组件通过 EntityAbility 系列能力代理 Manager 方法。

### 5. Component 模式

- `ComponentBase` extends ComposableBase，标准能力 = `[EventAbility, DomEventsAbility, PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility]`
- 9 阶段渲染管线（Renderer）：创建实例 → 创建el+注入模板 → 初始化能力 → 赋值属性 → 绑定事件 → 条件/循环/响应式 → 挂载DOM → 递归渲染children → 生命周期
- HTML 模板注入 + data-content 内容管理
- EventBridgeAbility 声明式事件桥接
- dirtySet + flush() 延迟刷新机制

### 6. 自动注册模式

模块导入时自动注册：`registerComponentTemplates()`、`registerValidationPatterns()`、`registerCommonMimeTypes()`。遵循"引入即注册"的约定。

## src 目录完整结构

### Layer 0 — 基础层

#### `src/async/` — 异步工具 `@qimenjs/async`
```
debounce.ts, throttle.ts, index.ts
```
防抖和节流函数。

#### `src/cache/` — 缓存管理 `@qimenjs/cache`
```
BaseCacheProvider.ts, MemoryProvider.ts, CacheFactory.ts, types.ts, types/cache.ts, types/index.ts, index.ts
```
LRU + TTL 缓存管理框架。`BaseCacheProvider` 抽象基类，`MemoryProvider` 内存 Map 实现。

#### `src/context/` — 请求/事件上下文 `@qimenjs/context`
```
base/BaseContext.ts, base/ExecutionStep.ts, base/index.ts
EventContext.ts, EventContextBuilder.ts, RequestContextBuilder.ts
types/request-context.ts, types/index.ts, index.ts
```
请求上下文贯穿数据处理管道（prepare → exchange → process → align）。`RequestContext` 包含 identity/request/response/data/metadata/schema。

#### `src/crypto/` — 哈希与编解码 `@qimenjs/crypto`
```
md5.ts, sha1.ts, sha256.ts, sha512.ts, xxhash64.ts, base64.ts, index.ts
```
多种哈希算法和 Base64 编解码。

#### `src/error/` — 统一错误体系 `@qimenjs/error`
```
ErrorBase.ts, KernelError.ts, GestureError.ts, codes.ts, index.ts
```
`ErrorBase` 抽象基类（code, timestamp, context），`KernelError` 继承 ErrorBase，`KernelErrorCode` 枚举。

#### `src/i18n/` — 国际化 `@qimenjs/i18n`
```
i18n.iife.js, i18n-utils.ts, copy.js, global.d.ts
locales/zh-CN.js, locales/en-US.js, locales/fr-FR.js
types/, index.ts
```
运行时 I18nManager 通过 `<script>` 加载到 `window.__qimen_i18n__`，支持动态语言包加载。

#### `src/logger/` — 日志系统 `@qimenjs/logger`
```
Logger.ts, LoggerChild.ts, format.ts, color.ts, sinks/console.ts, types.ts, index.ts
```
多级别 + 多输出的日志系统，支持子日志器。

#### `src/runtime/` — 运行时环境检测 `@qimenjs/runtime`
```
platform.ts, locale.ts, timezone.ts, user-agent.ts, features.ts, input.ts, memory.ts, runtime.ts, index.ts
```
浏览器/Node/未知平台检测，`getRuntimeEnv()` 组合检测。

#### `src/utils/` — 通用工具函数 `@qimenjs/utils` (89 文件)
```
array/         — base, collection, random, search, set, sort
color/         — generateColorShades, hex/hsl/rgb 互转
cookie/        — get/set/remove/has 等操作
date/          — calculation, calendar, format, utils
geometry/      — align, clamp, point, rect, snap, vector, transform
number/        — base, format
object/        — base, clone, iterate, properties
string/        — base, css, format, id, plural
time/          — after, delay, repeat
units/         — angle, format, length, parse, percent, resolve, time
composeMixins.ts, download.ts, index.ts
```
按领域组织的通用工具函数库。

### Layer 1 — 核心层

#### `src/composable/` — 能力组合系统 `@qimenjs/composable`
```
ComposableBase.ts, DescriptorFactory.ts, types/composable.ts, index.ts
```
框架核心模式。`ComposableBase` 提供 abilityState()、setAbilityState()、debounce()、onCleanup()、collectAbilities()、setupAbilities()、dispose() 等方法。

#### `src/registry/` — 注册表中心 `@qimenjs/registry`
```
RegistryHub.ts, registrars/RegistrarBase.ts, registrars/SystemRegistrar.ts
registrars/DomainRegistrar.ts
registrars/errors.ts, registrars/index.ts, types.ts, errors.ts, index.ts
```
`RegistryHub` 中央注册中心，管理所有注册器，锁机制。`RegistrarBase` 抽象基类（单例, 锁, 存储）。

#### `src/events/` — 事件系统 `@qimenjs/events`
```
EventBus.ts, EventScope.ts, GlobalEventBus.ts, EventSourceRegistrar.ts
EventFlowRegistrar.ts, StateTrigger.ts, I18nEventBridge.ts
entity-events.ts, component-events.ts
types/core.ts, types/bus.ts, types/scope.ts, index.ts
```
发布/订阅事件总线，支持作用域、声明式绑定、i18n 桥接。`GlobalEventBus` 应用级单例。

#### `src/pipeline/` — 管道执行器 `@qimenjs/pipeline`
```
executor.ts, types.ts, index.ts
```
`Pipeline` 类：weight+offset 排序、熔断、追踪、计时、统计。

#### `src/task/` — 任务调度 + 哈希任务 + Worker `@qimenjs/task` (44 文件)
```
task/TaskQueue.ts, task/types.ts
worker/WorkerManagerBase.ts, worker/SimpleWorkerManager.ts, worker/types.ts
hash-task/chunk/, hash-task/hash/, hash-task/worker/, hash-task/types/, hash-task/errors/
hash-task/factory.ts
errors/WorkerError.ts, errors/WorkerInitializationError.ts, index.ts
```
优先级任务队列（含重试）+ 完整的哈希计算系统（分块+Worker池+健康监控）。

#### `src/schema/` — Schema 定义系统 `@qimenjs/schema`
```
SchemaRegistrar.ts, types/schema.ts, types/rule.ts, types/index.ts, presets.ts, index.ts
```
实体 Schema + 字段组注册，编译缓存。`ValidationPatternType` 枚举 19 种模式。

### Layer 2 — 数据层

#### `src/data-processor/` — 数据处理管道框架 `@qimenjs/data-processor`
```
DataProcessorRegistrar.ts, executor.ts, types.ts, weights.ts, register.ts, errors/index.ts, README.md, index.ts
```
管道式请求/响应数据处理框架，`DataProcessorRegistrar` extends RegistrarBase，tags + weight 排序。

#### `src/validation/` — 验证引擎 `@qimenjs/validation` (82 文件)
```
core/ValidatorRegistrar.ts, core/validate.ts, core/executor.ts
engine/validate.ts
processors/array/, processors/boolean/, processors/common/, processors/compare/
processors/date/, processors/file/, processors/format/, processors/number/
processors/object/, processors/password/, processors/split/, processors/string/
errors/, types/, utils/, index.ts
```
规则 + 链式验证引擎，11 种类型处理器。`ValidatorRegistrar` extends RegistrarBase，tag 过滤，链缓存。

#### `src/event-dom/` — DOM 事件适配 + 手势识别 `@qimenjs/event-dom` (26 文件)
```
adapters/dom/DomEventAdapter.ts
adapters/processors/ — 8 种手势处理器 (Tap, DoubleTap, LongPress, Swipe, Drag, Hover, ContextMenu, Submit)
adapters/semantic-map/ — 原子信号 → 语义事件映射
adapters/utils/validation.ts, adapters/createEventAdapter.ts
types/adapters/, index.ts
```
DOM 事件适配，8 种手势识别。

#### `src/mime/` — MIME 类型管理 `@qimenjs/mime`
```
MimeTypeRegistrar.ts, presets.ts, register.ts, index.ts
```
MIME 类型解析，双向查找。

#### `src/pattern/` — 命名正则模式注册表 `@qimenjs/pattern`
```
PatternRegistrar.ts, presets.ts, register.ts, index.ts
```
命名正则模式注册，内置 19 种模式（email, url, ipv4, phone, uuid 等）。

#### `src/template/` — 模板管理 `@qimenjs/template`
```
TemplateRegistrar.ts, presets.ts, register.ts, constants.ts, index.ts
```
模板注册器 + 组件预设模板 + 模板常量。`TemplateRegistrar` extends RegistrarBase，懒创建 `<template>` 缓存 + cloneNode 复用。引入即自动注册 15 种组件模板，同时注册到 RegistryHub（键 `'template'`）。

### Layer 3 — 服务层

#### `src/http/` — HTTP 客户端 `@qimenjs/http` (22 文件)
```
HttpClient.ts, HttpExecutor.ts, HttpActionRegistrar.ts, StreamClient.ts, factory.ts
actions/prepare/ — CommonParamsEnricher, TokenInjector, UrlBuilder
actions/exchange/ — FetchTransport, XhrTransport
actions/process/ — DataParser, ResponseAnalyzer
actions/align/ — DownloadInterceptor
types/http.ts, types/http-context.ts, index.ts
```
HTTP 客户端，拦截器 + 重试 + 缓存 + SSE 流式。4 阶段管道：PREPARE(100) → EXCHANGE(200) → PROCESS(300) → ALIGN(400)。

#### `src/oauth2/` — OAuth2 认证 `@qimenjs/oauth2`
```
OAuth2Manager.ts, TokenRefreshHandler.ts, TokenStorage.ts, types.ts, index.ts
```
Token 生命周期（acquire/refresh/revoke），password/authorization_code/client_credentials 三种授权模式。`TokenRefreshHandler` 在 HTTP ALIGN 阶段 401 拦截 + 自动刷新 + 重试。

#### `src/data-processor-abp/` — ABP 框架数据处理器 `@qimenjs/data-processor-abp`
```
pre.ts, post.ts, register.ts, types.ts, index.ts
```
ABP 框架适配：分页（skipCount/takeCount）、租户头注入、PagedResultDto 提取、审计清理、软删除过滤。

#### `src/data-processor-spring/` — Spring Data 数据处理器 `@qimenjs/data-processor-spring`
```
pre.ts, post.ts, register.ts, types.ts, index.ts
```
Spring Data 适配：分页（page/size/sort）、Page\<T\> 提取。

#### `src/system-abilities/` — 系统级能力 `@qimenjs/system-abilities`
```
system/EventAbility.ts, system/DomEventsAbility.ts, system/DomainAbility.ts, system/SystemAbility.ts
interfaces/IEventAbility.ts, IDomEventsAbility.ts, IDomainAbility.ts, ISystemAbility.ts, IFullSystemAbility.ts
types/abilities.ts, index.ts
```
系统级能力集：EventAbility（on/once/emit）、DomEventsAbility（onDom, bind/unbind 手势语义）、DomainAbility（域配置访问）、SystemAbility（系统配置访问）。

### Layer 4 — 应用层

#### `src/entity/` — 实体管理框架 `@qimenjs/entity` (30 文件)
```
manager/CoreEntityManager.ts, manager/BaseEntityManager.ts, manager/managers.ts
abilities/core/ — SchemaProxyAbility, CacheAbility, DirtyAbility, DomainPagingAbility
abilities/local/ — FlatLocalStateAbility, FlatLocalMutationAbility, FlatLocalDeleteAbility, LocalGetAbility, LocalListAbility
abilities/remote/ — FlatRemoteStateAbility, FlatRemoteListAbility, FlatRemoteGetAllAbility, FlatRemoteQueryAbility, RemoteGet/Create/Update/Delete/ToggleAbility, TreeManagerAbility, TreeRemoteStateAbility
abilities/search/ — SearchAbility
abilities/tree/ — TreePathAbility, TreeLifecycleAbility, TreeSearchAbility, TreeViewAbility
abilities/mutation/ — LocalMutationAbility
abilities/SchemaAbility.ts
types/index.ts, index.ts
```
5 种 Manager 类型，通过 Ability 组合获得不同功能。

#### `src/types/` — 公共类型定义 `@qimenjs/types`
```
flow-context.ts, index.ts
```
ExecutionStep, IExecutableContext, IPipelineResult。

### UI 层

#### `src/component-core/` — 组件核心层 `@qimenjs/component-core`
```
ComponentBase.ts, ComponentManager.ts, ComponentRegistrar.ts
ComponentEventRegistry.ts, ComponentTypes.ts
abilities/ — InitAbility, NodeMapAbility, OverlayAbility, AnimationAbility
           EntityCoreAbility, PermissionAbility
           PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility
           StyleAbility, ThemeAbility, EventBridgeAbility, PropAlias.ts
           positionOverlay.ts
interfaces/ — IRenderAbility, ILifecycleAbility, IPositionAbility, IStyleAbility
            IThemeAbility, IEventBridgeAbility, IChildrenAbility, IStateAbility
renderer/Renderer.ts
index.ts
```
组件基类、注册管理器、基础能力、9 阶段渲染器。ComponentBase 通过 `COMPONENT_BASE_ABILITIES` 注入 InitAbility/NodeMapAbility/OverlayAbility 等核心能力，统一 `initialize(layout)` 初始化流程。

#### `src/component-abilities/` — UI 组件能力定义 `@qimenjs/component-abilities`
```
content/ — ContentAbility, ContentPrefix（浮层逻辑已迁移到 component-core/OverlayAbility）
data/ — ValueAbility, ValidateAbility, SubmitAbility, FieldSetAbility, PlaceholderAbility
entity/ — EntityCoreAbility, EntityEmitAbility, EntityListenAbility, EntityAbility
          EntityLocalReadonlyAbility, EntityLocalCrudAbility
          EntityRemoteReadonlyAbility, EntityRemoteCrudAbility, EntityRemoteTreeAbility
selection/ — SelectionAbility, SelectableAbility
children/ — ChildrenAbility
render/ — VirtualListAbility, OverlayAbility, AnimationAbility
interaction/ — ClickAbility, OptionsAbility, SearchAbility, SortAbility, OpenableAbility, LayoutAbility
column/ — ColumnAbility, ColumnManageAbility
toolbar/ — ToolbarAbility, CrudAbility
toolbar/pagination/ — PaginationAbility (聚合 8 个子能力: State, Events, Nav, Pages, Jumper, Sizer, Info)
toolbar/search/ — SearchAbility (聚合 4 个子能力: Input, Button, Events, Positions)
ui/ — PlaceholderAbility, VisibleAbility, DisableAbility, LoadingAbility, SizeAbility
event/ — EventBindingAbility (@deprecated)
core/ — 重导出 PropAlias
index.ts
```
可组合的 UI 能力，供组件按需引用。

#### `src/component/` — UI 组件层 `@qimenjs/component` (31 文件)
```
OverlayRoot.ts, HiddenRoot.ts, z-index.ts, register.ts, events.ts
components/ — 15 种内置组件:
  ButtonComponent   [ContentAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility]
  InputComponent    [ContentAbility, ValueAbility, ValidateAbility, PlaceholderAbility, DisableAbility, SizeAbility]
  SelectComponent   [ContentAbility, ValueAbility, OptionsAbility, SearchAbility, DisableAbility, SizeAbility]
  IconComponent     [SizeAbility]
  TextComponent     [SizeAbility]
  HBoxComponent     [LayoutAbility, ChildrenAbility, AnimationAbility]
  VBoxComponent     [LayoutAbility, ChildrenAbility, AnimationAbility]
  GridComponent     [LayoutAbility, ChildrenAbility, AnimationAbility]
  SpaceComponent    [LayoutAbility]
  ToolbarComponent  [LayoutAbility, ChildrenAbility, AnimationAbility, ToolbarAbility]
  ButtonGroupComponent [ChildrenAbility, SizeAbility, DisableAbility]
  SeparatorComponent [VisibleAbility]
  TableComponent    [EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ColumnManageAbility, ChildrenAbility]
  FormComponent     [EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility]
  DialogComponent   [ContentAbility, OpenableAbility, OverlayAbility, AnimationAbility]
  ColumnBase, CellBase, NumberColumn, IdColumn, CheckboxColumn
styles/animations.ts, styles/toolbar.ts
index.ts
```

#### `src/layout/` — 布局定义系统 `@qimenjs/layout`
```
LayoutNode.ts, parser.ts, validator.ts, index.ts
```
JSON 驱动的布局定义系统。`LayoutNode` 核心类型（type, id, children, handlers, extraFns, abilities, stateTriggers, entity, permission, position/style/tooltip/animation/accessibility props）。

#### `src/renderer/` — 渲染系统 `@qimenjs/renderer`
```
processors/bind-children.ts
```
**注意**：此模块不完整，仅有 `bind-children.ts`，其导入的 `RenderContext` 和 `Renderer` 类文件不存在。实际的 Renderer 实现在 `src/component-core/renderer/Renderer.ts`。

#### `src/theme/` — 主题系统 `@qimenjs/theme`
```
ThemeManager.ts, AtomicCSS.ts
presets/light.ts, presets/dark.ts, presets/atomic-rules.ts, presets/index.ts
types/, index.ts
```
主题注册、切换、CSS 变量输出。`AtomicCSS` 按需原子 CSS 生成器。Design Tokens 类型：ColorTokens, SpacingTokens, RadiusTokens, FontTokens, ShadowTokens, TransitionTokens, BreakpointTokens。

#### `src/imperative/` — 命令式 API `@qimenjs/imperative`
```
toast.ts, msgbox.ts, types.ts, index.ts
```
`toast()` 函数（ToastManager, Thenable）、`msgbox.alert/confirm/prompt`（MsgboxManager）。

#### `src/permission/` — 权限系统 `@qimenjs/permission`
```
PermissionRegistrar.ts, createDomainPermissions.ts, types.ts, index.ts
```
域范围权限码（domain:code 格式），`createDomainPermissions()` 域前缀权限码工厂。

## 路径别名映射

所有 36 个子包在 `tsconfig.json` 中配置了 `@qimenjs/*` 路径别名，例如：

```typescript
import { EventBus } from '@qimenjs/events'
import { Pipeline } from '@qimenjs/pipeline'
import { ComponentBase } from '@qimenjs/component-core'
```

## 关键数据流

### HTTP 请求流程
```
HttpClient.request()
  → HttpExecutor (Pipeline)
    → PREPARE 阶段: CommonParamsEnricher → TokenInjector → UrlBuilder
    → EXCHANGE 阶段: FetchTransport / XhrTransport
    → PROCESS 阶段: DataParser → ResponseAnalyzer
    → ALIGN 阶段: DownloadInterceptor / TokenRefreshHandler(401)
```

### 实体数据流
```
Component (EntityAbility)
  → EntityManager (fetch/buildOptions)
    → DataProcessor Pipeline (pre-processors)
      → HttpExecutor (HTTP 请求)
    → DataProcessor Pipeline (post-processors)
  → Component (EntityEmitAbility → 事件通知)
```

### 组件渲染流程
```
Renderer.render(layoutNode)
  1. 创建组件实例 (ComponentRegistrar 查找类)
  2. 创建 el + 注入 HTML 模板
  3. 初始化 abilities (setupAbilities)
  4. 赋值属性 (props → __initProps)
  5. 绑定事件 (EventBridgeAbility)
  6. 条件/循环/响应式
  7. 挂载 DOM
  8. 递归渲染 children
  9. 生命周期回调 (mount)
```

## 已知问题与注意事项

1. **renderer 模块不完整**：`src/renderer/` 仅有 `processors/bind-children.ts`，其导入的 `RenderContext` 和 `Renderer` 类文件不存在。实际 Renderer 在 `src/component-core/renderer/Renderer.ts`。

2. **向后兼容重导出**：`component` 包从 `component-core` 和 `component-abilities` 重导出大量 API。`component-abilities` 的 `core/`、`event/`、`ui/` 子目录也从 `component-core` 重导出。

3. **jest.config.ts 包含过时别名**：如 `@qimenjs/base`、`@qimenjs/core`、`@qimenjs/kernel` 等在 tsconfig.json 中已不存在的路径别名。

4. **i18n 运行时**：`src/i18n/i18n.iife.js` 是预编译的 IIFE 格式运行时，通过 `<script>` 标签加载到 `window.__qimen_i18n__`。

5. **零运行时依赖**：项目没有任何 runtime dependencies，所有依赖都是 devDependencies。

## 配置文件

| 文件 | 用途 |
|------|------|
| `package.json` | 项目元数据、脚本、依赖 |
| `tsconfig.json` | TypeScript 编译配置，36 个 @qimenjs/* 路径别名 |
| `tsconfig.build.json` | 构建专用配置，排除测试文件 |
| `jest.config.ts` | Jest 测试配置，路径映射 |
| `.eslintrc.js` | ESLint 规则 |
| `.prettierrc` | Prettier 格式化规则 |
| `typedoc.json` | TypeDoc 文档生成配置 |
| `VERSION` | 版本号文件 (0.2.0) |
