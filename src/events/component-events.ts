/**
 * 组件能力事件常量定义
 *
 * 定义组件能力层的事件，供 component 包和扩展包统一引用。
 * 与 entity-events.ts 同级，保持事件定义的集中管理。
 *
 * 分类：
 * - 组件生命周期事件：TemplateComponent 发射
 * - 分页事件：PaginationAbility 发射
 * - CRUD 事件：CrudAbility 发射
 * - 选择事件：SelectableAbility / SelectionAbility 发射
 * - 子组件事件：ChildrenAbility 发射
 * - 列管理事件：ColumnManageAbility 发射
 * - 搜索事件：SearchAbility 发射
 * - 工具栏事件：ToolbarAbility 发射
 * - 实体事件：见 entity-events.ts（EntityManager 直发，不再桥接）
 */

// ============================================
// 组件生命周期事件（TemplateComponent 发射）
// ============================================
export const COMPONENT_LIFECYCLE_EVENTS = {
    /** 组件初始化完成（onAfterInit 之后） */
    INIT: 'init',
    /** 组件挂载完成，DOM 已渲染（onMounted 之后） */
    MOUNTED: 'mounted',
    /** 组件即将卸载（onBeforeUnmount 时） */
    BEFORE_UNMOUNT: 'beforeunmount',
    /** 组件已销毁（dispose 完成后） */
    DISPOSE: 'dispose',
    /** 组件属性/内容更新后（onUpdated 之后） */
    UPDATED: 'updated',
    /** 组件尺寸变化（onResize 时） */
    RESIZE: 'resize',
    /** 组件 hidden 状态变化 */
    HIDDEN_CHANGE: 'hiddenchange',
} as const;

// ============================================
// 分页事件（PaginationAbility 发射）
// ============================================
export const PAGINATION_EVENTS = {
    /** 分页变更（页码/每页条数变化） */
    CHANGE: 'pagechange',
} as const;

// ============================================
// CRUD 事件（CrudAbility 发射）
// ============================================
export const CRUD_EVENTS = {
    /** CRUD 操作（create/edit/delete/refresh/import/export/save） */
    ACTION: 'crudaction',
} as const;

// ============================================
// CRUD action 枚举
// ============================================
export const CRUD_ACTIONS = {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    REFRESH: 'refresh',
    IMPORT: 'import',
    EXPORT: 'export',
    SAVE: 'save',
} as const;

// ============================================
// 选择事件（SelectableAbility / SelectionAbility 发射）
// ============================================
export const SELECTION_EVENTS = {
    /** 选择状态变更 */
    CHANGE: 'selectionchange',
    /** 行选中/取消 */
    ROW_SELECT: 'rowselect',
    /** 实体选择变更（SelectionAbility 在实体上下文中触发） */
    ENTITY_CHANGE: 'entity:selectionchange',
} as const;

// ============================================
// 子组件事件（ChildrenAbility 发射）
// ============================================
export const CHILDREN_EVENTS = {
    ADD: 'childadd',
    REMOVE: 'childremove',
    MOVE: 'childmove',
    CHANGE: 'childrenchange',
} as const;

// ============================================
// 列管理事件（ColumnManageAbility 发射）
// ============================================
export const COLUMN_EVENTS = {
    ADD: 'columnadd',
    REMOVE: 'columnremove',
    HIDE: 'columnhide',
    SHOW: 'columnshow',
    MOVE: 'columnmove',
    REPLACE: 'columnreplace',
} as const;

// ============================================
// 搜索事件（SearchAbility 发射）
// ============================================
export const SEARCH_EVENTS = {
    /** 搜索变更（关键词输入防抖后 / 搜索按钮点击 / 手动触发） */
    CHANGE: 'searchchange',
    /** 搜索提交（搜索按钮点击） */
    SUBMIT: 'searchsubmit',
} as const;

// ============================================
// 工具栏事件（ToolbarAbility 发射）
// ============================================
export const TOOLBAR_EVENTS = {
    REORDER: 'toolbarreorder',
    INSERT: 'toolbarinsert',
    /** 折叠状态变更 */
    COLLAPSE_CHANGE: 'toolbarcollapsechange',
    /** 按钮动作（name 为按钮名：create/edit/delete/refresh/save/import/export/upload/download/history/help） */
    ACTION: 'toolbaraction',
    /** 搜索提交 */
    SEARCH: 'toolbarsearch',
} as const;

// ============================================
// 表格事件（TableComponent 发射）
// ============================================
export const TABLE_EVENTS = {
    PAGE_CHANGE: 'table:pagechange',
    CREATE: 'table:create',
    EDIT: 'table:edit',
    DELETE: 'table:delete',
    REFRESH: 'table:refresh',
    IMPORT: 'table:import',
    EXPORT: 'table:export',
    SAVE: 'table:save',
    SELECTION_CHANGE: 'table:selectionchange',
    ROW_SELECT: 'table:rowselect',
} as const;

// ============================================
// 表单事件（FormComponent 发射）
// ============================================
export const FORM_EVENTS = {
    SAVE: 'form:save',
    CREATE: 'form:create',
    EDIT: 'form:edit',
    DELETE: 'form:delete',
    REFRESH: 'form:refresh',
} as const;
