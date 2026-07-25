# @qimenjs/component

**层级**: UI 层  
**状态**: ⚠️ 开发中  
**测试**: ✅  
**覆盖率**: ~78%

## 构建历史

### 2026-07-25
- ✅ Table 组件体系搭建
  - 新增 column-types.ts：ColumnDef 扩展 editable/editType/editComponent/groupAggregator/tableAggregator
  - 新增 EditType 类型：text/number/date/select/custom
  - 新增 AggregatorType 类型：sum/count/avg/min/max/label
  - ColumnMeta 扩展为全量字段（sortable/resizable/editable/editType/fixed/groupAggregator/tableAggregator 等）
- ✅ Table 引擎体系（engine/）
  - ColumnMetaManager：列元数据管理器，NodeMapManager 模式，compile/get/getAll/getEditable/getGroupable/getSummarizable
  - RowEngine：数据行引擎，Component.withTemplate 编译行组件
  - HeaderEngine：表头引擎，支持多级分组（ColumnGroupDef 递归）
  - EditOverlayEngine：浮动编辑层引擎，editable slot + actions + error，走 OverlayDispatchCenter
  - GroupSummaryEngine：分组统计行引擎，groupAggregator 驱动
  - TableSummaryEngine：整表统计行引擎，tableAggregator 驱动
  - cell-tpl-helpers：共享 cell TplNode 工具函数（createCellTpl/createTextCellTpl/createRowTpl）
  - 五引擎统一 WeakMap<ColumnDefOrGroup[], any> 缓存，同一列定义引用编译一次
- ✅ HeaderCell resize 改造
  - LeafHeaderCellComponent：原生 mousedown/mousemove/mouseup → body.drags 声明式（axis:'x', activeClass）
  - GroupHeaderCellComponent：tplReplaces 恢复 resizeHandle（绝对定位右边缘），拖拽代理到最右子列
  - header-cell.css.ts：新增 .q-header-cell__group-body（flex column）+ group resizeHandle 绝对定位
- ✅ HeaderComponent 重构：单 tools → toolsLeft + toolsRight 双 ItemGroup
  - 布局：icon → toolsLeft → title → subtitle → toolsRight → action
  - 新增 tplEvents：toolsLeft/toolsRight 的 $items 点击事件 + action click 事件
  - 新增 HeaderProps 接口和 onAfterInit 初始化逻辑
  - HeaderFragment 同步更新
- ✅ PanelComponent 重构：内联 header → HeaderComponent 子组件
  - forwards: { title: 'header.title' } 透传
  - tplEvents 转发 header 的 toolsLeftClick/toolsRightClick/actionClick
  - 折叠逻辑改为监听 headerActionClick
  - 新增 ResizeAbility 支持（.with([ResizeAbility])，resizable: true 时启用 e/s/se 三边）
- ✅ DialogComponent 新建：纯内容浮层组件
  - 由 OverlayDispatchCenter 调度显示/隐藏（placement: 'center', mask: true）
  - 使用 HeaderComponent 作为头部，默认 close 按钮
  - Header 拖动移动：_initHeaderDrag() 绑定 drag 事件，拖动时切换为 fixed 定位
  - ResizeAbility：.with([ResizeAbility])，默认 8 边全开
  - onOverlayChange 支持调度中心动态更新数据
- ✅ OverlayDispatchCenter 扩展：center 定位支持
  - positionOverlay 新增 'center' Placement（fixed + 50%/translate 居中）
  - OverlayDispatchCenter 在 placement='center' 时不设 position: absolute
  - OverlayPlacement 类型新增 'center'
