# 组件能力映射表

> 最后更新：2026-07-07

## 基础能力（所有组件自动继承，无需声明）

| 基础能力 | 来源模块 | 提供的功能 |
|---|---|---|
| **EventAbility** | `@qimenjs/system-abilities` | on/once/emit/emitUI 事件系统 |
| **DomEventsAbility** | `@qimenjs/system-abilities` | bind() 手势事件（tap/drag/swipe/...） |
| **ThemeAbility** | `component/abilities` | 主题感知，onThemeChange() |
| **StyleAbility** | `component/abilities` | className/style、addClass/removeClass/toggleClass/hasClass/replaceClass、setStyle/getStyle/removeStyle、setAttribute/getAttribute/removeAttribute |
| **ComponentEventBusAbility** | `system/abilities` | eventBridge 声明式事件桥接，自动绑定/自动销毁 |

## 组件能力映射

| 组件 | 用途 | 额外能力 | 说明 |
|---|---|---|---|
| **Button** | 按钮 | TextAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility | 文本+点击+禁用+加载+尺寸 |
| **Input** | 输入框 | TextAbility, ValueAbility, ValidateAbility, PlaceholderAbility, DisableAbility, SizeAbility | 文本(标签)+值+验证+占位+禁用+尺寸 |
| **Select** | 下拉选择 | TextAbility, ValueAbility, OptionsAbility, SearchAbility, DisableAbility, SizeAbility | 文本(标签)+值+选项+搜索+禁用+尺寸 |
| **Table** | 表格 | EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ColumnManageAbility, ChildrenAbility | 实体+虚拟滚动+排序+列定义+列管理+子组件 |
| **Form** | 表单 | EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility, ChildrenAbility | 实体+验证+提交+字段集+子组件 |
| **Dialog** | 弹窗 | TextAbility, OpenableAbility, OverlayAbility, AnimationAbility | 文本(标题)+开关+浮层+动画 |
| **Toolbar** | 工具栏 | LayoutAbility, ChildrenAbility, AnimationAbility, ToolbarAbility, PaginationAbility, CrudAbility | 布局+子组件+动画+位置排序+分页+CRUD |
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
| **ToolbarAbility** | sortedChildren (getter), insertAt/insertBeforeItem/insertAfterItem/removeAtPosition/hideAtPosition/showAtPosition/getAtPosition/reorder | — | — |
| **PaginationAbility** | currentPage/totalPages/totalRecords/pageSize/showFirstLast/showPageInfo (getter/setter), gotoPage/prevPage/nextPage/firstPage/lastPage/renderPagination, PAGINATION_POSITIONS 常量 | — | currentPage/totalPages/totalRecords/pageSize/showFirstLast/showPageInfo |
| **CrudAbility** | crudButtons (getter), showButton/hideButton/toggleButton/isButtonVisible/renderCrud, CRUD_POSITIONS 常量 | — | show*/按钮配置 |
| **ComponentEventBusAbility** | componentEvents (getter/setter), initComponentEvents/destroyComponentEvents, __initProps 自动延迟绑定 | — | componentEvents |

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

框架提供全局单例容器，用于挂载特殊组件：

| 容器 | DOM ID | 可见性 | 用途 |
|---|---|---|---|
| **OverlayRoot** | `#q-overlay-root` | 可见，`pointer-events: none` | 挂载浮层组件（Dialog、Tooltip、Notification 等） |

### OverlayRoot

```js
const overlayRoot = OverlayRoot.getInstance();

// 获取浮层容器（Dialog 的 OverlayAbility 内部使用）
const el = overlayRoot.getRoot();

// 挂载组件元素到浮层容器
overlayRoot.mountOverlay(componentEl);

// 卸载组件元素
overlayRoot.unmountOverlay(componentEl);
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
{ type: ComponentTypes.NUMBER_COLUMN, field: 'amount', label: '金额', format: 'currency' }
{ type: ComponentTypes.NUMBER_COLUMN, field: 'rate', label: '比率', format: 'percent' }
```

