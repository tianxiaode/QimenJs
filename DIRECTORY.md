# QimenJs 源码目录索引

> 供 AI 快速了解项目结构，避免重复搜索。共 568 个 TS 文件（683 总文件）。最后更新：2026-07-16。

## src/async — 异步工具（3文件）

| 文件 | 用途 |
|------|------|
| debounce.ts | 防抖函数 |
| throttle.ts | 节流函数 |
| index.ts | 统一导出 |

## src/cache — 缓存管理（7文件）

| 文件 | 用途 |
|------|------|
| BaseCacheProvider.ts | 缓存提供者抽象基类 |
| MemoryProvider.ts | 内存 Map 缓存实现 |
| CacheFactory.ts | 缓存工厂 |
| types.ts | 缓存类型定义 |
| types/cache.ts | 缓存详细类型 |
| types/index.ts | 类型导出 |
| index.ts | 统一导出 |

## src/component — UI组件实现层（32文件）

| 文件 | 用途 |
|------|------|
| events.ts | UI组件事件枚举定义 |
| index.ts | 组件层统一导出入口 |
| OverlayRoot.ts | 全局浮层根容器 |
| register.ts | 组件type注册入口 |
| z-index.ts | z-index层级管理 |
| badge/badge.css.ts | Badge角标组件样式 |
| badge/BadgeComponent.ts | Badge角标组件实现 |
| badge/index.ts | Badge模块导出 |
| button/button.css.ts | Button按钮组件样式 |
| button/ButtonComponent.ts | Button按钮组件实现 |
| button/index.ts | Button模块导出 |
| itemgroup/itemgroup.css.ts | ItemGroup项组组件样式 |
| itemgroup/ItemGroupComponent.ts | ItemGroup项组组件实现 |
| menu/index.ts | Menu模块导出 |
| menu/menu.css.ts | Menu菜单组件样式 |
| menu/MenuComponent.ts | Menu浮层菜单组件实现 |
| menu/MenuItemComponent.ts | MenuItem菜单项组件实现 |
| nav/index.ts | Nav导航模块导出 |
| nav/nav.css.ts | Nav导航组件样式 |
| nav/NavItemComponent.ts | NavItem导航项组件实现 |
| nav/NavItemGroupComponent.ts | NavItemGroup导航项组组件实现 |
| nav/RouteContainerComponent.ts | 路由容器组件实现 |
| nav/RouteNavComponent.ts | 路由导航组件实现 |
| panel/PanelComponent.ts | Panel面板组件实现 |
| styles/animations.ts | 内置动画关键帧样式 |
| styles/toolbar.ts | 工具栏折叠样式 |
| tips/index.ts | Tips提示模块导出 |
| tips/tips.css.ts | Tips提示浮层组件样式 |
| tips/TipsComponent.ts | Tips提示浮层组件实现 |
| toolbar/index.ts | Toolbar工具栏模块导出 |
| toolbar/toolbar.css.ts | Toolbar工具栏组件样式 |
| toolbar/ToolbarComponent.ts | Toolbar工具栏组件实现 |

## src/component-abilities — 组件业务能力层（30文件）

| 文件 | 用途 |
|------|------|
| index.ts | 组件能力层统一导出入口 |
| entity/EntityAbility.ts | 实体管理能力组合导出 |
| entity/EntityCoreAbility.ts | 实体核心能力（mgr管理） |
| entity/EntityEmitAbility.ts | 实体事件发送能力 |
| entity/EntityListenAbility.ts | 实体事件监听能力 |
| entity/EntityLocalCrudAbility.ts | 本地CRUD实体能力 |
| entity/EntityLocalReadonlyAbility.ts | 本地只读实体能力 |
| entity/EntityRemoteCrudAbility.ts | 远程CRUD实体能力 |
| entity/EntityRemoteReadonlyAbility.ts | 远程只读实体能力 |
| entity/EntityRemoteTreeAbility.ts | 远程树实体能力 |
| entity/index.ts | 实体能力模块导出 |
| group/GroupSelectAbility.ts | 分组选择能力（单选/多选） |
| group/index.ts | 分组能力模块导出 |
| menu/MenuItemManageAbility.ts | 菜单项管理能力（池化复用） |
| menu/index.ts | 菜单能力模块导出 |
| render/AnimationAbility.ts | Web Animations API动画能力 |
| render/arrow.css.ts | 箭头通用样式定义 |
| render/ArrowAbility.ts | 浮层箭头指示器能力 |
| render/ChildSlotAbility.ts | 子组件插槽替换能力 |
| render/ExpandArrowAbility.ts | 展开/折叠箭头能力 |
| render/FloatingLayerAbility.ts | 浮层通用能力（挂载/动画/定位） |
| render/index.ts | 渲染能力模块导出 |
| render/LoadingAbility.ts | 加载状态遮罩能力 |
| render/OverflowMenuAbility.ts | 溢出菜单能力 |
| render/OverflowScrollAbility.ts | 溢出滚动能力 |
| render/OverlayHostAbility.ts | 浮层宿主能力（兼容重导出） |
| render/OverlayMaskAbility.ts | 遮罩层能力 |
| render/TemplateCacheAbility.ts | 模板缓存与快速克隆能力 |
| render/TooltipOverlayAbility.ts | Tooltip浮层能力 |
| render/VirtualListAbility.ts | 虚拟列表滚动能力 |