- ✅ 新增表单扩展组件（6 个）
  - TextareaComponent 多行文本组件（FormFieldComponent.replace + TextareaFieldBodyComponent，autoSize/rows/resize）
  - NumberInputComponent 数字输入框组件（InputComponent.replace，min/max/step/precision/步进按钮）
  - SelectComponent 下拉选择组件（InputComponent.replace + dropdownIcon，options/filterable/multiple/下拉面板）
  - SwitchComponent 开关组件（FormFieldComponent.replace + SwitchFieldBodyComponent，track/thumb/activeText/inactiveText）
  - CheckboxGroupComponent 复选框组组件（FormFieldComponent.replace + CheckboxGroupFieldBodyComponent，ItemGroupStatic 管理选项）
  - RadioGroupComponent 单选框组组件（FormFieldComponent.replace + RadioGroupFieldBodyComponent，ItemGroupStatic 管理选项）
- ✅ 新增 FieldBody 子组件（4 个）
  - TextareaFieldBodyComponent（textarea 字段体）
  - SwitchFieldBodyComponent（开关轨道 + 滑块）
  - CheckboxGroupFieldBodyComponent（复选框组选项容器）
  - RadioGroupFieldBodyComponent（单选框组选项容器）
- ✅ 新增 CSS 样式文件（4 个）
  - textarea.css.ts / number-input.css.ts / select.css.ts / switch.css.ts / selection-group.css.ts
- ✅ register.ts 补注册 TextCell/TreeCell/CheckboxCell/ActionCell（4 个 cell type）
- ✅ ItemGroupPooledComponent 辅助池（AuxPool）机制
  - registerAuxPool/unregisterAuxPool：注册/注销辅助池（group/expand/groupSummary/tableSummary 角色）
  - setAuxItems/addAuxItem/removeAuxItemAt/clearAuxPool：辅助池 CRUD
  - CSS order 布局：_applyOrders() 替代 _reorderDOM()，辅助池元素按 offset 插入主池间隙
  - 表格角色便捷方法：setGroupRows/setExpandRows/setGroupSummaries/setTableSummaries
  - getTargetItem 支持辅助池查找
- ✅ css.ts 新增 indentStyle()：树形缩进 CSS 生成（depth * CSS 变量 + offset）
- ✅ 删除 EventFlowRegistrar（功能已由 DragDispatchCenter/OverlayDispatchCenter/EntityDispatchCenter 替代）
- ✅ HeaderComponent 重构：单 tools → toolsLeft + toolsRight 双 ItemGroup
- ✅ 新增表单组件体系
  - InputComponent 输入组件（labelPosition 多模板、验证、前缀后缀图标、clearable、SizeAbility）
  - PasswordInputComponent 密码输入组件（强度指示器、显示/隐藏切换、生成密码）
  - FormFieldComponent 表单字段包装组件（label/验证消息/必填标记）
  - FormComponent 表单容器组件（字段收集、统一验证、提交/重置）
  - InputInfoGroupComponent 输入信息组（关联 Input + FormField）
  - TextComponent 文本显示组件
- ✅ 新增 OverflowMenuComponent / OverflowScrollComponent 溢出组件
- ✅ 新增 LoadingComponent 加载组件
- ✅ ItemGroupBaseComponent 新增 cols 多列 Grid 布局支持（CSS Grid + --q-itemgroup-cols 变量）
- ✅ HeaderComponent 模板改用 flex 简写（layout/align/gap → flex: { direction, align, gap }）
- ✅ 组件 body 方法改用 `const self = this as any` 模式（适配 withAbilities 能力注入）
- ✅ AccordionComponent/ButtonGroupComponent/MenuComponent/NavItemGroupComponent/TabBarComponent 迁移
- ✅ register.ts 补注册 Input/PasswordInput/Text/InputInfoGroup/Form

