# QimenJs 源码目录索引

> 供 AI 快速了解项目结构，避免重复搜索。共 113 个文件。

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

## src/component-core — 组件核心基础设施层（37文件）

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
| abilities/EventBridgeAbility.ts | 事件桥接能力 |
| abilities/index.ts | 核心能力模块导出 |
| abilities/InitAbility.ts | 组件统一初始化流程能力 |
| abilities/LayoutAbility.ts | 布局能力（fit/hbox/vbox等） |
| abilities/NodeMapAbility.ts | 内容属性初始化与i18n刷新 |
| abilities/OverlayAbility.ts | 浮层管理能力（宿主侧） |
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

## src/system-abilities — 系统级能力（9文件）

| 文件 | 用途 |
|------|------|
| index.ts | 系统能力统一导出入口 |
| interfaces/index.ts | 系统能力接口定义 |
| types/abilities.ts | 系统能力类型定义 |
| types/index.ts | 系统能力类型导出 |
| system/DomainAbility.ts | 域能力（配置访问） |
| system/DomEventsAbility.ts | DOM事件适配能力 |
| system/EventAbility.ts | 全局事件总线能力 |
| system/index.ts | 系统能力模块导出 |
| system/SystemAbility.ts | 系统级配置访问能力 |
