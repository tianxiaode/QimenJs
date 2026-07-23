# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 组件核心双层架构：闭包基类（ComponentFactory）+ 内部类基类（InnerComponent）
- 多模板条件选择：ComponentTemplate.tpl 支持 TplNode | TplVariant[]，when 条件函数
- Component 闭包基类导出（component-core/index.ts）
- TplVariant 类型导出
- 错误码：COMPONENT_TPL_KEY_NOT_FOUND、COMPONENT_BODY_INVALID_FIELD
- 模板工厂：createComponentFactory、createInnerClass（原 createTemplateClass）、createReplaceFactory（原 createReplaceClass）
- HeroComponent 横幅区域组件（title/subtitle/desc/actionText，action 事件）
- BreadcrumbComponent 面包屑导航组件（数据驱动 items，navigate 事件，自定义分隔符）
- DividerComponent 分割线组件（水平/垂直、虚线、文字标签）
- SpacerComponent 弹性间距组件（flex grow 或固定 size）
- TagComponent 标签组件（类型色、closable、SizeAbility）
- AlertComponent 页面内提示条组件（info/success/warning/error、closable、图标）
- ProgressComponent 进度条组件（百分比、类型色、条纹动画）
- IndicatorComponent 改造为浮层组件（onOverlayChange + prev/next 箭头切换）
- OverlayDispatchCenter._mountAndShow 支持从 def.type 通过 ComponentRegistrar 自动创建浮层实例
- OverlayDispatchCenter 支持 trigger: 'always' 注册后自动显示浮层
- ToastHandleImpl.isClosed getter（替代 _closed 私有属性直接访问）

### Changed

- Entity Manager 全量迁移：从 BaseEntityManager.with() 改为 extends + withAbilities() + InferAbilities 声明合并
- Router 迁移：从 ComposableBase.with() 改为 extends + withAbilities() + InferAbilities 声明合并
- CoreEntityManager 移除 AbilityDefinition 类型导入，改用 as const + InferAbilities 推导接口
- BaseEntityManager.emit 改用 EventContextBuilder 构建 EventContext
- BaseEntityManager.dispose 移除 disposeAbilities?.() 调用（super.dispose 自动处理）
- ToggleComponent/ToggleIconComponent 补充 SizeAbility（.with([SizeAbility]) + initSize()）
- AvatarComponent 补充缺失的 initSize() 调用
- register.ts：Dropdown 注册改为 DropdownComponent（原来错误注册了 ButtonComponent）
- register.ts：补注册 Loading、Hero、Breadcrumb、Divider、Spacer、Tag、Alert、Progress
- MsgboxManager 增加 onClose 回调清理 instances Set（修复内存泄漏）
- Msgbox 增加 _doResolve 防重复 resolve + close() 兜底 cancel
- Msgbox alert 类型遮罩绑定 tap 事件关闭
- imperative/index.ts 移除 ToastHandleImpl 内部类导出

### Removed

- 删除旧版 src/component-core/abilities/DragAbility.ts（已迁移至 component-abilities/drag/）

### COMPONENT_LIFECYCLE_EVENTS 常量（init/mounted/beforeunmount/dispose/updated/resize/hiddenchange）
- LifecycleAbility 组件生命周期事件能力（_emitMounted/_emitUpdated/_emitResize/_emitLifecycleEvent）
- 组件初始化完成后自动发送 `init` 事件，有 eventKey 时发送桥接事件
- 组件销毁时自动发送 `beforeunmount` 和 `dispose` 事件，有 eventKey 时发送桥接事件
- hidden 状态变化时自动发送 `hiddenchange` 事件
- child-node-props.ts 子节点属性自动构建（contentMode→属性映射、通用属性、组件子节点 $name + 属性转发、i18n 节点特殊处理）
- template-constants.ts 常量集中管理（CONTENT_MODE_MAP/COMMON_NODE_PROPS/RESERVED_KEYS/ANIMATION_PRESETS）
- AnimationAbility 声明式动画（playEnter/playLeave，纯 getter 读 ctor._animation）
- DragAbility 声明式拖拽（move 本地处理，start/end 走 DragEventBus）
- NodePropAbility._updateNode hidden 动画通过 _state 对比 + playEnter/playLeave
- 14 个测试套件（69 tests）覆盖 component-core 核心模块

### Changed

- copyPrototypeMethods 跳过目标原型上已有的方法（不覆盖）
- TemplateComponent.dispose 增加 onBeforeUnmount 钩子调用 + beforeunmount/dispose 事件发送
- TEMPLATE_COMPONENT_ABILITIES 新增 LifecycleAbility
- 包入口 index.ts 完全重写，只导出当前实际存在的模块

### Removed

- 删除 11 个过时的旧测试文件（引用已不存在的模块）
- 删除 19 个 .bak 备份文件

## [0.2.1] - 2026-07-18

### Added

