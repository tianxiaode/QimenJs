# QimenJS 项目结构说明

> 本文档供新会话快速了解项目框架，避免每次遍历。最后更新：2026-07-16，基于 v0.2.0（框架流程跑通）。

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
Layer 0 (基础层)  → error, logger, utils, async, runtime, crypto, i18n, context, types
Layer 1 (核心层)  → registry, events, cache, pipeline, composable, task
Layer 2 (数据层)  → data-processor, validation, event-dom, mime, pattern, schema, permission
Layer 3 (服务层)  → http, oauth2, data-processor-abp, data-processor-spring, system-abilities
Layer 4 (应用层)  → entity, router
UI 层             → component-core, component-abilities, component, layout, theme, icon, imperative
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

- `TemplateComponent`（原 `ComponentBase`）extends ComposableBase，标准能力 = `[EventAbility, DomEventsAbility, PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility, AccessibilityAbility, AnimationAbility, EntityCoreAbility, PermissionAbility, EventBridgeAbility, ThemeAbility, InitAbility, NodeMapAbility, OverlayAbility]`
- **withTemplate 统一架构**：所有组件通过 `TemplateComponent.withTemplate(templateHtml)` 创建强类，类定义时预编译模板，实例化时纯克隆
  - 预编译：提取节点数据、生成内容属性、预编译事件模板
  - 实例化：cloneNode + 填 node 引用，零字符串处理开销
  - 不依赖 TemplateRegistrar
  - **构造即完整**：`new Xxx()` 自动完成 initElement + 内容填充 + 事件绑定 + 注册，不需要 `initialize()`
  - **static 配置**：`static children` / `static bridges` 等类级别配置，所有实例共享，props 可覆盖
  - **onXxx 自动发现**：外部事件 emitKey 驼峰化为方法名（`saveBtn:tap` → `onSaveBtnTap`），自动绑定
- 内部递归渲染模型：组件通过 `ChildrenAbility.add(layout)` 自渲染子组件，替代外部 Renderer
- HTML 模板注入 + data-content 内容管理
- **事件机制**：
  - 内部事件（`data-event`）：通过 `this.bind` 统一绑定，使用 event-dom 事件规范命名（`tap`/`click`/`input`/`change`/`scroll` 等），跨平台兼容
  - 外部事件（`data-emit`）：三种模式按优先级：
    1. `bridges` 声明的 → 走事件桥 `emitUI` 发布
    2. 实例有 `onXxx` 方法 → emitKey 驼峰化自动绑定（`saveBtn:tap` → `onSaveBtnTap`）
    3. 默认 → 走事件桥 `emitUI` 发布
  - `bridges` 配置：`static bridges = ['saveBtn:tap']`，声明走事件桥发布的事件
  - `EventBridgeAbility` 声明式事件桥接
- dirtySet + flush() 延迟刷新机制
- 主题切换：CSS 变量自动生效 + `static themeAware = true` 声明 JS 层面感知
- 权限控制：LayoutNode 声明 `permission` 字段后自动监听 `permission:change` 事件

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
LRU + TTL 缓存管理框架。`BaseCacheProvider` 抽象基类，`MemoryProvider` 内存 Map 实现，`CacheFactory` 缓存工厂。

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
types/index.ts, index.ts
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

#### `src/types/` — 公共类型定义 `@qimenjs/types`
```
flow-context.ts, index.ts
```
ExecutionStep, IExecutableContext, IPipelineResult。

#### `src/utils/` — 通用工具函数 `@qimenjs/utils` (92 文件)
```
array/         — base (duplicates, transform), collection (chunk, flatten, groupBy), random (sample, shuffle), search (find, includes), set (difference, intersection, union), sort (sort, tree)
color/         — generateColorShades, hex/hsl/rgb 互转
cookie/        — get/set/remove/has/getAll/getNumber/getBoolean/setJson
date/          — calculation (days, months, quarters, years), calendar, format, utils
geometry/      — align, clamp, point, rect, snap, vector, types
number/        — base, format
object/        — base, clone, iterate, properties
string/        — base, css, format, id, plural
time/          — after, delay, repeat, types
units/         — angle, format, length, parse, percent, resolve, time, types
composeMixins.ts, download.ts, index.ts
```
按领域组织的通用工具函数库。