#### IdColumn

```js
{ type: ComponentTypes.ID_COLUMN, field: 'id', label: 'ID' }              // 默认隐藏
{ type: ComponentTypes.ID_COLUMN, field: 'id', label: 'ID', hidden: false } // 强制显示
```

#### CheckboxColumn

```js
{ type: ComponentTypes.CHECKBOX_COLUMN, field: '_selected', label: '' }
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

## 工具栏体系

工具栏功能全部通过能力注入，任何组件都可以复用。要添加新功能，写新能力即可。

### 能力组合

| 组合 | 效果 |
|---|---|
| ToolbarAbility | 基础工具栏：位置排序、按位置插入/移除/显隐 |
| ToolbarAbility + PaginationAbility | 分页工具栏 |
| ToolbarAbility + CrudAbility | CRUD 工具栏 |
| ToolbarAbility + PaginationAbility + CrudAbility | 完整功能工具栏 |
| ToolbarAbility + 自定义 Ability | 任意扩展 |

### ToolbarAbility 位置排序

```js
// 插入到指定位置
toolbar.insertAt(15, myButton);   // 在 10 和 20 之间
toolbar.insertBeforeItem(refBtn, newBtn);  // 在某组件前
toolbar.insertAfterItem(refBtn, newBtn);   // 在某组件后

// 按 position 操作
toolbar.hideAtPosition(20);       // 隐藏 position=20 的组件
toolbar.showAtPosition(20);       // 显示
toolbar.removeAtPosition(20);     // 移除
toolbar.getAtPosition(20);        // 获取

// 重新排序
toolbar.reorder();                // 按 position 重排 DOM
```

### PaginationAbility 分页

```js
// 布局定义
{ type: ComponentTypes.TOOLBAR, currentPage: 1, totalPages: 10, totalRecords: 95, pageSize: 10 }

// 运行时
toolbar.gotoPage(3);
toolbar.nextPage();
toolbar.prevPage();
```

| 位置常量 | 值 | 说明 |
|---|---|---|
| PAGINATION_POSITIONS.FIRST | 610 | 首页 |
| PAGINATION_POSITIONS.PREV | 620 | 上一页 |
| PAGINATION_POSITIONS.PAGES | 630 | 页码区 |
| PAGINATION_POSITIONS.NEXT | 640 | 下一页 |
| PAGINATION_POSITIONS.LAST | 650 | 末页 |
| PAGINATION_POSITIONS.INFO | 660 | 页码信息 |

事件：`pagechange`

### CrudAbility CRUD 操作

```js
// 布局定义
{ type: ComponentTypes.TOOLBAR, showCreate: true, showDelete: true, showExport: true }

// 运行时
toolbar.showButton('import');
toolbar.hideButton('delete');
toolbar.toggleButton('save');
```

| 位置常量 | 值 | 说明 |
|---|---|---|
| CRUD_POSITIONS.CREATE | 10 | 新建 |
| CRUD_POSITIONS.EDIT | 20 | 编辑 |
| CRUD_POSITIONS.DELETE | 30 | 删除 |
| CRUD_POSITIONS.REFRESH | 40 | 刷新 |
| CRUD_POSITIONS.IMPORT | 50 | 导入 |
| CRUD_POSITIONS.EXPORT | 60 | 导出 |
| CRUD_POSITIONS.SAVE | 70 | 保存 |

事件：`crudaction`（{ action: 'create' | 'edit' | 'delete' | ... }）

### 自定义工具栏示例

```typescript
// 只需写新能力，不用改组件代码
const FilterAbility: AbilityDefinition = {
    filterText: { get() { ... }, set(v) { ... } },
    renderFilter() { ... },
    __initProps(props) { ... },
};

