/**
 * ColumnDef 类型定义 — 表格列定义的完整类型系统
 *
 * 本文件是 ColumnDef 相关所有类型的唯一定义源。
 *
 * ══════════════════════════════════════════════════════════════
 * 核心设计原则
 * ══════════════════════════════════════════════════════════════
 *
 * 1. 列定义 → 行模板编译（一次编译，多行复用）
 *    ColumnDef[] → ColumnCompiler.compile() → rowTpl + headerConfigs + columnMetas
 *    编译只发生一次，之后每行 cloneNode + update(data) 填数据。
 *
 * 2. 全组件化：cellType 决定单元格组件类型
 *    所有单元格都是组件，统一 update() 接口。
 *    row.update(data) → 遍历 cells → cell.update(cellData)，零分支。
 *
 *    text     → TextCellComponent      （纯文本展示 + format）
 *    tree     → TreeCellComponent      （缩进 + 展开/折叠 + 文本）
 *    checkbox → CheckboxCellComponent   （复选框）
 *    action   → ActionCellComponent     （操作按钮组）
 *
 * 3. 编译时 vs 运行时
 *    align   → 编译时写入 cell initConfig（cell 内部 _applyState 应用）
 *    format  → 编译时写入 cell initConfig（TextCell.update() 内应用）
 *    indent  → TreeCell.update() 内部通过 indentStyle() 设置
 *
 * 4. 统一 update 链路
 *    table.setItems(rows) → row.update(rowData) → cell.update(cellData)
 *    每一层只关心自己的数据，不关心子层内部实现。
 *
 * ══════════════════════════════════════════════════════════════
 * 列定义 → 行模板编译示例
 * ══════════════════════════════════════════════════════════════
 *
 * @example
 * ```ts
 * const columns: ColumnDef[] = [
 *     { name: 'check',  cellType: 'checkbox', width: 40, align: 'center' },
 *     { name: 'dept',   cellType: 'tree',     field: 'name', title: '部门' },
 *     { name: 'count',  field: 'employeeCount', title: '人数', align: 'right', format: 'number' },
 *     { name: 'action', cellType: 'action',   width: 120, align: 'center' },
 * ];
 *
 * const result = ColumnCompiler.compile(columns);
 * // result.rowTpl → body 行的 TplNode（传给 TableEngine.compile 产出组件类）
 * // result.headerCellConfigs → 表头单元格数据（传给 HeaderRow 的 setItems）
 * // result.columnMetas → 运行时列元数据（row.update() 消费）
 * ```
 *
 * ══════════════════════════════════════════════════════════════
 * row.update() 统一链路
 * ══════════════════════════════════════════════════════════════
 *
 * row.update() 不关心 cell 内部实现，统一调用 cell.update()：
 *
 *   row.update(rowData) {
 *       for (const meta of this._columnMetas) {
 *           const cell = this.nodeMap[meta.name].component;
 *           cell.update(this._getCellData(meta, rowData));
 *       }
 *   }
 *
 * 各 CellComponent 的 update 接口：
 *   TextCell.update({ value, format })       → 格式化 + 设置文本
 *   TreeCell.update({ value, depth, leaf })   → 缩进 + 图标 + 文本
 *   CheckboxCell.update({ checked, disabled })→ 设置选中状态
 *   ActionCell.update({ actions })            → 更新按钮组
 *
 * ══════════════════════════════════════════════════════════════
 * cellType → TplNode 映射
 * ══════════════════════════════════════════════════════════════
 *
 * ColumnCompiler 为每个列生成 type 节点（组件），不是 tag 节点（HTML）：
 *
 * | cellType  | 生成的 TplNode                                              |
 * |-----------|-------------------------------------------------------------|
 * | text      | { type:'TextCell', name:'{name}', initConfig:{...} }       |
 * | tree      | { type:'TreeCell', name:'{name}', initConfig:{...} }       |
 * | checkbox  | { type:'CheckboxCell', name:'{name}', initConfig:{...} }   |
 * | action    | { type:'ActionCell', name:'{name}', initConfig:{...} }     |
 * | cellTpl   | 用户提供的 TplNode（直接使用，忽略 cellType）               |
 *
 * initConfig 传入编译时已知的静态配置（align、format、width 等），
 * 运行时 update() 传入动态数据（value、depth、checked 等）。
 *
 * ══════════════════════════════════════════════════════════════
 * nodeMap 命名约定
 * ══════════════════════════════════════════════════════════════
 *
 * 列的 name 即为 nodeMap key，直接访问 cell 组件实例：
 *
 *   this.nodeMap.{name}         → CellComponent 实例（通过 .component 访问）
 *   this.nodeMap.{name}.component.update(data)  → 统一更新
 *
 * CellComponent 内部的子节点命名由各 CellComponent 自行定义，
 * row 层不直接访问 cell 内部子节点，只通过 update() 接口通信。
 *
 * ══════════════════════════════════════════════════════════════
 * CSS 变量约定
 * ══════════════════════════════════════════════════════════════
 *
 * 列宽通过 CSS 变量同步 header 和 body：
 *   --q-table-col-{name}-width: 200px
 *
 * 表头单元格和 body 单元格都引用此变量，
 * resize 时只需更新 table root 上的变量值即可全局同步。
 */