### Layer 1 — 核心层

#### `src/composable/` — 能力组合系统 `@qimenjs/composable`
```
ComposableBase.ts, forge.ts, types/composable.ts, types/ability.ts, index.ts
```
框架核心模式。`ComposableBase` 提供 abilityState()、setAbilityState()、debounce()、onCleanup()、collectAbilities()、setupAbilities()、dispose() 等方法。`forge.ts` 提供能力锻造（类合并）工具函数。

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

#### `src/task/` — 任务调度 + 哈希任务 + Worker `@qimenjs/task` (43 文件)
```
task/TaskQueue.ts, task/types.ts
worker/WorkerManagerBase.ts, worker/SimpleWorkerManager.ts, worker/types.ts
hash-task/chunk/, hash-task/hash/, hash-task/worker/, hash-task/types/, hash-task/errors/
hash-task/factory.ts
errors/WorkerError.ts, errors/WorkerInitializationError.ts, index.ts
```
优先级任务队列（含重试）+ 完整的哈希计算系统（分块+Worker池+健康监控）。

### Layer 2 — 数据层

#### `src/data-processor/` — 数据处理管道框架 `@qimenjs/data-processor`
```
DataProcessorRegistrar.ts, executor.ts, types.ts, weights.ts, register.ts
errors/index.ts, common/ (空), README.md, index.ts
```
管道式请求/响应数据处理框架，`DataProcessorRegistrar` extends RegistrarBase，tags + weight 排序。

#### `src/validation/` — 验证引擎 `@qimenjs/validation` (79 文件)
```
core/ValidatorRegistrar.ts, core/validate.ts, core/executor.ts
engine/validate.ts
processors/array/, processors/boolean/, processors/common/
processors/date/, processors/file/, processors/format/, processors/number/
processors/object/, processors/password/, processors/split/, processors/string/
errors/, types/, utils/, index.ts
```
规则 + 链式验证引擎，11 种类型处理器。`ValidatorRegistrar` extends RegistrarBase，tag 过滤，链缓存。

#### `src/event-dom/` — DOM 事件适配 + 手势识别 `@qimenjs/event-dom` (31 文件)
```
adapters/dom/DomEventAdapter.ts
adapters/processors/ — 8 种手势处理器 (Tap, DoubleTap, LongPress, Swipe, Drag, Hover, ContextMenu, Submit)
adapters/semantic-map/ — 原子信号 → 语义事件映射 (base, gesture, keyboard, mouse, pointer, resolve, touch)
adapters/utils/validation.ts, adapters/createEventAdapter.ts
types/adapters/ (base, map, processors), index.ts
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

#### `src/schema/` — Schema 定义系统 `@qimenjs/schema`
```
SchemaRegistrar.ts, types/schema.ts, types/rule.ts, types/index.ts, index.ts
```
实体 Schema + 字段组注册，编译缓存。`ValidationPatternType` 枚举 19 种模式。

#### `src/permission/` — 权限系统 `@qimenjs/permission`
```
PermissionRegistrar.ts, createDomainPermissions.ts, types.ts, index.ts
```
域范围权限码（domain:code 格式），`PermissionRegistrar` extends RegistrarBase，通过 GlobalEventBus 触发 `permission:change` 事件。`createDomainPermissions()` 域前缀权限码工厂。

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
OAuth2Manager.ts, TokenRefreshHandler.ts, TokenStorage.ts, register.ts, types.ts, index.ts
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

#### `src/system-abilities/` — 系统级能力 `@qimenjs/system-abilities` (10 文件)
```
system/EventAbility.ts, system/DomEventsAbility.ts, system/DomainAbility.ts, system/SystemAbility.ts
system/EventBridgeAbility.ts
interfaces/IEventAbility.ts, IDomEventsAbility.ts, IDomainAbility.ts, ISystemAbility.ts, IFullSystemAbility.ts
types/abilities.ts, index.ts
```
系统级能力集：EventAbility（on/once/emit）、DomEventsAbility（onDom, bind/unbind 手势语义）、DomainAbility（域配置访问）、SystemAbility（系统配置访问）、EventBridgeAbility（bridgeEmit/bridgeOn/bridgeOnce，通过 EventBridge 单例路由事件）。

### Layer 4 — 应用层

#### `src/entity/` — 实体管理框架 `@qimenjs/entity` (40 文件)
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

#### `src/router/` — 路由系统 `@qimenjs/router` (6 文件)
```
Router.ts, RouteAbility.ts, RouteEmitAbility.ts, RouteListenAbility.ts, types.ts, index.ts
```
纯事件模式路由。`Router` 通过 `pathToEventName` 路径转事件名，emit source='router'。RouteAbility/RouteEmitAbility/RouteListenAbility 提供组件级路由能力。

### UI 层

#### `src/component-core/` — 组件核心层 `@qimenjs/component-core` (38 文件)
```
TemplateComponent.ts, ComponentManager.ts, ComponentRegistrar.ts
ComponentEventRegistry.ts, ComponentTypes.ts
template-compiler.ts, template-constants.ts, template-json.ts
template-presets.ts, template-types.ts
content-properties.ts, types.ts
abilities/ — 25 个核心能力:
  InitAbility, NodeMapAbility, OverlayAbility, OverlayHostAbility, AnimationAbility
  AccessibilityAbility, PermissionAbility, BadgeAbility, ColorVariantAbility
  PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility
  StyleAbility, ThemeAbility, EventBridgeAbility, ElementEventAbility
  LayoutAbility, DragAbility, DropAbility, TemplateAbility, TooltipAbility
  PropAlias.ts, positionOverlay.ts
