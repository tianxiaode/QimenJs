# QimenJS 组件能力索引

> 最后更新：2026-07-07
>
> 本文档记录组件层（L5）的完整结构，包括组件-能力映射、事件体系、实体管理器等。
> 每次功能变更后请更新对应章节，避免全量扫描。

---

## 1. 组件-能力映射表

### 1.1 组件继承体系

```
ComposableBase (src/composable/ComposableBase.ts)
  └── ComponentBase (src/component-core/ComponentBase.ts)
        ├── ButtonComponent
        ├── InputComponent
        ├── SelectComponent
        ├── HBoxComponent / VBoxComponent / GridComponent / SpaceComponent
        ├── ToolbarComponent
        ├── ButtonGroupComponent / SeparatorComponent
        ├── TableComponent
        ├── FormComponent
        ├── DialogComponent
        └── ColumnBase → IdColumn / NumberColumn / CheckboxColumn
```

### 1.2 组件能力组合

| 组件 | 文件 | 能力列表 |
|------|------|----------|
| ButtonComponent | `src/component/components/ButtonComponent.ts` | TextAbility, ClickAbility, DisableAbility, LoadingAbility, SizeAbility |
| InputComponent | `src/component/components/InputComponent.ts` | TextAbility, ValueAbility, ValidateAbility, PlaceholderAbility, DisableAbility, SizeAbility |
| SelectComponent | `src/component/components/SelectComponent.ts` | TextAbility, ValueAbility, OptionsAbility, SearchAbility, DisableAbility, SizeAbility |
| HBoxComponent | `src/component/components/HBoxComponent.ts` | LayoutAbility, ChildrenAbility, AnimationAbility |
| VBoxComponent | `src/component/components/VBoxComponent.ts` | LayoutAbility, ChildrenAbility, AnimationAbility |
| GridComponent | `src/component/components/GridComponent.ts` | LayoutAbility, ChildrenAbility, AnimationAbility |
| SpaceComponent | `src/component/components/SpaceComponent.ts` | LayoutAbility |
| ToolbarComponent | `src/component/components/ToolbarComponent.ts` | LayoutAbility, ChildrenAbility, AnimationAbility, ToolbarAbility, PaginationAbility, CrudAbility |
| ButtonGroupComponent | `src/component/components/ButtonGroupComponent.ts` | ChildrenAbility, SizeAbility, DisableAbility |
| SeparatorComponent | `src/component/components/SeparatorComponent.ts` | VisibleAbility |
| TableComponent | `src/component/components/TableComponent.ts` | EntityAbility, VirtualListAbility, SortAbility, ColumnAbility, ColumnManageAbility, ChildrenAbility |
| FormComponent | `src/component/components/FormComponent.ts` | EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility |
| DialogComponent | `src/component/components/DialogComponent.ts` | TextAbility, OpenableAbility, OverlayAbility, AnimationAbility |
| ColumnBase | `src/component/components/ColumnBase.ts` | TextAbility, VisibleAbility, DisableAbility, SortAbility |
| IdColumn | `src/component/components/IdColumn.ts` | 继承 ColumnBase |
| NumberColumn | `src/component/components/NumberColumn.ts` | 继承 ColumnBase |
| CheckboxColumn | `src/component/components/CheckboxColumn.ts` | 继承 ColumnBase + SelectableAbility |

### 1.3 ComponentBase 内置能力

ComponentBase 通过 BASE_ABILITIES 自动注入以下能力（所有组件都拥有）：

| 能力 | 文件 | 说明 |
|------|------|------|
| EventAbility | `src/system-abilities/system/EventAbility.ts` | 事件发布/订阅 |
| DomEventsAbility | `src/system-abilities/dom/DomEventsAbility.ts` | DOM 事件适配 |
| ThemeAbility | `src/component-core/abilities/ThemeAbility.ts` | 主题样式 |
| StyleAbility | `src/component-core/abilities/StyleAbility.ts` | 自定义样式 |
| EventBridgeAbility | `src/component-core/abilities/EventBridgeAbility.ts` | 声明式事件桥接 |

---

## 2. 能力分类索引

### 2.1 UI 能力 (`src/component-abilities/ui/`)

| 能力 | 说明 |
|------|------|
| TextAbility | 文本内容 |
| VisibleAbility | 显隐控制 |
| DisableAbility | 禁用控制 |
| LoadingAbility | 加载状态 |
| SizeAbility | 尺寸控制 |

### 2.2 数据能力 (`src/component-abilities/data/`)

| 能力 | 说明 |
|------|------|
| ValueAbility | 值管理 |
| ValidateAbility | 校验 |
| PlaceholderAbility | 占位文本 |
| SubmitAbility | 提交 |
| FieldSetAbility | 字段集 |

