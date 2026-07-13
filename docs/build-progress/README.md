# QimenJS 构建进度

本目录记录所有包的构建进度、测试状态、问题和遗留工作。

## 文档结构

```
docs/build-progress/
├── README.md                    # 本文件（索引）
├── layer-0/                     # 第 0 层包（8 个零依赖包）
│   ├── error.md
│   ├── logger.md
│   ├── utils.md
│   ├── async.md
│   ├── runtime.md
│   ├── crypto.md
│   ├── types.md
│   └── i18n.md
├── layer-1/                     # 第 1 层包（6 个轻依赖包）
│   ├── registry.md
│   ├── cache.md
│   ├── events.md
│   ├── task.md
│   ├── composable.md
│   └── context.md
├── layer-2/                     # 第 2 层包（8 个功能包）
│   ├── schema.md
│   ├── validation.md
│   ├── pipeline.md
│   ├── mime.md
│   ├── pattern.md
│   ├── composable.md
│   ├── event-dom.md
│   └── permission.md
├── layer-3/                     # 第 3 层包（6 个高级功能包）
│   ├── data-processor.md
│   ├── data-processor-abp.md
│   ├── data-processor-spring.md
│   ├── http.md
│   ├── system-abilities.md
│   └── oauth2.md
└── layer-4/                     # 第 4 层包（1 个业务包）
    └── entity.md
```

## 总体进度

| 层级 | 总包数 | 已完成 | 测试通过 | 分支覆盖率 |
|------|--------|--------|----------|------------|
| 第 0 层 | 8 | 8 | 8 | ~85% |
| 第 1 层 | 6 | 6 | 6 | ~89% |
| 第 2 层 | 8 | 7 | 7 | ~86% |
| 第 3 层 | 6 | 6 | 6 | ~87% |
| 第 4 层 | 1 | 1 | 1 | ~83% |
| **总计** | **29** | **28** | **28** | **~87%** |

**全局覆盖率**：语句 95% | 分支 87% | 函数 95% | 行 96%
**测试**：238 套件 / 2833 用例（全部通过）
**当前重点**：准备 npm 发布

## 快速导航

### 按层级查看

- [第 0 层：核心基础包](./layer-0/) - 8 个零依赖包
- [第 1 层：基础设施工具包](./layer-1/) - 6 个包
- [第 2 层：功能工具包](./layer-2/) - 8 个包
- [第 3 层：高级功能包](./layer-3/) - 6 个包
- [第 4 层：业务包](./layer-4/) - 1 个包

### 按状态查看

#### 已完成

- [error](./layer-0/error.md) - 错误处理
- [logger](./layer-0/logger.md) - 日志系统
- [utils](./layer-0/utils.md) - 工具函数
- [async](./layer-0/async.md) - 异步工具
- [runtime](./layer-0/runtime.md) - 运行时环境
- [crypto](./layer-0/crypto.md) - 加密工具
- [types](./layer-0/types.md) - 全局共享类型
- [i18n](./layer-0/i18n.md) - 国际化
- [registry](./layer-1/registry.md) - 注册器系统
- [cache](./layer-1/cache.md) - 缓存系统
- [events](./layer-1/events.md) - 事件系统
- [task](./layer-1/task.md) - 任务系统
- [composable](./layer-1/composable.md) - 可组合能力系统
- [context](./layer-1/context.md) - 请求上下文
- [schema](./layer-2/schema.md) - Schema 定义系统
- [validation](./layer-2/validation.md) - 验证系统
- [pipeline](./layer-2/pipeline.md) - 管道执行器
- [mime](./layer-2/mime.md) - MIME 类型管理
- [pattern](./layer-2/pattern.md) - 模式注册器
- [event-dom](./layer-2/event-dom.md) - DOM 事件适配器
- [permission](./layer-2/permission.md) - 权限注册与查询系统
- [data-processor](./layer-3/data-processor.md) - 数据处理器
- [data-processor-abp](./layer-3/data-processor-abp.md) - ABP 数据处理管道
- [data-processor-spring](./layer-3/data-processor-spring.md) - Spring 数据处理管道
- [http](./layer-3/http.md) - HTTP 客户端
- [system-abilities](./layer-3/system-abilities.md) - 系统能力集
- [oauth2](./layer-3/oauth2.md) - OAuth2 认证流程
- [entity](./layer-4/entity.md) - 实体管理框架

## 最近更新

### 2026-07-13
- 导航组件：新增 NavItemComponent（withTemplate + eventKey 事件转发，text/icon/active/disabled）
- 导航组件：新增 NavItemGroupComponent（继承 ItemGroupComponent，eventKey='nav'，selectAt/clearSelection/activeIndex）
- 分组选择能力：新增 GroupSelectAbility（radio 互斥/checkbox 多选，能力状态管理，MenuComponent 使用）
- MenuItemComponent 新增分组选择属性（group/groupMode/checked，radio ●/○ + checkbox ☑/☐ 指示器，ARIA role 支持）
- 模板事件声明化：MENU_ITEM_TEMPLATE/NAVITEM_TEMPLATE 添加 event:'click'，handleClick → onContentClick
- ExpandArrowAbility 从 component-abilities/render 重导出到主入口
- 新增单元测试：NavItemComponent.test.ts、NavItemGroupComponent.test.ts、GroupSelectAbility.test.ts
- 更新单元测试：MenuItemComponent.test.ts（分组、onContentClick）、MenuComponent.test.ts（GroupSelectAbility）