## src/component-core — 组件核心基础设施层（38文件）

| 文件 | 用途 |
|------|------|
| ComponentEventRegistry.ts | 组件事件注册表 |
| ComponentRegistrar.ts | 组件类型与实例注册器 |
| ComponentTypes.ts | 组件类型常量定义 |
| content-properties.ts | 统一内容属性生成工具 |
| index.ts | 组件核心层统一导出入口 |
| template-compiler.ts | 统一预编译引擎 |
| template-constants.ts | HTML模板常量定义 |
| template-json.ts | JSON模板定义与转换 |
| template-presets.ts | 组件模板预设定义 |
| template-types.ts | 新版模板类型（TplNode/ComponentTemplate） |
| TemplateComponent.ts | 模板组件基类 |
| types.ts | 组件节点元数据类型定义 |
| abilities/AccessibilityAbility.ts | ARIA无障碍属性能力 |
| abilities/AnimationAbility.ts | 动画控制能力 |
| abilities/BadgeAbility.ts | 角标管理能力 |
| abilities/ColorVariantAbility.ts | 语义颜色变体能力 |
| abilities/DragAbility.ts | 拖拽能力 |
| abilities/DropAbility.ts | 放置能力 |
| abilities/ElementEventAbility.ts | 元素事件绑定能力 |
| abilities/EntityCoreAbility.ts | 实体管理属性能力 |
| abilities/EventBridgeAbility.ts | 事件桥接配置能力（EventBridgeConfigAbility） |
| abilities/index.ts | 核心能力模块导出 |
| abilities/InitAbility.ts | 组件统一初始化流程能力 |
| abilities/LayoutAbility.ts | 布局能力（fit/hbox/vbox等） |
| abilities/NodeMapAbility.ts | 内容属性初始化与i18n刷新 |
| abilities/OverlayAbility.ts | 浮层管理能力（通用浮层创建+委托方法） |
| abilities/OverlayHostAbility.ts | 浮层宿主基础能力 |
| abilities/PermissionAbility.ts | 权限控制能力 |
| abilities/PositionBoolAbility.ts | 布尔定位属性能力 |
| abilities/PositionDirectAbility.ts | 直接操作DOM的属性能力 |
| abilities/positionOverlay.ts | 浮层定位工具函数 |
| abilities/PositionPxAbility.ts | px数值定位/尺寸属性能力 |
| abilities/PositionRawAbility.ts | 原始值样式属性能力 |
| abilities/PropAlias.ts | 能力属性别名与初始化协议 |
| abilities/StyleAbility.ts | 样式属性能力（className/style） |
| abilities/TemplateAbility.ts | 模板组件能力定义 |
| abilities/ThemeAbility.ts | 主题感知能力 |
| abilities/TooltipAbility.ts | Tooltip专属能力 |

## src/composable — 可组合能力系统（5文件）

| 文件 | 用途 |
|------|------|
| ComposableBase.ts | 可组合能力基类实现 |
| forge.ts | 能力锻造（类合并）工具函数 |
| index.ts | 可组合能力系统统一导出 |
| types/ability.ts | 能力定义类型 |
| types/composable.ts | 可组合能力系统类型定义 |

## src/context — 请求/事件上下文（9文件）

