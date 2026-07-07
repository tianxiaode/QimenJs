# 组件能力映射表

> 最后更新：2026-07-07

## 基础能力（所有组件自动继承，无需声明）

| 基础能力 | 来源模块 | 提供的功能 |
|---|---|---|
| **EventAbility** | `@qimenjs/system-abilities` | on/once/emit/emitUI 事件系统 |
| **DomEventsAbility** | `@qimenjs/system-abilities` | bind() 手势事件（tap/drag/swipe/...） |
| **ThemeAbility** | `component/abilities` | 主题感知，onThemeChange() |
| **StyleAbility** | `component/abilities` | className/style、addClass/removeClass/toggleClass/hasClass/replaceClass、setStyle/getStyle/removeStyle、setAttribute/getAttribute/removeAttribute |

## 组件能力映射

| 组件 | 用途 | 额外能力 | 说明 |
|---|---|---|---|
| **Button** | 按钮 | TextAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility | 文本+点击+禁用+加载+尺寸 |
| **Input** | 输入框 | TextAbility, ValueAbility, ValidateAbility, PlaceholderAbility, DisableAbility, SizeAbility | 文本(标签)+值+验证+占位+禁用+尺寸 |
| **Select** | 下拉选择 | TextAbility, ValueAbility, OptionsAbility, SearchAbility, DisableAbility, SizeAbility | 文本(标签)+值+选项+搜索+禁用+尺寸 |
| **Table** | 表格 | EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ChildrenAbility | 实体+虚拟滚动+排序+列定义+子组件 |
| **Form** | 表单 | EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility, ChildrenAbility | 实体+验证+提交+字段集+子组件 |
| **Dialog** | 弹窗 | TextAbility, OpenableAbility, OverlayAbility, AnimationAbility | 文本(标题)+开关+浮层+动画 |
| **HBox** | 水平布局容器 | LayoutAbility, ChildrenAbility, AnimationAbility | 布局参数+子组件+动画 |
| **VBox** | 垂直布局容器 | LayoutAbility, ChildrenAbility, AnimationAbility | 布局参数+子组件+动画 |
| **Grid** | 网格布局容器 | LayoutAbility, ChildrenAbility, AnimationAbility | 布局参数+子组件+动画 |
| **Space** | 间距 | LayoutAbility | 仅布局参数 |

## 能力详细说明

### 通用 UI 能力

| 能力 | 提供的属性/方法 | __propAliases | __initProps |
|---|---|---|---|
| **TextAbility** | text/html (互斥 getter/setter), setText()/setHtml() (链式), updateText() | — | text → this.text, html → this.html |
| **VisibleAbility** | visible (getter/setter), show()/hide()/toggle() | — | visible → this.visible |
| **DisableAbility** | disabled (getter/setter), 自动添加 BEM class + aria-disabled | — | disabled → this.disabled |
| **LoadingAbility** | loading (getter/setter), 自动添加 BEM class + aria-busy | — | loading → this.loading |
| **SizeAbility** | size (getter/setter: sm/md/lg), 自动切换 BEM class | — | size → this.size |
| **ClickAbility** | onClick (getter/setter), click() 触发方法 | — | onClick → this.onClick |

### 数据能力

| 能力 | 提供的属性/方法 | __propAliases | __initProps |
|---|---|---|---|
| **ValueAbility** | value (getter/setter), onChange 回调 | — | value → this.value |
| **ValidateAbility** | errors/validationRules (getter/setter), validate() 异步方法 | — | — |
| **PlaceholderAbility** | placeholder (getter/setter) | — | placeholder → this.placeholder |
| **SubmitAbility** | submit()/reset() 方法 | — | — |
| **FieldSetAbility** | fields (getter), collectValues() 方法 | — | — |

### 实体与子组件能力

| 能力 | 提供的属性/方法 | __propAliases | __initProps |
|---|---|---|---|
| **EntityAbility** | mgr/entityConfig, 代理 EntityManager 公共方法 | — | — |
| **ChildrenAbility** | children/childCount (getter), addChild/removeChild/insertBefore/getChild/queryChild/queryChildren/indexOf/removeAll/eachChild | — | — |

### 渲染与列表能力

| 能力 | 提供的属性/方法 | __propAliases | __initProps |
|---|---|---|---|
| **RenderAbility** | renderer (getter), renderChild()/renderChildren() 异步方法 | — | — |
| **VirtualListAbility** | containerHeight/rowHeight/bufferCount/items/rowRenderer/scrollTop/visibleCount/startIndex/endIndex/totalHeight, renderVirtualList()/scrollToIndex()/initVirtualScroll() | — | — |

### 浮层与动画能力

| 能力 | 提供的属性/方法 | __propAliases | __initProps |
|---|---|---|---|
| **OverlayAbility** | overlayRoot (getter), openOverlay()/closeOverlay() | — | — |
| **AnimationAbility** | play() (CSS @keyframes), animate() (Web Animations API) | — | — |