### 2.3 实体能力 (`src/component-abilities/entity/`)

| 能力 | 文件 | 说明 |
|------|------|------|
| EntityCoreAbility | `EntityCoreAbility.ts` | EntityManager 实例管理 + 方法代理 |
| EntityEmitAbility | `EntityEmitAbility.ts` | EntityManager 事件 → 组件事件转发 |
| EntityListenAbility | `EntityListenAbility.ts` | 组件事件 → EntityManager 操作 |
| EntityAbility | `EntityAbility.ts` | 组合导出（Core+Emit+Listen） |
| EntityLocalReadonlyAbility | `EntityLocalReadonlyAbility.ts` | 本地只读组合 |
| EntityLocalCrudAbility | `EntityLocalCrudAbility.ts` | 本地 CRUD 组合 |
| EntityRemoteReadonlyAbility | `EntityRemoteReadonlyAbility.ts` | 远程只读组合 |
| EntityRemoteCrudAbility | `EntityRemoteCrudAbility.ts` | 远程 CRUD 组合 |
| EntityRemoteTreeAbility | `EntityRemoteTreeAbility.ts` | 远程树形组合 |

### 2.4 选择能力 (`src/component-abilities/selection/`)

| 能力 | 说明 |
|------|------|
| SelectionAbility | 选择状态管理 |
| SelectableAbility | 行可选择 |

### 2.5 子组件能力 (`src/component-abilities/children/`)

| 能力 | 说明 |
|------|------|
| ChildrenAbility | 子组件管理 |

### 2.6 渲染能力 (`src/component-abilities/render/`)

| 能力 | 说明 |
|------|------|
| RenderAbility | 渲染控制 |
| VirtualListAbility | 虚拟列表 |
| OverlayAbility | 浮层 |
| AnimationAbility | 动画 |

### 2.7 交互能力 (`src/component-abilities/interaction/`)

| 能力 | 说明 |
|------|------|
| ClickAbility | 点击事件 |
| OptionsAbility | 选项列表 |
| SearchAbility | 搜索 |
| SortAbility | 排序 |
| OpenableAbility | 打开/关闭 |
| LayoutAbility | 布局 |

### 2.8 列能力 (`src/component-abilities/column/`)

| 能力 | 说明 |
|------|------|
| ColumnAbility | 列定义 |
| ColumnManageAbility | 列管理 |

### 2.9 工具栏能力 (`src/component-abilities/toolbar/`)

| 能力 | 文件 | 说明 |
|------|------|------|
| ToolbarAbility | `ToolbarAbility.ts` | 位置排序、插入/移除/显隐 |
| **PaginationAbility** | `PaginationAbility.ts` | **分页聚合层**（合并以下子能力） |
| PaginationStateAbility | `PaginationStateAbility.ts` | 分页状态管理 |
| PaginationEventsAbility | `PaginationEventsAbility.ts` | 分页事件分发 |
| PaginationNavAbility | `PaginationNavAbility.ts` | 导航按钮渲染 |
| PaginationPagesAbility | `PaginationPagesAbility.ts` | 页码按钮渲染 |
| PaginationJumperAbility | `PaginationJumperAbility.ts` | 页码输入框（新增） |
| PaginationSizerAbility | `PaginationSizerAbility.ts` | 每页条数选择器（新增） |
| PaginationInfoAbility | `PaginationInfoAbility.ts` | 分页信息展示 |
| CrudAbility | `CrudAbility.ts` | CRUD 操作按钮组 |

### 2.10 事件能力 (`src/component-abilities/event/`)

| 能力 | 说明 |
|------|------|
| EventBindingAbility | 事件绑定（已废弃，由 EventAbility + DomEventsAbility 替代） |

### 2.11 核心能力 (`src/component-core/abilities/`)

| 能力 | 文件 | 说明 |
|------|------|------|
| ThemeAbility | `ThemeAbility.ts` | 主题样式 |
| StyleAbility | `StyleAbility.ts` | 自定义样式 |
| EventBridgeAbility | `EventBridgeAbility.ts` | 声明式事件桥接 |
| PropAlias | `PropAlias.ts` | 属性别名与初始化协议 |

---

## 3. 事件体系

### 3.1 事件常量 (`src/events/component-events.ts`)