### 2026-07-22
- ✅ 新增 HeroComponent 横幅区域组件（title/subtitle/desc/actionText）
- ✅ 新增 BreadcrumbComponent 面包屑导航组件（数据驱动 items，navigate 事件）
- ✅ 新增 DividerComponent 分割线组件（水平/垂直、虚线、文字标签）
- ✅ 新建 SpacerComponent 弹性间距组件（flex grow 或固定 size）
- ✅ 新建 TagComponent 标签组件（类型色、closable、SizeAbility）
- ✅ 新建 AlertComponent 页面内提示条组件（info/success/warning/error、closable）
- ✅ 新建 ProgressComponent 进度条组件（百分比、类型色、条纹动画）
- ✅ IndicatorComponent 改造为浮层组件（onOverlayChange + prev/next 箭头切换）
- ✅ OverlayDispatchCenter._mountAndShow 支持从 type 自动创建浮层实例
- ✅ OverlayDispatchCenter 支持 trigger: 'always' 自动显示
- ✅ ToggleComponent/ToggleIconComponent 补充 SizeAbility（with + initSize）
- ✅ AvatarComponent 补充缺失的 initSize() 调用
- ✅ 修复 register.ts：Dropdown 注册改为 DropdownComponent，补注册 Loading/Hero/Breadcrumb/Divider/Spacer/Tag/Alert/Progress
- ✅ 删除旧版 src/component-core/abilities/DragAbility.ts

### 2026-07-21
- ✅ 重构 ItemGroup 为三层架构：ItemGroupBaseComponent / ItemGroupPooledComponent / ItemGroupStaticComponent
- ✅ 池化模式：数据驱动，索引即位置，子项隐藏/显示复用，要求子项实现 update()
- ✅ 静态模式：order 控制顺序，组件随数据生灭，支持 sort()/move()，适用于异质子项（Menu、Toolbar）
- ✅ 框架改进：replace() 生命周期钩子自动链式调用（先基类后子类）
- ✅ 修复事件解绑机制：_bindItemEvents 收集 off 到 item._unsubs，_unbindItemEvents 遍历调用
- ✅ 修复 _reorderDOM：用 removeChild 替代 innerHTML='' 避免误删非管理 DOM
- ✅ Menu/Toolbar 改为 ItemGroupStaticComponent（异质子项/分隔符不适合池化）
- ✅ 所有派生类 config.itemType → defaultItemType，删除废弃的 itemDestroy

### 2026-07-13
- ✅ 新增 NavItemComponent（withTemplate + eventKey 事件转发）
- ✅ 新增 NavItemGroupComponent（继承 ItemGroupComponent）
- ✅ 新增 RouteNavComponent/RouteContainerComponent

### 2026-07-12
- ✅ 新增 MenuComponent 浮层菜单组件
- ✅ 新增 MenuItemComponent 菜单项组件
- ✅ 新增 TipsComponent 提示浮层组件
- ✅ 新增 BadgeComponent 角标组件
- ✅ 新增 ButtonComponent 按钮组件
- ✅ 新增 ItemGroupComponent 项组组件
- ✅ 新增 PanelComponent 面板组件
- ✅ 重构 ToolbarComponent（模板预定义节点 + 显隐切换）
- ✅ 新增 nav.css.ts/menu.css.ts/badge.css.ts/button.css.ts/tips.css.ts/toolbar.css.ts/itemgroup.css.ts

## 测试状态

### 通过的测试
- ✅ ButtonComponent - 27 用例
- ✅ BadgeComponent - 20 用例
- ✅ MenuComponent - 浮层菜单
- ✅ MenuItemComponent - 菜单项
- ✅ NavItemComponent - 导航项
- ✅ NavItemGroupComponent - 导航项组
- ✅ TipsComponent - 8 用例
- ✅ ToolbarComponent - 27 用例

## 遗留工作

### 高优先级
- [ ] 补充 PanelComponent 测试
- [ ] 补充 ItemGroupComponent 测试
- [ ] 补充 DialogComponent 测试

### 中优先级

- [ ] 新增 TableComponent 表格组件
- [ ] 补充 TextareaComponent / NumberInputComponent / SelectComponent / SwitchComponent / CheckboxGroupComponent / RadioGroupComponent 测试

## 使用统计

### 依赖的包
- @qimenjs/component-core (UI)
- @qimenjs/component-abilities (UI)
- @qimenjs/composable (L1)
- @qimenjs/events (L1)

### 被以下包使用
- 应用层直接使用
