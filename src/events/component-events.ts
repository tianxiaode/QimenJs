/**
 * 组件能力事件常量定义
 *
 * 定义组件能力层的事件，供 component 包和扩展包统一引用。
 * 与 entity-events.ts 同级，保持事件定义的集中管理。
 *
 * 分类：
 * - 分页事件：PaginationAbility 发射
 * - CRUD 事件：CrudAbility 发射
 * - 选择事件：SelectableAbility / SelectionAbility 发射
 * - 子组件事件：ChildrenAbility 发射
 * - 列管理事件：ColumnManageAbility 发射
 * - 搜索事件：SearchAbility 发射
 * - 工具栏事件：ToolbarAbility 发射
 * - 实体转发事件：EntityEmitAbility 转发 EntityManager 事件
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
// 选择事件（SelectableAbility / SelectionAbility 发射）
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
} as const;

// ============================================
// 实体转发事件（EntityEmitAbility 转发 EntityManager 事件）
//
// 对应 events 包中的分类定义：
// - ENTITY_DATA_EVENTS → 数据变更
// - ENTITY_CRUD_EVENTS → CRUD 结果
// - ENTITY_LIST_EVENTS → 列表加载
// - ENTITY_REQUEST_STATUS → 请求状态
// ============================================
export const ENTITY_EVENTS = {
    // ---- 数据变更 ----
    /** 数据变更（对应 ENTITY_DATA_EVENTS.DATA_CHANGE） */
    DATA_CHANGE: 'entity:datachange',

    // ---- CRUD 结果 ----
    /** 创建成功（对应 ENTITY_CRUD_EVENTS.CREATED） */
    CREATED: 'entity:created',
    /** 更新成功（对应 ENTITY_CRUD_EVENTS.UPDATED） */
    UPDATED: 'entity:updated',
    /** 删除成功（对应 ENTITY_CRUD_EVENTS.DELETED） */
    DELETED: 'entity:deleted',
    /** 保存成功（对应 ENTITY_CRUD_EVENTS.SAVED） */
    SAVED: 'entity:saved',
    /** 切换成功（对应 ENTITY_CRUD_EVENTS.TOGGLED） */
    TOGGLED: 'entity:toggled',

    // ---- 列表加载 ----
    /** 列表加载完成（对应 ENTITY_LIST_EVENTS.LISTED） */
    LISTED: 'entity:listed',
    /** 单条获取完成（对应 ENTITY_LIST_EVENTS.GOT） */
    GOT: 'entity:got',

    // ---- 请求状态 ----
    /** 加载中（对应 {action}:loading） */
    LOADING: 'entity:loading',
    /** 加载完成（对应 {action}:success） */
    LOADED: 'entity:loaded',
    /** 加载失败（对应 {action}:error） */
    ERROR: 'entity:error',

    // ---- 树操作（对应 ENTITY_TREE_EVENTS） ----
    /** 节点展开（对应 ENTITY_TREE_EVENTS.EXPANDED） */
    EXPANDED: 'entity:expanded',
    /** 节点折叠（对应 ENTITY_TREE_EVENTS.COLLAPSED） */
    COLLAPSED: 'entity:collapsed',
    /** 节点移动（对应 ENTITY_TREE_EVENTS.MOVED） */
    MOVED: 'entity:moved',
    /** 子节点刷新完成（对应 ENTITY_TREE_EVENTS.CHILDREN_REFRESHED） */
    CHILDREN_REFRESHED: 'entity:childrenrefreshed',

    // ---- 搜索变更 ----
    /** 搜索变更（对应 ENTITY_SEARCH_EVENTS.CHANGE） */
    SEARCH_CHANGE: 'entity:searchchange',

    // ---- UI 选择 ----
    /** 选择变更（SelectionAbility 自身触发，非 EntityManager 事件） */
    SELECTION_CHANGE: 'entity:selectionchange',
} as const;