| 常量 | 事件名 | 发射方 |
|------|--------|--------|
| PAGINATION_EVENTS.CHANGE | `pagechange` | PaginationEventsAbility |
| CRUD_EVENTS.ACTION | `crudaction` | CrudAbility |
| SELECTION_EVENTS.CHANGE | `selectionchange` | SelectionAbility |
| SELECTION_EVENTS.ROW_SELECT | `rowselect` | SelectableAbility |
| CHILDREN_EVENTS.ADD | `childadd` | ChildrenAbility |
| CHILDREN_EVENTS.REMOVE | `childremove` | ChildrenAbility |
| CHILDREN_EVENTS.MOVE | `childmove` | ChildrenAbility |
| CHILDREN_EVENTS.CHANGE | `childrenchange` | ChildrenAbility |
| COLUMN_EVENTS.ADD | `columnadd` | ColumnManageAbility |
| COLUMN_EVENTS.REMOVE | `columnremove` | ColumnManageAbility |
| COLUMN_EVENTS.HIDE | `columnhide` | ColumnManageAbility |
| COLUMN_EVENTS.SHOW | `columnshow` | ColumnManageAbility |
| COLUMN_EVENTS.MOVE | `columnmove` | ColumnManageAbility |
| COLUMN_EVENTS.REPLACE | `columnreplace` | ColumnManageAbility |
| TOOLBAR_EVENTS.REORDER | `toolbarreorder` | ToolbarAbility |
| TOOLBAR_EVENTS.INSERT | `toolbarinsert` | ToolbarAbility |
| ENTITY_EVENTS.* | `entity:*` | EntityEmitAbility 转发 |

### 3.2 实体事件 (`src/events/entity-events.ts`)

| 常量 | 说明 |
|------|------|
| ENTITY_DATA_EVENTS.DATA_CHANGE | 数据变更 |
| ENTITY_CRUD_EVENTS.CREATED/UPDATED/DELETED/SAVED/TOGGLED | CRUD 结果 |
| ENTITY_LIST_EVENTS.LISTED/GOT | 列表加载 |
| ENTITY_TREE_EVENTS.EXPANDED/COLLAPSED/MOVED/CHILDREN_REFRESHED | 树操作 |
| ENTITY_REQUEST_STATUS.LOADING/SUCCESS/ERROR | 请求状态 |

### 3.3 组件事件 (`src/component/events.ts`)

| 常量 | 说明 |
|------|------|
| TABLE_EVENTS.PAGE_CHANGE | 表格分页变更 |
| TABLE_EVENTS.CREATE/EDIT/DELETE/REFRESH/IMPORT/EXPORT/SAVE | 表格 CRUD |
| TABLE_EVENTS.SELECTION_CHANGE/ROW_SELECT | 表格选择 |
| FORM_EVENTS.SAVE/CREATE/EDIT/DELETE/REFRESH | 表单操作 |

### 3.4 事件桥接 (`src/component-core/abilities/EventBridgeAbility.ts`)

内置桥接类型：

| 桥接 key | 监听事件 | 调用方法 |
|----------|----------|----------|
| pagination | PAGINATION_EVENTS.CHANGE | onPageChange |
| crud | CRUD_EVENTS.ACTION | on{Action}（如 onCreate, onEdit） |
| selection | SELECTION_EVENTS.CHANGE | onSelectionChange |
| 自定义 | 自定义 event | 自定义 handler |

---

## 4. 实体管理器

### 4.1 管理器变体 (`src/entity/manager/managers.ts`)

| 管理器 | 能力组合 | 说明 |
|--------|----------|------|
| LocalReadonlyEntityManager | FlatLocalStateAbility + LocalListAbility + LocalGetAbility | 本地只读 |
| LocalCrudEntityManager | + FlatLocalMutationAbility + FlatLocalDeleteAbility | 本地 CRUD |
| RemoteReadonlyEntityManager | SchemaProxyAbility + CacheAbility + DirtyAbility + SearchAbility + DomainPagingAbility + FlatRemoteStateAbility + FlatRemoteListAbility + FlatRemoteGetAllAbility + RemoteGetAbility + FlatRemoteQueryAbility | 远程只读（含分页） |
| RemoteCrudEntityManager | + RemoteCreateAbility + RemoteUpdateAbility + RemoteDeleteAbility + RemoteToggleAbility | 远程 CRUD（含分页） |
| RemoteTreeEntityManager | + TreePathAbility + TreeLifecycleAbility + TreeSearchAbility + TreeViewAbility + TreeRemoteStateAbility | 远程树形 |

### 4.2 分页相关能力

| 能力 | 文件 | 说明 |
|------|------|------|
| DomainPagingAbility | `src/entity/manager/managers.ts` | 从 DomainConfig 读取 pageSize/pageSizes |
| FlatRemoteQueryAbility | `src/entity/abilities/remote/FlatRemoteQueryAbility.ts` | prev/next/jump/changeSize/filter/sort/reset |
| FlatRemoteStateAbility | `src/entity/abilities/remote/FlatRemoteStateAbility.ts` | updateData/isValidPage/deleteFromItems |