### 2026-07-13（早期）
- 浮层能力重构：OverlayHostAbility 从 component-abilities 迁回 component-core（消除循环依赖，所有浮层组件可直接使用）
- OverlayAbility 拆分为 OverlayAbility（通用浮层创建+委托方法）+ TooltipAbility（tooltip 专属属性和初始化）
- 新增 TipsComponent 提示浮层组件（OverlayHostAbility + TIPS_TEMPLATE + hover 事件 + delay）
- 新增 tips.css.ts（Tips 样式，TS 导出 CSS 字符串）
- InitAbility 导入 TooltipKey 从 OverlayAbility 改为 TooltipAbility
- component-abilities 的 OverlayHostAbility 改为从 component-core 重导出
- 新增单元测试：overlay-host-ability.test.ts（18 用例）、tooltip-ability.test.ts（14 用例）、overlay-ability.test.ts（16 用例）、TipsComponent.test.ts（8 用例）

### 2026-07-12（晚间）
- 新增 MenuComponent 浮层菜单组件（OverlayHostAbility + MenuItemManageAbility，池化复用菜单项，open/close/reposition 浮层协议）
- 新增 MenuItemComponent 菜单项组件（OverlayAbility 支持子菜单浮层，hover 延迟弹出/关闭）
- 新增 MenuItemManageAbility 菜单项管理能力（池化复用、增删改、状态管理，从 ComponentRegistrar 查找 MenuItem 组件类实现能力与组件解耦）
- 新增 MENU_TEMPLATE/MENU_ITEM_TEMPLATE 模板预设
- 新增 ComponentTypes.MENU/MENU_ITEM
- ToolbarComponent 补充 type 定义
- OverlayHostAbility 从 component-core/abilities 迁移到 component-abilities/render
- TooltipOverlayAbility 从 component-core/abilities 迁移到 component-abilities/render
- component-core/index.ts 改为从 @qimenjs/component-abilities 重导出（保持向后兼容）
- 新增单元测试：MenuItemComponent.test.ts、MenuComponent.test.ts、MenuItemManageAbility.test.ts
- 重构 ToolbarComponent：模板预定义所有溢出模式节点，通过显隐切换实现模式互斥
- TOOLBAR_TEMPLATE 从空数组改为包含 5 个预定义节点（contentArea/prevBtn/nextBtn/triggerBtn/menuPanel）
- contentArea 设为 flex 容器，子节点通过 CSS order 属性自行决定排列顺序
- OverflowScrollAbility 重构：从 nodeMap 获取模板预定义节点，不再动态创建 DOM
- OverflowMenuAbility 重构：从 nodeMap 获取模板预定义节点，不再动态创建 DOM
- ToolbarComponent.cleanupOverflow 简化为显隐切换 + 断开 Observer，不需要 DOM 还原
- 修复 precompileTemplate bug：多顶级元素模板中 data-content 在顶级元素上无法被解析
- 修复 ComponentBase → TemplateComponent 遗留引用（15 个组件文件 + HiddenRoot.ts）
- 测试 setup 新增 ResizeObserver/MutationObserver/scrollBy/scrollTo polyfill
- 新增单元测试：ToolbarComponent.test.ts（27 用例）、OverflowScrollAbility.test.ts（20 用例）、OverflowMenuAbility.test.ts（21 用例）

### 2026-07-12（下午）
- 新增 LayoutAbility 布局能力（fit/hbox/vbox/grid/center，自动为根元素添加布局 CSS 类）
- 布局类型值常量化（LAYOUT_FIT/LAYOUT_HBOX/LAYOUT_VBOX/LAYOUT_GRID/LAYOUT_CENTER）
- 合并到 TEMPLATE_COMPONENT_ABILITIES，TemplateComponent.flush() 新增 flushLayout() 调用
- 新增单元测试：layout-ability.test.ts（9 用例，全部通过）
- 新增 Badge 角标能力：BadgeAbility（initBadge/setBadgeText/setBadgeVisible，对齐 OverlayAbility 模式）
- 新增 BadgeComponent（withTemplate + ContentAbility，独立组件管定位和渲染，src/component/badge/ 目录）
- 新增 BadgeProps/BADGE_KEYS（LayoutNode 声明式配置，badge/badgeType/badgePlacement/badgeTypeOverride）
- InitAbility 步骤6 驱动 initBadge + assignProps 赋值
- 新增 badge.css.ts（Badge 样式，TS 导出 CSS 字符串）
- 新增单元测试：badge-ability.test.ts（18 用例）、BadgeComponent.test.ts（20 用例）、layout-keys.test.ts（4 用例）、init-ability.test.ts 新增 4 用例
- 覆盖率：BadgeAbility 96%/94%/100%/100%、BadgeComponent 100%、layout-keys 100%
- 新增 ButtonComponent（withTemplate + ContentAbility，支持 type/size/disabled 配置，src/component/button/ 目录）
- 新增 button.css.ts（Button 样式，5 种类型 + 3 种尺寸 + 禁用状态）
- 新增单元测试：ButtonComponent.test.ts（27 用例，全部通过）
- 重构 imperative 包：Toast/Msgbox 拆分为独立实例类 + Manager 调度器
- 新增 TemplateCacheAbility（模板缓存+克隆+nodeMap+setTemplate）
- 新增 FloatingLayerAbility（OverlayRoot挂载+z-index+动画+视口定位+bindDomEvent）
- Toast/Msgbox 使用 ComposableBase.with() 组合能力，每个实例自带 eventScope/模板缓存/浮层能力
- ToastManager 只管队列调度和堆叠定位，MsgboxManager 只管创建/销毁调度
- api.ts 合并 toast()/msgbox 工厂函数
- ToastOptions/MsgboxOptions 新增 eventKey 字段，支持 EventBridgeAbility 桥接监听
- 新增 imperative 单元测试（19 个用例）

