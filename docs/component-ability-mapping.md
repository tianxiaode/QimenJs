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
| **Table** | 表格 | EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ColumnManageAbility, ChildrenAbility | 实体+虚拟滚动+排序+列定义+列管理+子组件 |
| **Form** | 表单 | EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility, ChildrenAbility | 实体+验证+提交+字段集+子组件 |
| **Dialog** | 弹窗 | TextAbility, OpenableAbility, OverlayAbility, AnimationAbility | 文本(标题)+开关+浮层+动画 |
| **Toolbar** | 工具栏 | LayoutAbility, ChildrenAbility, AnimationAbility | 布局参数+子组件+动画 |
| **ButtonGroup** | 按钮组 | ChildrenAbility, SizeAbility, DisableAbility | 子组件+尺寸(子按钮继承)+禁用(子按钮继承) |
| **Separator** | 分隔符 | VisibleAbility | 显隐 |
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
| **SelectableAbility** | selectable/selected/selectGroup (getter/setter), select()/deselect()/toggle(), onSelectChange 回调, 互斥组自动取消同组选中, 事件: selectchange | — | selectable/selected/selectGroup → 对应属性 |

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
| **ChildrenAbility** | children/childCount (getter), addChild/addChildren/removeChild/removeChildAt/removeAll/insertBefore/replaceChild/moveChild/getChild/getChildAt/queryChild/queryChildren/find/findAll/indexOf/contains/eachChild, 事件: childadd/childremove/childmove/childrenchange | — | — |

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
| **ColumnAbility** | columns (getter/setter), getVisibleColumns(row?), formatCellValue(col, row), isCellDisabled(col, row), getCellClass(col, row), ColumnDefinition 接口 | — | columns → this.columns |
| **ColumnManageAbility** | addColumn/addColumns/removeColumn/removeColumnAt/hideColumn/showColumn/moveColumn/replaceColumn/getColumn/getColumnAt/columnCount, 事件: columnadd/columnremove/columnmove/columnreplace/columnhide/columnshow | — | — |
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
| SelectableAbility | 0 (按需) | 工具栏按钮等可选中组件 |
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

## 列基类与单元格基类

### ColumnBase 列基类

列组件基类，派生类可直接继承，避免重复配置。

| 属性 | 类型 | 说明 |
|---|---|---|
| field | string | 字段名 |
| width | number \| string | 列宽 |
| align | 'left' \| 'center' \| 'right' | 对齐方式 |
| format | string | 预设格式化器 |
| renderer | function | 自定义渲染函数 |
| disabledWhen | function | 条件禁用函数 |
| cellClassWhen | function | 条件样式函数 |

**注入能力**：TextAbility(列头文本), VisibleAbility(显隐), DisableAbility(禁用), SortAbility(排序)

**核心方法**：`toDefinition()` — 导出为 ColumnDefinition 对象

### 派生列

| 列组件 | 预设配置 | 额外能力 | 用途 |
|---|---|---|---|
| **NumberColumn** | align='right', format 支持 | — | 数字列，预设右对齐+格式化 |
| **IdColumn** | width=60, align='center', sortable=false, 默认隐藏 | — | ID列，窄宽居中不可排序 |
| **CheckboxColumn** | width=40, align='center', sortable=false | SelectableAbility | 复选框列，行选择管理 |

#### NumberColumn

```js
{ type: 'NumberColumn', field: 'amount', label: '金额', format: 'currency' }
{ type: 'NumberColumn', field: 'rate', label: '比率', format: 'percent' }
```

#### IdColumn

```js
{ type: 'IdColumn', field: 'id', label: 'ID' }              // 默认隐藏
{ type: 'IdColumn', field: 'id', label: 'ID', hidden: false } // 强制显示
```

#### CheckboxColumn

```js
{ type: 'CheckboxColumn', field: '_selected', label: '' }
```

| 方法 | 说明 |
|---|---|
| selectRow(rowId) | 选中行 |
| deselectRow(rowId) | 取消选中行 |
| toggleRow(rowId) | 切换行选中 |
| selectAll(rowIds) | 全选 |
| clearSelection() | 清空选中 |
| isRowSelected(rowId) | 判断行是否选中 |
| selectedRows | 已选中的行 ID 集合 |
| selectedCount | 选中行数 |

事件：`rowselect` / `selectionchange`

### CellBase 单元格基类

单元格组件基类，派生类可重写 `renderCell()` 实现自定义渲染。

| 属性 | 类型 | 说明 |
|---|---|---|
| rowData | Record<string, any> | 所属行数据 |
| columnDef | ColumnDefinition | 所属列定义 |
| field | string | 字段名 |
| rawValue | any | 原始值（getter） |

**注入能力**：TextAbility(内容), DisableAbility(禁用)

**核心方法**：
- `renderCell()` — 渲染单元格内容（可重写）
- `update(props)` — 更新行数据/列定义

```typescript
// 派生示例
class LinkCell extends CellBase {
    static override readonly abilities = [...CellBase.abilities, ClickAbility];
    override renderCell(): void {
        this.el.innerHTML = `<a href="#">${this.rawValue}</a>`;
    }
}
```