index.ts
```
组件基类、注册管理器、基础能力。`TemplateComponent`（原 `ComponentBase`）通过 `TEMPLATE_COMPONENT_ABILITIES` 注入核心能力，统一 `initialize(layout)` 初始化流程。`withTemplate(templateHtml)` 静态方法创建预编译强类，类定义时编译模板，实例化时纯克隆。支持三种模板格式：HTML 字符串 / 旧版 JsonTemplateNode[] / 新版 ComponentTemplate。`ElementEventAbility` 通过 `this.bind` 统一绑定 DOM 事件，支持 `?debounce=N`/`?throttle=N` 修饰符。`EventBridgeAbility`（配置能力）声明式事件桥接，`TemplateAbility.bindBridgeEvents()` 通过 EventBridge 单例转发。内部递归渲染模型：`ChildrenAbility.add(layout)` 替代外部 Renderer。

#### `src/component-abilities/` — UI 组件能力定义 `@qimenjs/component-abilities` (30 文件)
```
entity/ — EntityCoreAbility, EntityEmitAbility, EntityListenAbility, EntityAbility
          EntityLocalReadonlyAbility, EntityLocalCrudAbility
          EntityRemoteReadonlyAbility, EntityRemoteCrudAbility, EntityRemoteTreeAbility
group/ — GroupSelectAbility（radio 互斥/checkbox 多选）
menu/ — MenuItemManageAbility（池化复用菜单项）
render/ — AnimationAbility, ArrowAbility, ChildSlotAbility, ExpandArrowAbility
          FloatingLayerAbility, LoadingAbility, OverflowMenuAbility, OverflowScrollAbility
          OverlayHostAbility（从 component-core 重导出）, OverlayMaskAbility
          TemplateCacheAbility, TooltipOverlayAbility, VirtualListAbility
index.ts
```
可组合的 UI 能力，供组件按需引用。不再从 @qimenjs/component-core 重导出。

#### `src/component/` — UI 组件层 `@qimenjs/component` (32 文件)
```
OverlayRoot.ts, z-index.ts, register.ts, events.ts
components/ — 8 种内置组件:
  ButtonComponent   [ContentAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility] — withTemplate
  BadgeComponent    [ContentAbility] — withTemplate
  ItemGroupComponent [ContentAbility, GroupSelectAbility] — withTemplate
  MenuComponent     [OverlayHostAbility, MenuItemManageAbility, GroupSelectAbility] — withTemplate
  MenuItemComponent [OverlayAbility, ContentAbility] — withTemplate
  NavItemComponent  [ContentAbility] — withTemplate
  NavItemGroupComponent (extends ItemGroupComponent)
  RouteNavComponent / RouteContainerComponent
  PanelComponent    [ContentAbility, OverlayHostAbility] — withTemplate
  TipsComponent     [OverlayHostAbility] — withTemplate
  ToolbarComponent  [LayoutAbility, ChildrenAbility, OverflowScrollAbility, OverflowMenuAbility] — withTemplate