| 文件 | 用途 |
|------|------|
| EventContext.ts | 事件上下文 |
| EventContextBuilder.ts | 事件上下文构建器 |
| RequestContextBuilder.ts | 请求上下文构建器 |
| base/BaseContext.ts | 基础上下文 |
| base/ExecutionStep.ts | 执行步骤定义 |
| base/index.ts | 基础模块导出 |
| types/request-context.ts | 请求上下文类型 |
| types/index.ts | 类型导出 |
| index.ts | 统一导出 |

## src/crypto — 哈希与编解码（7文件）

| 文件 | 用途 |
|------|------|
| md5.ts | MD5 哈希 |
| sha1.ts | SHA-1 哈希 |
| sha256.ts | SHA-256 哈希 |
| sha512.ts | SHA-512 哈希 |
| xxhash64.ts | XXHash64 哈希 |
| base64.ts | Base64 编解码 |
| index.ts | 统一导出 |

## src/data-processor — 数据处理管道框架（7文件）

| 文件 | 用途 |
|------|------|
| DataProcessorRegistrar.ts | 数据处理器注册器 |
| executor.ts | 管道执行器 |
| types.ts | 类型定义 |
| weights.ts | 权重常量 |
| register.ts | 自动注册入口 |
| errors/index.ts | 错误定义 |
| index.ts | 统一导出 |

## src/data-processor-abp — ABP框架数据处理器（5文件）

| 文件 | 用途 |
|------|------|
| pre.ts | 请求前处理器 |
| post.ts | 响应后处理器 |
| register.ts | 自动注册入口 |
| types.ts | 类型定义 |
| index.ts | 统一导出 |

## src/data-processor-spring — Spring Data数据处理器（5文件）

| 文件 | 用途 |
|------|------|
| pre.ts | 请求前处理器 |
| post.ts | 响应后处理器 |
| register.ts | 自动注册入口 |
| types.ts | 类型定义 |
| index.ts | 统一导出 |

## src/entity — 实体管理框架（40文件）

| 文件 | 用途 |
|------|------|
| index.ts | 统一导出 |
| manager/CoreEntityManager.ts | 核心实体管理器 |
| manager/BaseEntityManager.ts | 基础实体管理器 |
| manager/managers.ts | 5种具体Manager定义 |
| manager/index.ts | 管理器导出 |
| abilities/core/CacheAbility.ts | 缓存能力 |
| abilities/core/DirtyAbility.ts | 脏数据追踪能力 |
| abilities/core/DomainPagingAbility.ts | 域分页能力 |
| abilities/core/SchemaProxyAbility.ts | Schema代理能力 |
| abilities/core/index.ts | 核心能力导出 |
| abilities/local/FlatLocalStateAbility.ts | 扁平本地状态能力 |
| abilities/local/FlatLocalMutationAbility.ts | 扁平本地变更能力 |
| abilities/local/FlatLocalDeleteAbility.ts | 扁平本地删除能力 |
| abilities/local/LocalGetAbility.ts | 本地获取能力 |
| abilities/local/LocalListAbility.ts | 本地列表能力 |
| abilities/local/index.ts | 本地能力导出 |
| abilities/remote/FlatRemoteGetAllAbility.ts | 扁平远程获取全部能力 |
| abilities/remote/FlatRemoteListAbility.ts | 扁平远程列表能力 |
| abilities/remote/FlatRemoteQueryAbility.ts | 扁平远程查询能力 |
| abilities/remote/FlatRemoteStateAbility.ts | 扁平远程状态能力 |
| abilities/remote/RemoteCreateAbility.ts | 远程创建能力 |
| abilities/remote/RemoteDeleteAbility.ts | 远程删除能力 |
| abilities/remote/RemoteGetAbility.ts | 远程获取能力 |
| abilities/remote/RemoteToggleAbility.ts | 远程切换能力 |
| abilities/remote/RemoteUpdateAbility.ts | 远程更新能力 |
| abilities/remote/TreeManagerAbility.ts | 树管理器能力 |
| abilities/remote/TreeRemoteStateAbility.ts | 树远程状态能力 |
| abilities/remote/index.ts | 远程能力导出 |
| abilities/search/SearchAbility.ts | 搜索能力 |
| abilities/search/index.ts | 搜索能力导出 |
| abilities/tree/TreePathAbility.ts | 树路径能力 |
| abilities/tree/TreeLifecycleAbility.ts | 树生命周期能力 |
| abilities/tree/TreeSearchAbility.ts | 树搜索能力 |
| abilities/tree/TreeViewAbility.ts | 树视图能力 |
| abilities/tree/index.ts | 树能力导出 |
| abilities/mutation/LocalMutationAbility.ts | 本地变更能力 |
| abilities/mutation/index.ts | 变更能力导出 |
| abilities/SchemaAbility.ts | Schema能力 |
| abilities/index.ts | 能力统一导出 |
| types/index.ts | 类型导出 |