import type { TplNode } from '../../component-core/types/tpl-node-types';

// ══════════════════════════════════════════════════════════════
// 单元格类型
// ══════════════════════════════════════════════════════════════

/**
 * 单元格类型 — 决定 CellComponent 类型和 update() 接口
 *
 * 所有 cellType 都映射到组件，统一 update() 接口。
 * row.update() 不需要分支，直接遍历 cell.update()。
 *
 * - text:     纯文本展示 + format 支持。默认类型。
 * - tree:     树形缩进展示，含展开/折叠图标 + 缩进。
 *             缩进在 TreeCell.update() 内通过 indentStyle() 设置。
 * - checkbox: 复选框，选中/禁用状态。
 * - action:   操作按钮组，使用 ButtonGroupComponent。
 */
export type CellType = 'text' | 'tree' | 'checkbox' | 'action';

// ══════════════════════════════════════════════════════════════
// 编辑类型
// ══════════════════════════════════════════════════════════════

/**
 * 编辑类型 — 决定 EditOverlay 中的编辑器组件
 *
 * | editType  | 编辑器                | 说明               |
 * |-----------|-----------------------|--------------------|
 * | text      | input[type=text]      | 默认，纯文本       |
 * | number    | input[type=number]    | 数字输入           |
 * | date      | input[type=date]      | 日期选择（v1原生） |
 * | select    | SelectComponent       | 下拉选择，需定义   |
 * | custom    | 指定 editComponent    | 自定义编辑器组件   |
 */
export type EditType = 'text' | 'number' | 'date' | 'select' | 'custom';

// ══════════════════════════════════════════════════════════════
// 聚合类型
// ══════════════════════════════════════════════════════════════

/**
 * 聚合类型 — 分组统计行和整表统计行的聚合函数
 *
 * | aggregator | 说明           | 适用数据类型       |
 * |------------|---------------|-------------------|
 * | sum        | 求和           | number            |
 * | count      | 计数           | any               |
 * | avg        | 平均值         | number            |
 * | min        | 最小值         | number / date     |
 * | max        | 最大值         | number / date     |
 * | label      | 显示分组标签    | text（分组首列）   |
 */
export type AggregatorType = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'label';

// ══════════════════════════════════════════════════════════════
// 对齐方式
// ══════════════════════════════════════════════════════════════

/**
 * 列对齐方式 — 编译时写入 cell initConfig
 *
 * - left:   左对齐（默认），适用于文本、树形列
 * - center: 居中对齐，适用于复选框、操作列、ID 列
 * - right:  右对齐，适用于数字、金额、百分比列
 */
export type ColumnAlign = 'left' | 'center' | 'right';

// ══════════════════════════════════════════════════════════════
// 排序方向
// ══════════════════════════════════════════════════════════════

/**
 * 排序方向 — 表头排序状态
 */
export type SortDirection = 'asc' | 'desc';

// ══════════════════════════════════════════════════════════════
// 格式化
// ══════════════════════════════════════════════════════════════