styles/animations.ts, styles/toolbar.ts
badge/, button/, itemgroup/, menu/, nav/, panel/, tips/, toolbar/ — 各含 Component + css.ts + index.ts
index.ts
```

#### `src/layout/` — 布局定义系统 `@qimenjs/layout`
```
LayoutNode.ts, layout-keys.ts, validator.ts, types/ (空), index.ts
```
JSON 驱动的布局定义系统。`LayoutNode` 核心类型（type, id, children, handlers, extraFns, abilities, stateTriggers, entity, permission, position/style/tooltip/animation/accessibility props）。`layout-keys.ts` 定义布局属性键常量。

#### `src/theme/` — 主题资源（纯 CSS，非独立包）
```
theme.css, light.css, dark.css, utilities.css, preset.css, custom.css
skeleton.css, layout.css, utility.css
```
纯 CSS 变量驱动的主题方案，无 TS 编译、零 JS 开销。亮/暗色由根元素 `data-theme` 属性切换，中国风预设（10 个：朱砂红/黛蓝/松花绿/琥珀黄/胭脂粉/竹青/缃色/藕荷紫/藏青/秋香绿）由 `data-theme-preset` 切换，用户自定义由 `data-theme-custom` 覆盖。主色采用 HSL 三段式存储（`--q-color-primary-h/s/l`），hover/active/disabled 状态色由明度自动派生。`theme.css` 为统一 `@import` 入口，应用只需引入一次。

#### `src/icon/` — 中国风图标库 `@qimenjs/icon`
```
q-icon.css, fonts/q-icon.woff2, fonts/q-icon.woff, fonts/q-icon.ttf, fonts/icon-map.json
svg/ — 102 个独立 SVG 源文件（24x24 viewBox, stroke-based, currentColor）
```
管理后台专用图标库，102 个图标覆盖 10 个分类（通用操作/导航/状态提示/文件文档/用户管理/日期时间/通讯消息/数据图表/电商财务/中国风特色）。字体图标方案：`@font-face` + Unicode 私用区（E900-E99F），CSS 类名 `q-icon-` 前缀，字体族名 `QIcon`。不参与 TypeScript 构建，纯静态资源目录。

构建命令：`node scripts/build-icon-font.js`（SVG → TTF → WOFF2/WOFF）。

#### `src/imperative/` — 命令式 API `@qimenjs/imperative`
```
Toast.ts, Msgbox.ts, ToastManager.ts, MsgboxManager.ts, api.ts, types.ts, index.ts
```
`toast()` 函数（ToastManager, Thenable）、`msgbox.alert/confirm/prompt`（MsgboxManager）。`api.ts` 合并 toast()/msgbox 工厂函数。

## 路径别名映射

所有子包在 `tsconfig.json` 中配置了 `@qimenjs/*` 路径别名，例如：

```typescript
import { EventBus } from '@qimenjs/events'
import { Pipeline } from '@qimenjs/pipeline'
import { TemplateComponent } from '@qimenjs/component-core'
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
ChildrenAbility.add(layoutNode)
  1. ComponentRegistrar.get(type) 查找组件类
  2. 合并 props（非保留顶层 key + layout.props + id/type/template/tag/field）
  3. new ComponentClass(props) 创建实例
     - withTemplate 强类：构造时自动完成全部初始化
       a. initElement() — cloneNode + 填 node 引用（纯克隆，零字符串处理）
       b. 配置初始化 — abilities、extraFns、entity、eventBridge、meta
       c. 内容填充 + i18n
       d. 事件绑定 — bindInternalEvents + bindExternalEvents（bridges/onXxx/emitUI）
       e. callInitMethods + ComponentManager.register
     - TemplateRegistrar 路径：从注册表查找模板 + buildNodeMap（已 deprecated）
  4. 挂载 DOM（appendChild + addChild）
  5. 递归 children.add(childLayout)
```

### 主题切换流程
```
document.documentElement.classList.add('dark')
  → CSS 选择器 :root.dark 生效
  → CSS 变量自动更新（所有组件自动生效）
```

### 权限控制流程
```
PermissionRegistrar.registerBatch(entries)
  → GlobalEventBus.emit('permission:change', payload)
  → PermissionAbility setter 中 _listenPermissionChange()
  → applyPermission() 根据 behavior 控制 UI
```

## 已知问题与注意事项

1. **renderer 模块已移除**：`src/renderer/` 和 `src/component-core/renderer/` 已删除，渲染流程由 `ChildrenAbility.add(layout)` 承担。

2. **template 模块已移除**：`src/template/` 已删除，模板预设/常量/JSON 迁移到 `src/component-core/`（template-compiler.ts, template-constants.ts, template-json.ts, template-presets.ts, template-types.ts）。

3. **重导出已清理**：`component` 包不再从 `component-core` 和 `component-abilities` 重导出。`component-abilities` 不再从 `component-core` 重导出。外部应直接从各自的包导入。

4. **jest.config.ts 包含过时别名**：如 `@qimenjs/base`、`@qimenjs/core`、`@qimenjs/kernel` 等在 tsconfig.json 中已不存在的路径别名。

5. **i18n 运行时**：`src/i18n/i18n.iife.js` 是预编译的 IIFE 格式运行时，通过 `<script>` 标签加载到 `window.__qimen_i18n__`。

6. **零运行时依赖**：项目没有任何 runtime dependencies，所有依赖都是 devDependencies。

7. **主题系统已重构**：`ThemeRegistrar` 和 `AtomicCSS` 已移除，主题系统改为纯 CSS 变量驱动。主题文件导出 CSS 变量字符串，构建工具自动收集并打包。切换主题通过 CSS 类或媒体查询实现，零 JS 开销。

8. **`src/icon/` 不参与 TypeScript 构建**：图标库是纯静态资源目录（CSS + SVG + 字体文件），没有 `index.ts` 入口，不在 `tsconfig.json` 和 `build-config.json` 中配置。字体文件通过 `node scripts/build-icon-font.js` 手动构建。

9. **EventBridge 单例模式**：`src/events/EventBridge.ts` 统一 eventScope，解决发送方/监听方 eventScope 不同导致事件无法路由的问题。`EventBridgeAbility`（system-abilities）提供组件实例方法，`EventBridgeAbility`（component-core/abilities/）重命名为 `EventBridgeConfigAbility`。

10. **withTemplate 三格式支持**：HTML 字符串 / 旧版 JsonTemplateNode[] / 新版 ComponentTemplate（name/content 分离 + events/forwards/bridges 三类事件 + body 定义）。

## 配置文件

| 文件 | 用途 |
|------|------|
| `package.json` | 项目元数据、脚本、依赖 |
| `tsconfig.json` | TypeScript 编译配置，@qimenjs/* 路径别名 |
| `tsconfig.build.json` | 构建专用配置，排除测试文件 |
| `jest.config.ts` | Jest 测试配置，路径映射 |
| `.eslintrc.js` | ESLint 规则 |
| `.prettierrc` | Prettier 格式化规则 |
| `typedoc.json` | TypeDoc 文档生成配置 |
| `VERSION` | 版本号文件 (0.2.0) |

## 构建脚本

| 脚本 | 用途 |
|------|------|
| `scripts/build.js` | 主构建脚本 |
| `scripts/build-icon-font.js` | 图标字体构建：SVG → TTF → WOFF2/WOFF |
| `scripts/split-icon-svg.js` | 拆分大 SVG 文件为独立图标 SVG |
| `scripts/generate-missing-icons.js` | 批量生成缺失的图标 SVG 占位文件 |
| `scripts/generate-tests.js` | 测试生成脚本 |
| `scripts/cleanup.js` | 清理脚本 |
| `scripts/publish.js` | 发布脚本 |