// 组合使用
class MyToolbar extends ComponentBase {
    static abilities = [
        LayoutAbility, ChildrenAbility, ToolbarAbility,
        CrudAbility, PaginationAbility, FilterAbility,
    ];
}
```

## 事件桥接（ComponentEventBusAbility）

所有组件自动拥有此能力（BASE_ABILITIES）。声明式配置事件源，自动创建监听，组件 dispose 时通过 onCleanup 自动销毁。

### 核心思路

```
Toolbar (发事件)  ──pagechange/crudaction──>  Table (声明 eventBridge)
```

- 工具栏：PaginationAbility 发 `pagechange`，CrudAbility 发 `crudaction`
- 数据组件：声明 `eventBridge: { pagination: { source: 'toolbarId' }, crud: { source: 'toolbarId' } }`
- ComponentEventBusAbility：自动查找源组件，创建事件监听，调用目标组件的 `onPageChange`/`onCreate`/`onDelete` 等方法
- 自动销毁：通过 `onCleanup` 注册 off 函数，组件 dispose 时自动解绑

### 布局定义

```js
// 工具栏
{ type: ComponentTypes.TOOLBAR, id: 'myToolbar',
  showCreate: true, showDelete: true, showRefresh: true,
  currentPage: 1, totalPages: 10, totalRecords: 95 }

// 表格 - 完整配置
{ type: ComponentTypes.TABLE, id: 'myTable',
  eventBridge: {
    pagination: { source: 'myToolbar' },
    crud: { source: 'myToolbar', actions: ['create', 'delete', 'refresh'] }
  }
}

// 字符串简写
{ type: ComponentTypes.TABLE, eventBridge: { pagination: 'myToolbar', crud: 'myToolbar' } }
```

### CRUD action 过滤

```js
// 只监听指定的 action
crud: { source: 'toolbar1', actions: ['create', 'delete'] }

// 不指定 actions 则监听所有
crud: { source: 'toolbar1' }
```

### 自定义桥接

```js
eventBridge: {
  // 内置桥接
  pagination: 'toolbar1',
  crud: { source: 'toolbar2', actions: ['save'] },
  // 自定义桥接：Grid 选择
  selection: { source: 'myGrid', event: 'selectionchange', handler: 'onSelectionChange' },
  // 自定义桥接：过滤
  filter: { source: 'filterBar', event: 'filterchange' }
}
```

### 默认处理方法

TableComponent 和 FormComponent 已内置默认处理方法：

| 方法 | 触发条件 | TableComponent | FormComponent |
|---|---|---|---|
| onPageChange | pagechange 事件 | mgr.loadPage() + emit | — |
| onCreate | crudaction(create) | emit('table:create') | emit('form:create') |
| onEdit | crudaction(edit) | emit('table:edit') | emit('form:edit') |
| onDelete | crudaction(delete) | emit('table:delete') | emit('form:delete') |
| onRefresh | crudaction(refresh) | mgr.reload() + 重新渲染 | mgr.reload() |
| onImport | crudaction(import) | emit('table:import') | — |
| onExport | crudaction(export) | emit('table:export') | — |
| onSave | crudaction(save) | emit('table:save') | submit() + emit |

### 自动销毁机制

```
组件 dispose()
  └── ComposableBase.dispose()
       ├── 1. cleanups 逆序执行
       │    ├── scope.dispose() → EventScope 自动解绑所有事件
       │    ├── onCleanup(off) → ComponentEventBus 注册的 off 函数自动调用
       │    └── ... 其他清理
       ├── 2. debounce cancel
       └── 3. abilityStates.clear()
```

ComponentEventBusAbility 通过 `onCleanup(off)` 注册源组件的 off 函数，组件 dispose 时自动解绑，无需手动清理。

### 时序保证

ComponentEventBusAbility 使用 `queueMicrotask` 延迟绑定，确保同一轮 mount 的所有组件都注册到 ComponentManager 后再查找源组件。