/**
 * 格式化预设名 — 映射到 i18n 格式化方法
 *
 * | 预设名    | 映射方法                  | 示例              |
 * |-----------|---------------------------|-------------------|
 * | number    | i18n.formatNumber()       | 12345.67          |
 * | integer   | i18n.formatNumber({decimalDigits:0}) | 12345   |
 * | currency  | i18n.formatCurrency()     | ¥12,345.67        |
 * | percent   | i18n.formatNumber() + '%' | 85.5%             |
 * | date      | i18n.formatDate()         | 2025-01-15        |
 */
export type FormatPreset = 'number' | 'integer' | 'currency' | 'percent' | 'date';

/**
 * 列格式化 — 预设名或自定义函数
 *
 * 编译时写入 cell initConfig，运行时由 TextCell.update() 内应用。
 * 预设名映射到 i18n 格式化方法，自定义函数接收 (value, row) 返回字符串。
 *
 * @example
 * ```ts
 * // 预设
 * format: 'number'
 * format: 'currency'
 *
 * // 自定义
 * format: (v) => v ? '是' : '否'
 * format: (v, row) => `${row.lastName}${row.firstName}`
 * ```
 */
export type ColumnFormat = FormatPreset | ((value: any, row: any) => string);

// ══════════════════════════════════════════════════════════════
// 固定列
// ══════════════════════════════════════════════════════════════

/**
 * 固定列位置 — 列固定在表格左侧或右侧
 *
 * 固定列通过 position: sticky + z-index 实现，
 * 不参与水平滚动。v1 仅支持首列左侧固定和末列右侧固定。
 */
export type ColumnFixed = 'left' | 'right';

// ══════════════════════════════════════════════════════════════
// Cell update 数据接口
// ══════════════════════════════════════════════════════════════

/**
 * TextCell update 数据
 *
 * @example
 * ```ts
 * cell.update({ value: '张三' });
 * cell.update({ value: 12345.67, format: 'currency' });
 * ```
 */
export interface TextCellData {
    /** 显示值（已格式化或原始值） */
    value: any;
}

/**
 * TreeCell update 数据
 *
 * @example
 * ```ts
 * cell.update({ value: '技术部', depth: 2, leaf: false, expanded: true });
 * ```
 */
export interface TreeCellData {
    /** 显示值 */
    value: any;
    /** 树深度（用于计算缩进） */
    depth: number;
    /** 是否叶节点（叶节点不显示展开图标） */
    leaf: boolean;
    /** 是否已展开 */
    expanded?: boolean;
}

/**
 * CheckboxCell update 数据
 *
 * @example
 * ```ts
 * cell.update({ checked: true, disabled: false });
 * ```
 */
export interface CheckboxCellData {
    /** 是否选中 */
    checked: boolean;
    /** 是否禁用 */
    disabled?: boolean;
}

/**
 * ActionCell update 数据
 *
 * @example
 * ```ts
 * cell.update({ actions: [
 *     { type: 'Button', text: '编辑', events: { click: 'onEdit' } },
 *     { type: 'Button', text: '删除', events: { click: 'onDelete' } },
 * ] });
 * ```
 */
export interface ActionCellData {
    /** 操作按钮配置数组，传给 ButtonGroupComponent.setItems() */
    actions: Record<string, any>[];
}

/**
 * 单元格 update 数据 — 按 cellType 区分
 */
export type CellData = TextCellData | TreeCellData | CheckboxCellData | ActionCellData;

// ══════════════════════════════════════════════════════════════
// 列定义
// ══════════════════════════════════════════════════════════════

/**
 * 列定义 — 描述表格列的结构和行为
 *
 * ColumnDef 是列的声明式定义，编译时产出行模板和列元数据，
 * 运行时由行组件的 update() 方法消费列元数据格式化单元格。
 *
 * @example
 * ```ts
 * // 基础文本列
 * { name: 'name', field: 'name', title: '姓名' }
 *
 * // 数字列（右对齐 + 格式化）
 * { name: 'salary', field: 'salary', title: '薪资', align: 'right', format: 'currency' }
 *
 * // 树形列（首列，带缩进和展开/折叠）
 * { name: 'dept', cellType: 'tree', field: 'name', title: '部门', width: 240 }
 *
 * // 复选框列
 * { name: 'check', cellType: 'checkbox', width: 40, align: 'center' }
 *
 * // 操作列
 * { name: 'action', cellType: 'action', width: 120, align: 'center' }
 *
 * // 自定义单元格组件
 * { name: 'status', title: '状态', cellTpl: {
 *     type: 'StatusCell', name: 'status', initConfig: { align: 'center' }
 * }}
 * ```
 */
