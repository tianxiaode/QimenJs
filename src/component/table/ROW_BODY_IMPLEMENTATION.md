# Table Row Body 实施跟踪

## 设计决策（已确认）

| 决策点 | 结论 |
|---|---|
| 展开列添加方式 | **自动添加** — 配置 `rowBody` 后自动在第一列插入展开/折叠切换列 |
| loader 缓存策略 | **缓存** — 加载过的数据缓存，折叠再展开不重新加载 |
| 嵌套表格递归 | **允许递归** — 子表格也可配置 rowBody，支持无限层级 |
| 虚拟滚动兼容 | **禁用 row body** — 虚拟滚动模式下不支持 row body |

## 内容类型（Container 四路统一，2026-10-19 迁移）

`rowBody.content` 与 Container 四路语义一致：

| content 形态 | 说明 |
|---|---|
| `string` | HTML（@ 前缀 i18n 求值） |
| `(rowData) => string` | HTML 求值函数 |
| `TemplateDecl` | 模板（纯 DOM 同步编译，嵌套组件请用组件配置） |
| `{ type: 'property-grid', fields, cols, excludeColumns, i18nScope }` | PropertyGrid 展示行数据/详细数据 |
| `{ type: 'table', dataField, ...tableOptions }` | 主从嵌套子表格 |
| `{ type: 任意组件类或注册名, ...props }` | 任意组件配置 |

解析统一由 `container/resolve.ts` 的 `createItemFromDef` 完成；
`excludeColumns`（fields 派生）与 `dataField`（行数据提取）由 RowBodyAbility 求值。

## 配置结构

```typescript
interface RowBodyConfig {
    content: string | ((data: any) => string) | TemplateDecl | Record<string, any>;
    loader?: (rowId: string, rowData: any) => Promise<any>;
    loadingText?: string;
    entityAction?: string;
    entityParamField?: string;
    entityKey?: string;
}
```

Table option: `rowBody: RowBodyConfig | null`

## DOM 结构

```
.q-table
  .q-table__header-area
  .q-table__body
    .q-table-row (normal row)
    .q-table-row__body (expanded body, full width)  ← 新增
    .q-table-row (next row)
    ...
```

## 事件

| 事件 | 触发时机 | 数据 |
|---|---|---|
| `rowExpand` | 行展开时 | `{ rowKey, rowData, index }` |
| `rowCollapse` | 行折叠时 | `{ rowKey, rowData, index }` |

## 实现阶段

### P1: 展开/折叠机制 + body 容器生命周期

- [ ] **ExpandCellComponent** — 新建 `src/component/table/cells/ExpandCellComponent.ts`
  - 模板：展开/折叠切换图标（▶ / ▼）
  - 点击触发 `expand` / `collapse` 事件
  - 宽度固定 36px，不可排序/拖拽/调整宽度
  - CSS：`.q-table-cell--expand` + `.q-table-cell__expand-icon` + 旋转动画
- [ ] **RowBodyAbility** — 新建 `src/component/table/abilities/RowBodyAbility.ts`
  - `_onRowBodyOptionChange` — rowBody 配置变更时处理
  - `_ensureExpandColumn` — 自动在 columnMetas 前插入展开列
  - `_onRowExpand` — 行展开：创建 body 容器 + 渲染内容
  - `_onRowCollapse` — 行折叠：销毁 body 容器
  - `_renderRowBody` — 根据 type 创建对应内容
  - `_bodyCache: Map<string, any>` — loader 缓存
  - 虚拟滚动模式下跳过 row body
- [ ] **RowComponent 改造**
  - 添加 `expand()` / `collapse()` 方法
  - body 容器 DOM 插入/移除
  - `_bodyExpanded` 状态字段
- [ ] **TableComponent 改造**
  - `rowBody` option 注册到 Definitions
  - `listens` 添加 `rowExpand` / `rowCollapse` 事件
  - `_onRowExpand` / `_onRowCollapse` handler
- [ ] **CSS** — `src/component/table/row/row.css` 添加 body 容器样式
- [ ] **注册** — `register.ts` 添加 ExpandCellComponent 注册
- [ ] **测试** — 展开/折叠基本功能验证