### 2026-07-12
- withTemplate 支持 JSON 模板数组（JsonTemplateNode[]），jsonTemplateToHtml 返回 { html, componentMap }
- 新增 ChildSlotAbility 子组件插槽替换能力，支持 replace/child 两种模式
- 新增 OverlayHostAbility 浮层宿主能力 + TooltipOverlayAbility tooltip 浮层能力
- TemplateAbility 新增 _renderChildComponents / _disposeChildComponents，支持 data-json 占位节点渲染
- TemplateComponent.dispose 递归销毁子组件
- NodeMetadata 扩展 componentClass/component/parentNode/nodeIndex 字段
- Router 重构为纯事件模式，pathToEventName 路径转事件名，emit source='router'
- EventAbility.emit 统一入口，通过 options.source 分流传统模式和 UI 事件模式
- EventScope.emit 支持 options.source 参数
- 移除 template 包，模板预设/常量/JSON 迁移到 component-core
- MsgboxManager/ToastManager 适配 jsonTemplateToHtml 返回值变更
- 新增单元测试：template-json.test.ts、ChildSlotAbility.test.ts、Router.test.ts
- 更新测试：TemplateComponent.test.ts、EventScope.test.ts、EventAbilityUI.test.ts

### 2026-07-05
- 项目从 OrbitJS 重命名为 QimenJS，全量替换源码/测试/文档/示例/配置中的旧名称
- 修复 package.json、tsconfig.json、jest.config.ts 的 UTF-8 BOM 问题
- 修复 FlatRemoteQueryAbility 集成测试断言与源码接口不匹配（5 个用例）
- 清理根目录 8 个过时 MD 文件和 18 个临时 TS 文件
- 重新生成 TypeDoc API 文档
- 测试：238 套件 / 2833 用例全部通过

### 2026-07-02
- 新增 @qimenjs/oauth2 认证流程包（密码/授权码/客户端凭证模式 + 401 自动刷新）
- 22 个 OAuth2 测试用例通过
- 全栈示例（examples/full-stack）搭建完成，集成 EntityManager
- FlatRemoteEntityState 运行时缺陷修复（缺少 updateData/toParams/updateItem/isValidPage）
- FlatRemoteListAbility 防抖返回值修复（debounce 不返回异步结果）
- RequestContextBuilder.withRequest undefined 覆盖修复
- StateCacheAbility.updateData 重命名为 updateSourceData，解决 Ability 注入覆盖冲突
- TreeRemoteEntityState 新增 updateData 方法
- 新增 EntityManager 集成测试（18 个用例）+ RequestContextBuilder 边界测试（5 个用例）
- **工作重点调整**：从"集成示例搭建"转向"补充集成测试"，解决单元测试覆盖率虚高问题

### 2026-07-01
- 新增 @qimenjs/i18n 国际化模块
- MimeTypeRegistrar 拆分为 @qimenjs/mime 独立包（7 类预定义 MIME 类型）
- PatternRegistrar 拆分为 @qimenjs/pattern 独立包（19 个验证模式自动注册）
- 新增 @qimenjs/data-processor-abp（ABP 数据处理管道 + 字段级验证错误映射）
- 新增 @qimenjs/data-processor-spring（Spring 数据处理管道）
- 完成 AbilityDefinition 迁移：15 个 Manager Ability 从 class 迁移为纯对象
- 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar 旧版代码
- 同步构建配置：build-config.json、package.json exports、tsconfig.json paths

### 2026-06-30
- 全局分支覆盖率从 74.2% 提升到 87.33%
- 补充 system-abilities、composable、data-processor、crypto、http、entity、schema、validation 包测试
- entity 包状态从"开发中"更新为"已完成"

## 参考资料

- [文档导航](../SUMMARY.md) - 文档总览
- [架构文档](../architecture/README.md) - 架构原则和包说明
- [设计决策](../design-decisions/README.md) - 重要的设计决策