- body.forwards 属性/方法透传机制（替代 TplNode.forward，支持深层 nodeMap 路径解析）
- HeaderComponent 头部组件（统一架构，CSS + childProps 驱动场景差异）
- ToggleComponent 切换按钮组件（pressed 态视觉反馈）
- ToggleIconComponent 图标切换组件（onIcon/offIcon 双图标切换）
- ButtonGroupComponent 按钮组组件（单选/多选，继承 ItemGroupComponent）
- AvatarComponent 头像组件（图片/文字/图标三种模式，圆形裁切）
- CardComponent 卡片组件（HeaderComponent + body + footer）
- IndicatorComponent 指示器组件（dot/number/dash 三种类型，继承 ItemGroupComponent）
- TabBarComponent 标签栏组件（继承 ItemGroupComponent，可独立使用）
- TabsComponent 标签页组件（组合 TabBar + 内容区，content 支持 HTML/组件 type/组件类）
- DropdownComponent 下拉按钮组件（ButtonComponent 语义别名）
- panel.css.ts 面板 Metro 风格样式
- toggle.css.ts / toggle-icon.css.ts / button-group.css.ts / avatar.css.ts / card.css.ts / indicator.css.ts / tab-bar.css.ts / tabs.css.ts

### Changed

- TplNode.forward 标记为 @deprecated，透传统一归入 body.forwards
- 所有组件 class extends 扩展层归回 body 定义（Button/Header/ItemGroup/Menu/Nav/Panel）
- 节点名扁平化：panel:*/menuItem:*/navItem:* → 扁平名
- icon 节点统一改用 IconComponent + forwards 透传
- ItemGroup 内置溢出处理（overflowMode: scroll/menu），组合 OverflowScrollAbility/OverflowMenuAbility
- ToolbarComponent 改为 ItemGroupComponent 的语义别名
- IndicatorComponent 从手动 DOM 改为继承 ItemGroupComponent

## [0.1.2] - 2026-07-05

### Fixed

- 修复 ESM 产物中子包间引用使用 `@qimenjs/xxx` 而非相对路径的问题，改为相对路径引用
- 修复 ESLint 配置中 `endOfLine` 规则格式错误

### Changed

- 包名从 `@qimenjs/core` 改为 `@qimen-lab/core`（npm 组织名）
- 移除根入口 `exports["."]`，每个子模块作为独立包通过子路径导出
- 添加 `sideEffects: false` 支持 tree-shaking
- `prepublishOnly` 脚本改用 pnpm
- full-stack 示例改为从 npm 包引用而非源码

## [0.1.1] - 2026-07-05

### Changed

- 项目从 OrbitJS 重命名为 QimenJS，所有源码、测试、文档、示例、配置中的旧名称已全部替换
- 运行时 API 重命名：`__orbit_i18n_register__` → `__qimen_i18n_register__`，`orbitI18n` → `qimenI18n`
- localStorage key 重命名：`orbitjs_oauth2_token` → `qimenjs_oauth2_token`

### Fixed

- 修复 `package.json`、`tsconfig.json`、`jest.config.ts` 的 UTF-8 BOM 字符导致 Jest 无法解析配置
- 修复 `FlatRemoteQueryAbility.integration.test.ts` 中 5 个测试用例断言与源码接口不匹配（`filterBy`/`sortBy`/`order` → `search.keyword`/`search.sortBy`/`search.sortOrder`）

### Removed

- 清理根目录 8 个过时的 MD 文件（ARCHITECTURE、BUILD_PROGRESS、MIGRATION_SUMMARY、REGISTRY_*）
- 清理根目录 18 个临时分析/验证 TS 文件
- 清理 `test/validation-refactoring.ts` 和 `docs/原型链爬取必要性说明.ts`
- 清理根目录 `nul` 文件（Python 在 Windows 上生成的空文件）

## [0.1.0] - 2026-07-04

### Added

- 27 个子包的初始实现，覆盖基础层到应用层
- 实体管理框架：Manager + Ability 架构，支持 CRUD、分页、搜索、排序
- 数据处理器管道：ABP / Spring Data 开箱即用的参数转换
- HTTP 客户端：拦截器、重试、缓存、请求上下文
- OAuth2 认证：授权码、密码、客户端凭证三种模式
- 国际化：i18n 预编译 + loadScript 动态加载语言包
- 事件系统：EventBus + EventScope + DOM 事件适配
- 数据管道：可组合的处理器链
- 能力组合：AbilityDefinition 动态组合能力
- Schema 定义：字段 + 验证规则
- 验证引擎：规则 + 链式验证
- 任务调度：队列 + 优先级
- 缓存管理：LRU + TTL
- 注册表：领域隔离的注册中心
- 运行时环境检测
- 哈希与编解码：MD5/SHA/XXHash/Base64
- 异步工具：重试、并发控制、超时
- MIME 类型解析
- 设计模式工具
- 全栈 Demo 示例（OAuth2 + ABP + Spring + 27 个功能演示页面）
- GitHub Actions 自动部署到 GitHub Pages
- GitHub Codespaces 一键启动完整演示环境
- API 文档（TypeDoc 生成）
- 最佳实践文档（i18n、composable、schema、http、data-processor）

### Note

- 本版本为初始开发版本（0.x.x），API 可能在后续版本中发生变化
- UI 组件层尚未实现，计划在后续版本中添加