export interface ColumnDef {
    // ─── identity: 列标识 ───

    /**
     * 列名 — 唯一标识
     *
     * 用途：
     * - nodeMap key（如 name='dept' → nodeMap.dept.component.update()）
     * - CSS 变量名（如 --q-table-col-dept-width）
     * - 数据字段 fallback（未指定 field 时，用 name 取值）
     */
    name: string;

    /**
     * 数据字段路径 — 从行数据中取值的路径
     *
     * 支持点号嵌套访问（如 'address.city'）。
     * 未指定时 fallback 到 name。
     */
    field?: string;

    /**
     * 表头文本 — 支持直接文本或 i18n key
     *
     * 编译时写入 headerCell 的 title 节点。
     * i18n key 在运行时通过 i18n 系统翻译。
     */
    title?: string;

    // ─── style: 列样式 ───

    /**
     * 列宽 — 数字自动加 px，字符串直接使用
     *
     * @example
     * width: 200       → '200px'
     * width: '1fr'     → '1fr'
     * width: 'auto'    → 'auto'
     *
     * 编译时写入 CSS 变量 --q-table-col-{name}-width。
     */
    width?: string | number;

    /**
     * 最小列宽 — 限制 resize 的下界
     */
    minWidth?: number;

    /**
     * 最大列宽 — 限制 resize 的上界
     */
    maxWidth?: number;

    /**
     * 文本对齐 — 编译时写入 cell initConfig
     *
     * 默认 'left'。不同 cellType 的推荐默认值：
     * - text / tree: left
     * - checkbox / action: center
     * - 数字列（format: number/currency/percent）: right
     */
    align?: ColumnAlign;

    // ─── cell: 单元格 ───

    /**
     * 单元格类型 — 决定 CellComponent 类型和 update() 接口
     *
     * 默认 'text'。所有 cellType 都映射到组件，统一 update() 接口：
     *
     * | cellType  | 组件类型              | update 接口                      |
     * |-----------|-----------------------|----------------------------------|
     * | text      | TextCellComponent     | update({ value, format? })       |
     * | tree      | TreeCellComponent     | update({ value, depth, leaf })   |
     * | checkbox  | CheckboxCellComponent | update({ checked, disabled? })   |
     * | action    | ActionCellComponent   | update({ actions })              |
     *
     * ColumnCompiler 生成的 TplNode：
     *   { type: '{CellType}Cell', name: '{name}', initConfig: { align, format, ... } }
     */
    cellType?: CellType;

    /**
     * 格式化 — 预设名或自定义函数
     *
     * 编译时写入 cell initConfig，运行时由 TextCell.update() 内应用。
     * 预设名映射到 i18n 格式化方法（formatNumber/formatCurrency/formatDate）。
     *
     * @example
     * format: 'number'                          // 预设：数字格式化
     * format: 'currency'                        // 预设：货币格式化
     * format: (v) => v ? '✓' : '—'             // 自定义：布尔值映射
     * format: (v) => new Date(v).toLocaleDateString() // 自定义：日期
     */
    format?: ColumnFormat;

    /**
     * 自定义单元格模板 — 完全替换 cellType 默认生成的节点
     *
     * 提供时忽略 cellType，直接使用此 TplNode 作为单元格节点。
     * 自定义 CellComponent 必须实现 update(cellData) 接口，
     * 确保 row.update() 可以统一调用。
     *
     * @example
     * ```ts
     * cellTpl: {
     *     type: 'StatusCell', name: 'status', initConfig: { align: 'center' }
     * }
     * ```
     */
    cellTpl?: TplNode;