## src/error — 统一错误体系（5文件）

| 文件 | 用途 |
|------|------|
| ErrorBase.ts | 错误抽象基类 |
| KernelError.ts | 内核错误 |
| GestureError.ts | 手势错误 |
| codes.ts | 错误码枚举 |
| index.ts | 统一导出 |

## src/event-dom — DOM事件适配+手势识别（31文件）

| 文件 | 用途 |
|------|------|
| adapters/createEventAdapter.ts | 事件适配器工厂 |
| adapters/dom/DomEventAdapter.ts | DOM事件适配器 |
| adapters/processors/ — 8种手势处理器 | Tap/DoubleTap/LongPress/Swipe/Drag/Hover/ContextMenu/Submit |
| adapters/semantic-map/ — 语义映射 | 原子信号→语义事件映射（base/gesture/keyboard/mouse/pointer/resolve/touch） |
| adapters/utils/validation.ts | 验证工具 |
| types/adapters/ | 适配器类型定义（base/map/processors） |
| index.ts | 统一导出 |

## src/events — 事件系统（15文件）

| 文件 | 用途 |
|------|------|
| EventBus.ts | 事件总线 |
| EventScope.ts | 事件作用域 |
| GlobalEventBus.ts | 全局事件总线单例 |
| EventBridge.ts | 事件桥接单例（统一eventScope路由） |
| EventSourceRegistrar.ts | 事件源注册器 |
| EventFlowRegistrar.ts | 事件流注册器 |
| StateTrigger.ts | 状态触发器 |
| I18nEventBridge.ts | 国际化事件桥接 |
| entity-events.ts | 实体事件定义 |
| component-events.ts | 组件事件定义 |
| types/core.ts | 核心类型 |
| types/bus.ts | 总线类型 |
| types/scope.ts | 作用域类型 |
| types/index.ts | 类型导出 |
| index.ts | 统一导出 |

## src/http — HTTP客户端（22文件）

| 文件 | 用途 |
|------|------|
| HttpClient.ts | HTTP客户端主类 |
| HttpExecutor.ts | HTTP执行器（Pipeline驱动） |
| HttpActionRegistrar.ts | HTTP动作注册器 |
| StreamClient.ts | SSE流式客户端 |
| factory.ts | 工厂函数 |
| actions/prepare/ | 准备阶段（CommonParamsEnricher, TokenInjector, UrlBuilder） |
| actions/exchange/ | 交换阶段（FetchTransport, XhrTransport） |
| actions/process/ | 处理阶段（DataParser, ResponseAnalyzer） |
| actions/align/ | 对齐阶段（DownloadInterceptor） |
| types/ | 类型定义 |
| index.ts | 统一导出 |

## src/i18n — 国际化（3 TS文件 + 6 静态文件）

| 文件 | 用途 |
|------|------|
| i18n-utils.ts | I18n工具函数 |
| i18n.iife.js | 预编译IIFE运行时 |
| copy.js | 复制工具脚本 |
| global.d.ts | 全局类型声明 |
| types/index.ts | 类型定义 |
| locales/zh-CN.js | 中文语言包 |
| locales/en-US.js | 英文语言包 |
| locales/fr-FR.js | 法语语言包 |
| index.ts | 统一导出 |

## src/imperative — 命令式API（7文件）

| 文件 | 用途 |
|------|------|
| Toast.ts | Toast实例类 |
| Msgbox.ts | Msgbox实例类 |
| ToastManager.ts | Toast管理器（队列调度+堆叠定位） |
| MsgboxManager.ts | Msgbox管理器（创建/销毁调度） |
| api.ts | 统一API导出（toast()/msgbox工厂函数） |
| types.ts | 类型定义 |
| index.ts | 统一导出 |

## src/layout — 布局定义系统（4文件）

