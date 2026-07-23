# @qimenjs/component

**层级**: UI 层  
**状态**: ⚠️ 开发中  
**测试**: ✅  
**覆盖率**: ~78%

## 构建历史

### 2026-07-23
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

### 中优先级

- [ ] 新增 SelectComponent 选择组件
- [ ] 新增 DialogComponent 对话框组件
- [ ] 新增 TableComponent 表格组件

## 使用统计

### 依赖的包
- @qimenjs/component-core (UI)
- @qimenjs/component-abilities (UI)
- @qimenjs/composable (L1)
- @qimenjs/events (L1)

### 被以下包使用
- 应用层直接使用