### P2: html/template 内容渲染

- [x] `_renderRowBody` 实现 `type: 'html'`
  - string：直接 innerHTML
  - function：调用获取 HTML 字符串
- [x] `_renderRowBody` 实现 `type: 'template'`
  - 复用 `renderSlot`（OptionAbility 的三路模式）
  - TemplateDecl 通过 `_createSlotComponent` 承载
- [ ] **测试** — html/template 内容渲染验证

### P3: property-grid + loader 异步加载

- [x] `_renderRowBody` 实现 `type: 'property-grid'`
  - 创建 PropertyGridComponent 实例（通过 ComponentRegistrar）
  - 传入 fields + cols + data（行数据合并 loader 返回的详细数据）
  - 需注册 PropertyGridComponent（showcase register.ts）
- [x] **loader 异步加载**
  - 展开时显示 loadingText
  - 调用 `loader(rowId, rowData)` 获取详细数据
  - 合并 `{ ...rowData, ...detailData }` 传给内容组件
  - 缓存到 `_bodyCache`，折叠再展开用缓存
- [ ] **测试** — property-grid + loader 验证

### P4: table 嵌套子表格 + component 自定义组件

- [x] `_renderRowBody` 实现 `type: 'table'`
  - 从行数据 `data[dataField]` 获取子表格数据
  - 创建 TableComponent 实例，传入 `tableOptions` + `data`
  - 支持递归 rowBody（子表格也可配置 rowBody）
  - loader 加载子表格数据时合并到 `data[dataField]`
- [x] `_renderRowBody` 实现 `type: 'component'`
  - `new component({ container: bodyEl })`
  - 构造后调用 `update({ data: rowData })` 传入行数据
- [ ] **测试** — 嵌套表格 + 自定义组件验证

### P5: Showcase Demo

- [x] **TableRowBodyDemo** — 新建 `examples/showcase/src/components/TableRowBodyDemo.ts`
  - property-grid 演示（行已有数据）
  - property-grid + loader 演示（异步加载详细数据）
  - html 演示（自定义内容）
- [x] **ComponentsPage** — 添加 TableRowBody 到导航和 DEMO_MAP
- [x] **register.ts** — 添加 PropertyGridComponent + PropertyFieldComponent 注册

## 关键约束

1. **虚拟滚动禁用** — `getData('virtualScroll')` 为 true 时不创建展开列，忽略 rowBody
2. **展开列自动添加** — 配置了 `rowBody` 且非虚拟滚动时，自动在 columnMetas 最前面插入展开列
3. **loader 缓存** — `_bodyCache: Map<rowKey, detailData>`，折叠再展开用缓存数据
4. **递归允许** — 子表格的 `type: 'table'` 内也可配置 `rowBody`，无限层级嵌套
5. **body 不属于 items** — body 容器是额外的 DOM 节点，不在 ItemGroup 的 items 数组中
6. **行回收时清理** — 行 dispose 时先销毁其 body 实例

## 文件清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/component/table/cells/ExpandCellComponent.ts` | 新建 | 展开/折叠切换单元格 |
| `src/component/table/abilities/RowBodyAbility.ts` | 新建 | Row Body 能力封装 |
| `src/component/table/abilities/types.ts` | 修改 | 添加 RowBody 相关 Host 接口 |
| `src/component/table/abilities/index.ts` | 修改 | 添加 RowBodyAbility 到 TABLE_ABILITIES |
| `src/component/table/TableComponent.ts` | 修改 | 添加 rowBody option + 事件监听 |
| `src/component/table/row/RowComponent.ts` | 修改 | 添加 expand/collapse 方法 |
| `src/component/table/row/row.css` | 修改 | 添加 body 容器样式 |
| `src/component/table/column-types.ts` | 修改 | 添加 'expand' CellType |
| `src/component/table/engine/ColumnMetaManager.ts` | 修改 | 处理 expand 列类型 |
| `examples/showcase/src/register.ts` | 修改 | 注册 ExpandCellComponent |
| `examples/showcase/src/components/TableRowBodyDemo.ts` | 新建 | Row Body 演示 |
| `examples/showcase/src/pages/ComponentsPage.ts` | 修改 | 添加导航项 |