| 文件 | 用途 |
|------|------|
| LayoutNode.ts | 布局节点核心类型 |
| layout-keys.ts | 布局属性键常量定义 |
| validator.ts | 布局验证器 |
| index.ts | 统一导出 |

## src/logger — 日志系统（7文件）

| 文件 | 用途 |
|------|------|
| Logger.ts | 日志器主类 |
| LoggerChild.ts | 子日志器 |
| format.ts | 日志格式化 |
| color.ts | 日志着色 |
| sinks/console.ts | 控制台输出 |
| types.ts | 类型定义 |
| index.ts | 统一导出 |

## src/mime — MIME类型管理（4文件）

| 文件 | 用途 |
|------|------|
| MimeTypeRegistrar.ts | MIME类型注册器 |
| presets.ts | 预定义MIME类型 |
| register.ts | 自动注册入口 |
| index.ts | 统一导出 |

## src/oauth2 — OAuth2认证（6文件）

| 文件 | 用途 |
|------|------|
| OAuth2Manager.ts | OAuth2管理器 |
| TokenRefreshHandler.ts | Token刷新处理器 |
| TokenStorage.ts | Token存储 |
| register.ts | 自动注册入口 |
| types.ts | 类型定义 |
| index.ts | 统一导出 |

## src/pattern — 命名正则模式注册表（4文件）

| 文件 | 用途 |
|------|------|
| PatternRegistrar.ts | 模式注册器 |
| presets.ts | 预定义19种模式 |
| register.ts | 自动注册入口 |
| index.ts | 统一导出 |

## src/permission — 权限系统（4文件）

| 文件 | 用途 |
|------|------|
| PermissionRegistrar.ts | 权限注册器 |
| createDomainPermissions.ts | 域权限码工厂 |
| types.ts | 类型定义 |
| index.ts | 统一导出 |

## src/pipeline — 管道执行器（3文件）

| 文件 | 用途 |
|------|------|
| executor.ts | Pipeline类（weight+offset排序、熔断、追踪） |
| types.ts | 类型定义 |
| index.ts | 统一导出 |

## src/registry — 注册表中心（9文件）

| 文件 | 用途 |
|------|------|
| RegistryHub.ts | 中央注册中心 |
| registrars/RegistrarBase.ts | 注册器抽象基类 |
| registrars/SystemRegistrar.ts | 系统注册器 |
| registrars/DomainRegistrar.ts | 域注册器 |
| registrars/errors.ts | 注册器错误 |
| registrars/index.ts | 注册器导出 |
| types.ts | 类型定义 |
| errors.ts | 错误定义 |
| index.ts | 统一导出 |

## src/router — 路由系统（6文件）

| 文件 | 用途 |
|------|------|
| Router.ts | 路由器（纯事件模式，pathToEventName） |
| RouteAbility.ts | 路由能力 |
| RouteEmitAbility.ts | 路由发送能力 |
| RouteListenAbility.ts | 路由监听能力 |
| types.ts | 类型定义 |
| index.ts | 统一导出 |

## src/runtime — 运行时环境检测（9文件）

| 文件 | 用途 |
|------|------|
| platform.ts | 平台检测 |
| locale.ts | 语言环境 |
| timezone.ts | 时区检测 |
| user-agent.ts | UA解析 |
| features.ts | 特性检测 |
| input.ts | 输入模式检测 |
| memory.ts | 内存检测 |
| runtime.ts | 运行时组合检测 |
| index.ts | 统一导出 |

## src/schema — Schema定义系统（5文件）

| 文件 | 用途 |
|------|------|
| SchemaRegistrar.ts | Schema注册器 |
| types/schema.ts | Schema类型 |
| types/rule.ts | 规则类型 |
| types/index.ts | 类型导出 |
| index.ts | 统一导出 |

## src/system-abilities — 系统级能力（10文件）

| 文件 | 用途 |
|------|------|
| index.ts | 系统能力统一导出入口 |
| interfaces/index.ts | 系统能力接口定义 |
| types/abilities.ts | 系统能力类型定义 |
| types/index.ts | 系统能力类型导出 |
| system/EventAbility.ts | 全局事件总线能力 |
| system/DomEventsAbility.ts | DOM事件适配能力 |
| system/DomainAbility.ts | 域能力（配置访问） |
| system/SystemAbility.ts | 系统级配置访问能力 |
| system/EventBridgeAbility.ts | 事件桥接能力（bridgeEmit/bridgeOn/bridgeOnce） |
| system/index.ts | 系统能力模块导出 |