### 交互能力

| 能力 | 提供的属性/方法 | __propAliases | __initProps |
|---|---|---|---|
| **OptionsAbility** | options (getter/setter), selectedOption (getter) | — | options → this.options |
| **SearchAbility** | keyword (getter/setter), onSearch 回调 | — | — |
| **SortAbility** | sortField/sortOrder (getter/setter), onSortChange 回调 | — | — |
| **ColumnAbility** | columns (getter/setter) | — | columns → this.columns |
| **OpenableAbility** | isOpen (getter), open()/close() 方法 | — | — |
| **LayoutAbility** | gap/align/justify (getter/setter), 映射到 AtomicCSS class | — | — |

## 能力使用频次

| 能力 | 使用组件数 | 使用组件 |
|---|---|---|
| TextAbility | 4 | Button, Input, Select, Dialog |
| ChildrenAbility | 4 | HBox, VBox, Grid, Form (+ Table) |
| LayoutAbility | 4 | HBox, VBox, Grid, Space |
| DisableAbility | 3 | Button, Input, Select |
| SizeAbility | 3 | Button, Input, Select |
| ValueAbility | 2 | Input, Select |
| ValidateAbility | 2 | Input, Form |
| EntityAbility | 2 | Table, Form |
| ClickAbility | 1 | Button |
| LoadingAbility | 1 | Button |
| PlaceholderAbility | 1 | Input |
| OptionsAbility | 1 | Select |
| SearchAbility | 1 | Select |
| SortAbility | 1 | Table |
| ColumnAbility | 1 | Table |
| FieldSetAbility | 1 | Form |
| SubmitAbility | 1 | Form |
| OpenableAbility | 1 | Dialog |
| OverlayAbility | 1 | Dialog |
| AnimationAbility | 4 | Dialog, HBox, VBox, Grid |
| VirtualListAbility | 1 | Table |

## 待新增能力（候选）

| 能力 | 用途 | 适用组件 | 优先级 |
|---|---|---|---|
| **CheckedAbility** | 选中状态（checked, toggle, onChange） | Checkbox, Radio, Switch | 高 |
| **TabAbility** | 标签页切换（activeTab, tabs, onTabChange） | Tabs | 高 |
| **LabelAbility** | 表单控件标签（label + for 关联） | Input, Select, Checkbox, Radio | 中 |
| **IconAbility** | 图标管理（icon getter/setter, setIcon 链式） | Button, IconButton | 低 |
| **TooltipAbility** | 提示信息（tooltip, position, showTip/hideTip） | 通用 | 低 |

## PropAlias 协议

能力可通过 `__propAliases` 声明属性别名映射，解决保留字冲突：

```typescript
// 示例：InputTypeAbility 中 inputType → type
export const InputTypeAbility: AbilityDefinition = {
    __propAliases: { inputType: 'type' },
    // ...
};
```

能力可通过 `__initProps(props)` 声明从 props 初始化的逻辑，在组件 mount() 时调用（此时 el 已可用）：

```typescript
export const StyleAbility: AbilityDefinition = {
    __initProps(props): void {
        if (props.className) this.className = props.className;
        if (props.style) this.style = props.style;
    },
    // ...
};
```

## 废弃能力

| 能力 | 替代方案 | 说明 |
|---|---|---|
| **EventBindingAbility** | EventAbility + DomEventsAbility (system-abilities) | 保留文件和导出以兼容，不再推荐使用 |

## 全局容器

框架提供两个全局单例容器，用于挂载特殊组件：

| 容器 | DOM ID | 可见性 | 用途 |
|---|---|---|---|
| **HiddenRoot** | `#q-hidden-root` | `display: none` | 挂载不需要可见的组件（隐藏表单、临时计算组件等） |
| **OverlayRoot** | `#q-overlay-root` | 可见，`pointer-events: none` | 挂载浮层组件（Dialog、Tooltip、Notification 等） |

### HiddenRoot

```js
const hiddenRoot = HiddenRoot.getInstance();

// 挂载隐藏组件
hiddenRoot.mountHidden(someComponent);

// 卸载
hiddenRoot.unmountHidden(someComponent);

// 获取 DOM 容器
const el = hiddenRoot.getRoot();
```

### OverlayRoot

```js
const overlayRoot = OverlayRoot.getInstance();

// 获取浮层容器（Dialog 的 OverlayAbility 内部使用）
const el = overlayRoot.getRoot();
```

### z-index 层级

| 层级 | z-index 值 | 用途 |
|---|---|---|
| dropdown | 1050 | 下拉菜单 |
| modal | 1060 | 弹窗 |
| notification | 1070 | 通知 |
| tooltip | 1080 | 提示 |