---

## 5. 分页能力详细设计

> 2026-07-07 重构：从单体 PaginationAbility 拆分为 7 个子能力

### 5.1 架构

```
PaginationAbility（聚合层，单个 AbilityDefinition）
  ├── PaginationStateAbility    — 状态管理
  ├── PaginationEventsAbility   — 事件分发
  ├── PaginationNavAbility      — 导航按钮
  ├── PaginationPagesAbility    — 页码按钮
  ├── PaginationJumperAbility   — 页码输入框（新增）
  ├── PaginationSizerAbility    — 每页条数选择器（新增）
  └── PaginationInfoAbility     — 分页信息
```

### 5.2 位置常量 (`src/component-abilities/toolbar/pagination-positions.ts`)

| 常量 | 值 | 说明 |
|------|-----|------|
| FIRST | 610 | 首页按钮 |
| PREV | 620 | 上一页按钮 |
| PAGES | 630 | 页码区域 |
| JUMPER | 635 | 页码输入框 |
| NEXT | 640 | 下一页按钮 |
| LAST | 650 | 末页按钮 |
| SIZER | 655 | 每页条数选择器 |
| INFO | 660 | 分页信息 |

### 5.3 状态属性

| 属性 | 默认值 | abilityState 键名 |
|------|--------|-------------------|
| currentPage | 1 | PaginationAbility:currentPage |
| totalPages | 1 | PaginationAbility:totalPages |
| totalRecords | 0 | PaginationAbility:totalRecords |
| pageSize | 10 | PaginationAbility:pageSize |
| pageSizes | [10,20,50] | PaginationAbility:pageSizes |
| showFirstLast | true | PaginationAbility:showFirstLast |
| showPageInfo | true | PaginationAbility:showPageInfo |
| showJumper | false | PaginationAbility:showJumper |
| showSizer | false | PaginationAbility:showSizer |
| pageRange | 2 | PaginationAbility:pageRange |

### 5.4 事件流

```
用户操作 → PaginationEventsAbility.gotoPage/changeSize
         → 更新状态（PaginationStateAbility）
         → 发射 PAGINATION_EVENTS.CHANGE {page, pageSize}
         → EventBridgeAbility 桥接
         → EntityListenAbility 监听
         → EntityManager.jump/changeSize/loadPage
         → EntityEmitAbility 转发 entity:listed
         → PaginationStateAbility 同步分页状态
```

---

## 6. 渲染管线

### 6.1 Renderer Pipeline (`src/renderer/Renderer.ts`)

12 个内置处理器按权重排序：

| 权重 | 处理器 | 说明 |
|------|--------|------|
| 100 | CREATE | 创建组件实例 |
| 200 | TEMPLATE | 应用 HTML 模板 |
| 300 | INJECT | 注入依赖 |
| 400 | BIND_SCHEMA | 绑定 Schema |
| 500 | BIND_HANDLER | 绑定事件处理器 |
| 600 | BIND_DATASOURCE | 绑定数据源 |
| 650 | BIND_ENTITY_HOOKS | 绑定实体钩子 |
| 700 | BIND_CHILDREN | 绑定子组件 |
| 800 | BIND_SLOTS | 绑定插槽 |
| 900 | BIND_REPEAT | 绑定循环渲染 |
| 950 | BIND_I18N | 绑定国际化 |
| 1000 | MOUNT | 挂载到 DOM |

---

## 7. 导出链路

关键导出路径（从底层到上层）：

```
子能力文件 → toolbar/index.ts → component-abilities/index.ts → component/index.ts
```

| 导出项 | toolbar/index.ts | component-abilities/index.ts | component/index.ts |
|--------|-----------------|------------------------------|---------------------|
| PaginationAbility | ✓ | ✓ | ✓ |
| PAGINATION_POSITIONS | ✓ | ✓ | ✓ |
| PaginationStateAbility | ✓ | ✓ | - |
| PaginationEventsAbility | ✓ | ✓ | - |
| PaginationNavAbility | ✓ | ✓ | - |
| PaginationPagesAbility | ✓ | ✓ | - |
| PaginationJumperAbility | ✓ | ✓ | - |
| PaginationSizerAbility | ✓ | ✓ | - |
| PaginationInfoAbility | ✓ | ✓ | - |
| ToolbarAbility | ✓ | ✓ | ✓ |
| CrudAbility | ✓ | ✓ | ✓ |

---

## 变更日志

| 日期 | 变更内容 |
|------|----------|
| 2026-07-07 | 初始创建；记录分页能力拆分（PaginationAbility → 7 个子能力） |