## src/task — 任务调度+哈希任务+Worker（43文件）

| 文件 | 用途 |
|------|------|
| task/TaskQueue.ts | 优先级任务队列 |
| task/types.ts | 任务类型 |
| task/index.ts | 任务模块导出 |
| worker/WorkerManagerBase.ts | Worker管理器基类 |
| worker/SimpleWorkerManager.ts | 简单Worker管理器 |
| worker/types.ts | Worker类型 |
| worker/index.ts | Worker模块导出 |
| hash-task/ | 完整哈希计算系统（分块+Worker池+健康监控） |
| hash-task/factory.ts | 哈希任务工厂 |
| errors/WorkerError.ts | Worker错误 |
| errors/WorkerInitializationError.ts | Worker初始化错误 |
| errors/index.ts | 错误导出 |
| index.ts | 统一导出 |

## src/theme — 主题系统（10文件）

| 文件 | 用途 |
|------|------|
| ThemeRegistrar.ts | 主题注册器（extends RegistrarBase） |
| AtomicCSS.ts | 原子化CSS生成 |
| register.ts | 自动注册入口 |
| presets/light.ts | 亮色主题 |
| presets/dark.ts | 暗色主题 |
| presets/atomic-rules.ts | 原子CSS规则（~185条） |
| presets/chinese-themes.ts | 7个中国传统色主题 |
| presets/index.ts | 预设导出 |
| types/ | 类型定义 |
| index.ts | 统一导出 |

## src/types — 公共类型定义（2文件）

| 文件 | 用途 |
|------|------|
| flow-context.ts | ExecutionStep, IExecutableContext, IPipelineResult |
| index.ts | 统一导出 |

## src/utils — 通用工具函数（92文件）

| 文件 | 用途 |
|------|------|
| array/ | 数组工具（base/collection/random/search/set/sort） |
| color/ | 颜色工具（generateColorShades, hex/hsl/rgb互转） |
| cookie/ | Cookie操作（get/set/remove/has/getAll/getNumber/getBoolean/setJson） |
| crypto/ | 工具级加密（空目录） |
| date/ | 日期工具（calculation, calendar, format, utils） |
| geometry/ | 几何工具（align, clamp, point, rect, snap, vector, transform） |
| number/ | 数字工具（base, format） |
| object/ | 对象工具（base, clone, iterate, properties） |
| string/ | 字符串工具（base, css, format, id, plural） |
| time/ | 时间工具（after, delay, repeat, types） |
| units/ | 单位工具（angle, format, length, parse, percent, resolve, time, types） |
| composeMixins.ts | Mixin组合工具 |
| download.ts | 下载工具 |
| index.ts | 统一导出 |

## src/validation — 验证引擎（79文件）

| 文件 | 用途 |
|------|------|
| core/ValidatorRegistrar.ts | 验证器注册器 |
| core/validate.ts | 核心验证函数 |
| core/executor.ts | 验证执行器 |
| engine/validate.ts | 引擎级验证 |
| processors/array/ | 数组验证处理器（children, entries, excludes, includes, length, type, unique, uniqueBy） |
| processors/boolean/ | 布尔验证处理器（entries, type） |
| processors/common/ | 通用处理器（context, entries, presence, rule-align, transform, trim） |
| processors/date/ | 日期验证处理器（entries, excludes, includes, is, type, weekend） |
| processors/file/ | 文件验证处理器（entries, file） |
| processors/format/ | 格式验证处理器（entries, format） |
| processors/number/ | 数字验证处理器（entries, excludes, includes, is, range, type） |
| processors/object/ | 对象验证处理器（entries, properties, required-fields, type） |
| processors/password/ | 密码验证处理器（entries, password） |
| processors/split/ | 分割验证处理器（entries, split） |
| processors/string/ | 字符串验证处理器（entries, excludes, includes, length, type） |
| errors/ | 错误定义（ValidationError, ValidatorNotFoundError, DuplicateValidatorError, ValidationTypeNotDefinedError） |
| types/ | 类型定义（base, context, processor, validate） |
| utils/ | 工具函数（compare, pattern） |
| index.ts | 统一导出 |