    /**
     * 自定义表头单元格模板 — 完全替换默认生成的表头节点
     *
     * 提供时忽略默认的 title + sortIcon + resizeHandle 结构，
     * 直接使用此 TplNode 作为表头单元格节点。
     */
    headerTpl?: TplNode;

    // ─── state: 列状态 ───

    /**
     * 是否可排序 — 默认 false
     *
     * 为 true 时表头单元格显示排序图标，点击切换 asc/desc。
     */
    sortable?: boolean;

    /**
     * 是否可调整列宽 — 默认 true
     *
     * 为 true 时表头单元格右侧显示 resize 手柄，
     * 拖拽时更新 --q-table-col-{name}-width CSS 变量。
     */
    resizable?: boolean;

    /**
     * 初始隐藏状态 — 默认 false（可见）
     *
     * 隐藏的列不参与行模板编译，不占 DOM。
     * 运行时通过 table.showColumn(name) / table.hideColumn(name) 切换。
     */
    hidden?: boolean;

    /**
     * 固定列位置 — 列固定在表格左侧或右侧
     *
     * 固定列通过 position: sticky 实现，不参与水平滚动。
     */
    fixed?: ColumnFixed;

    // ─── edit: 内联编辑 ───

    /**
     * 是否可编辑 — 默认 false
     *
     * 为 true 时，双击/点击单元格可进入内联编辑模式，
     * EditOverlay 浮动层显示对应编辑器。
     */
    editable?: boolean;

    /**
     * 编辑类型 — 决定 EditOverlay 中的编辑器组件，默认 'text'
     *
     * 仅在 editable: true 时生效。
     */
    editType?: EditType;

    /**
     * 自定义编辑器组件类型 — editType 为 'custom' 时必填
     *
     * 指向已注册的组件类型名，TableEngine 编译编辑浮层时嵌入该组件。
     */
    editComponent?: string;

    // ─── summary: 统计聚合 ───

    /**
     * 分组统计聚合函数 — 分组统计行中该列的聚合方式
     *
     * 未指定时该列在分组统计行中显示为空。
     * 'label' 用于分组首列，显示分组标签文本。
     */
    groupAggregator?: AggregatorType;

    /**
     * 整表统计聚合函数 — 整表统计行中该列的聚合方式
     *
     * 未指定时该列在整表统计行中显示为空。
     */
    tableAggregator?: AggregatorType;
}

// ══════════════════════════════════════════════════════════════
// 编译产物：列元数据（运行时）
// ══════════════════════════════════════════════════════════════

/**
 * 列元数据 — 编译时从 ColumnDef 提取，运行时由各引擎消费
 *
 * ColumnMetaManager 管理此数据，提供按需查询。
 * row.update() 遍历 columnMetas，为每个 cell 构造 CellData 并调用 cell.update()。
 * TableEngine 编译时按需筛选（editable / groupAggregator / tableAggregator）。
 */
export interface ColumnMeta {
    /** 列名 — 唯一标识，也是 nodeMap key */
    name: string;

    /** 数据字段路径（已解析，未指定 field 时 fallback 到 name） */
    field: string;

    /** 表头文本 */
    title?: string;

    /** 单元格类型（默认 'text'） */
    cellType: CellType;

    /** 格式化（预设名或自定义函数），TextCell.update() 内使用 */
    format?: ColumnFormat;

    /** 文本对齐（已解析的最终值，考虑 cellType 默认值） */
    align: ColumnAlign;

    /** 解析后的列宽字符串 */
    width?: string;

    /** 最小列宽 */
    minWidth?: number;

    /** 最大列宽 */
    maxWidth?: number;

    /** 是否隐藏 */
    hidden: boolean;

    /** 固定列位置 */
    fixed?: ColumnFixed;

    /** 是否可排序 */
    sortable: boolean;

    /** 是否可调整列宽 */
    resizable: boolean;

    /** 是否可编辑 */
    editable: boolean;

    /** 编辑类型（仅 editable 时有效） */
    editType: EditType;

    /** 自定义编辑器组件类型（仅 editType='custom' 时有效） */
    editComponent?: string;

    /** 分组统计聚合函数 */
    groupAggregator?: AggregatorType;

