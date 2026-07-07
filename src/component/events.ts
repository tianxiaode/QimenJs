/**
 * UI 组件事件枚举
 *
 * 规范化事件名，配合 EventBridgeAbility 使用。
 * 所有组件事件统一在此定义，避免硬编码字符串。
 *
 * 命名规则：
 * - 能力事件：{能力名}:{动作}（如 pagination:change, crud:action）
 * - 组件事件：{组件名}:{动作}（如 table:create, form:save）
 * - 选择事件：selection:{动作}（如 selection:change, selection:rowSelect）
 */

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
// 选择事件（SelectableAbility / EntityAbility 发射）
// ============================================
export const SELECTION_EVENTS = {
    /** 选择状态变更 */
    CHANGE: 'selectionchange',
    /** 行选中/取消 */
    ROW_SELECT: 'rowselect',
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
// 工具栏事件（ToolbarAbility 发射）
// ============================================
export const TOOLBAR_EVENTS = {
    REORDER: 'toolbarreorder',
    INSERT: 'toolbarinsert',
} as const;

// ============================================
// 实体事件（EntityAbility 转发 EntityManager 事件）
// ============================================
export const ENTITY_EVENTS = {
    /** 数据变更 */
    DATA_CHANGE: 'entity:datachange',
    /** 列表加载完成 */
    LISTED: 'entity:listed',
    /** 创建成功 */
    CREATED: 'entity:created',
    /** 更新成功 */
    UPDATED: 'entity:updated',
    /** 删除成功 */
    DELETED: 'entity:deleted',
    /** 保存成功 */
    SAVED: 'entity:saved',
    /** 切换成功 */
    TOGGLED: 'entity:toggled',
    /** 加载中 */
    LOADING: 'entity:loading',
    /** 加载完成 */
    LOADED: 'entity:loaded',
    /** 加载失败 */
    ERROR: 'entity:error',
    /** 选择变更 */
    SELECTION_CHANGE: 'entity:selectionchange',
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