    /** 整表统计聚合函数 */
    tableAggregator?: AggregatorType;

    /** 自定义单元格模板 */
    cellTpl?: TplNode;

    /** 自定义表头单元格模板 */
    headerTpl?: TplNode;
}

// ══════════════════════════════════════════════════════════════
// 列分组（多表头）
// ══════════════════════════════════════════════════════════════

/**
 * 列分组定义 — 多表头的分组节点
 *
 * GroupHeaderCell 渲染为带标题的容器，children 区域放子表头。
 * 支持递归嵌套：children 中可再包含 ColumnGroupDef。
 *
 * @example
 * ```ts
 * { name: 'baseInfo', title: '基本信息', children: [
 *     { name: 'name', field: 'name', title: '姓名' },
 *     { name: 'age',  field: 'age',  title: '年龄' },
 * ]}
 * ```
 */
export interface ColumnGroupDef {
    name: string;
    title?: string;
    children: ColumnDefOrGroup[];
}

/**
 * 列定义或分组 — ColumnCompiler.compile() 的输入项
 */
export type ColumnDefOrGroup = ColumnDef | ColumnGroupDef;

// ══════════════════════════════════════════════════════════════
// 编译产物：表头单元格配置
// ══════════════════════════════════════════════════════════════

/**
 * 表头单元格配置 — 传给 HeaderRow setItems() 的 item 数据
 *
 * 每个 HeaderCellComponent 实例接收此配置作为 props。
 */
export interface HeaderCellConfig {
    /** 列名 */
    name: string;

    /** 表头文本（i18n key 或直接文本） */
    title?: string;

    /** 列宽 CSS 变量引用 */
    widthVar: string;

    /** 是否可排序 */
    sortable: boolean;

    /** 是否可调整列宽 */
    resizable: boolean;

    /** 对齐方式 */
    align: ColumnAlign;

    /** 自定义表头模板 */
    headerTpl?: TplNode;
}

/**
 * 分组表头单元格配置 — 多表头的分组节点
 *
 * GroupHeaderCellComponent 接收此配置，children 区域递归创建子表头。
 */
export interface GroupHeaderCellConfig {
    /** 分组名 */
    name: string;

    /** 分组标题 */
    title?: string;

    /** 子列名列表（用于 calc() 计算宽度） */
    childNames: string[];

    /** 子表头配置（递归） */
    children: HeaderCellConfigOrGroup[];
}

/**
 * 表头单元格配置或分组
 */
export type HeaderCellConfigOrGroup = HeaderCellConfig | GroupHeaderCellConfig;

// ══════════════════════════════════════════════════════════════
// 编译产物：完整编译结果
// ══════════════════════════════════════════════════════════════

/**
 * 列编译结果 — ColumnCompiler.compile() 的返回值
 *
 * @example
 * ```ts
 * const result = ColumnCompiler.compile(columns);
 *
 * // 1. 用 rowTpl 创建行组件类（由 TableEngine.compile 内部完成）
 * //    const RowClass = class extends RowComponent { _columnMetas = visibleMetas; };
 * //    RowClass.useTemplate(result.rowTpl);
 *
 * // 2. 用 headerCellConfigs 初始化表头
 * headerRow.setItems(result.headerCellConfigs);
 *
 * // 3. columnMetas 挂在行组件上，row.update() 遍历调用 cell.update()
 * // row.update(data) {
 * //     for (const meta of this._columnMetas) {
 * //         const cell = this.nodeMap[meta.name].component;
 * //         cell.update(this._getCellData(meta, data));
 * //     }
 * // }
 * ```
 */
export interface ColumnCompileResult {
    /** body 行模板 — 传给 TableEngine.compile 产出组件类的 tpl */
    rowTpl: TplNode;

    /** 表头单元格配置（支持多表头，递归结构） */
    headerCellConfigs: HeaderCellConfigOrGroup[];

    /** 列元数据数组 — 运行时由 row.update() 消费（仅叶子列） */
    columnMetas: ColumnMeta[];

    /** 表头最大深度 — 用于计算叶子行跨行高度 */
    headerDepth: number;
}
