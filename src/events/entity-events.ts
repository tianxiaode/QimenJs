/**
 * 实体事件常量定义
 *
 * 定义 EntityManager 及其 Ability 触发的所有事件，
 * 供 entity 包和 component 包统一引用，消除硬编码字符串。
 *
 * 事件分类：
 * - 数据变更事件：数据内容发生变化时触发
 * - CRUD 结果事件：增删改操作完成后触发
 * - 列表加载事件：列表查询完成后触发
 * - 请求状态事件：请求生命周期状态变化时触发（由 BaseEntityManager.fetch 驱动）
 */

// ============================================
// 数据变更事件（DirtyAbility 触发）
// ============================================
export const ENTITY_DATA_EVENTS = {
    /** 数据变更（脏数据变化） */
    DATA_CHANGE: 'dataChange',
} as const;

// ============================================
// CRUD 结果事件（各 Mutation Ability 触发）
// ============================================
export const ENTITY_CRUD_EVENTS = {
    /** 创建成功 */
    CREATED: 'created',
    /** 更新成功 */
    UPDATED: 'updated',
    /** 删除成功 */
    DELETED: 'deleted',
    /** 保存成功（本地批量同步到远程后） */
    SAVED: 'saved',
    /** 切换成功（布尔字段切换） */
    TOGGLED: 'toggled',
} as const;

// ============================================
// 列表加载事件（List Ability 触发）
// ============================================
export const ENTITY_LIST_EVENTS = {
    /** 列表加载完成 */
    LISTED: 'listed',
    /** 单条获取完成 */
    GOT: 'got',
} as const;

// ============================================
// 树操作事件（TreeManagerAbility 触发）
// ============================================
export const ENTITY_TREE_EVENTS = {
    /** 节点展开 */
    EXPANDED: 'expanded',
    /** 节点折叠 */
    COLLAPSED: 'collapsed',
    /** 节点移动 */
    MOVED: 'moved',
    /** 子节点刷新完成 */
    CHILDREN_REFRESHED: 'childrenRefreshed',
} as const;

// ============================================
// 搜索事件（SearchAbility 触发）
// ============================================
export const ENTITY_SEARCH_EVENTS = {
    /** 搜索条件变更 */
    CHANGE: 'searchChange',
} as const;

// ============================================
// 上传事件（FileUpload Ability / mgr 触发）
// ============================================
export const ENTITY_UPLOAD_EVENTS = {
    /** 单文件上传完成 */
    UPLOADED: 'uploaded',
    /** 上传进度 */
    PROGRESS: 'upload:progress',
    /** 上传失败 */
    ERROR: 'upload:error',
} as const;

// ============================================
// 验证事件（组件触发，验证方响应）
// ============================================
export const ENTITY_VALIDATION_EVENTS = {
    /** 请求验证（组件 → 验证方） */
    VALIDATE: 'validate',
    /** 验证结果（验证方 → 组件） */
    VALIDATION: 'validation',
} as const;

// ============================================

// 生命周期事件（组件/能力 ↔ DataDispatchCenter）
// ============================================
export const ENTITY_LIFECYCLE_EVENTS = {
    /** 连接实体（请求获取 EntityManager 实例） */
    CONNECT: 'connect',
    /** 断开实体（释放 EntityManager 实例引用） */
    DISCONNECT: 'disconnect',
} as const;

// ============================================
// 命令事件（组件 → Manager 触发操作）
//
// 与结果事件区分：命令事件是"请执行某操作"，
// 结果事件是"某操作已完成"。
// ============================================
export const ENTITY_COMMAND_EVENTS = {
    // 列表/查询命令
    LIST: 'list',
    REFRESH: 'refresh',
    GET_ALL: 'getAll',
    GET: 'get',
    FILTER: 'filter',
    SEARCH_BY: 'searchBy',
    SORT: 'sort',
    RESET: 'reset',

    // 分页命令
    PREV: 'prev',
    NEXT: 'next',
    JUMP: 'jump',
    CHANGE_SIZE: 'changeSize',

    // CRUD 命令
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    TOGGLE: 'toggle',
    SAVE: 'save',

    // 编辑状态命令
    START_EDIT: 'startEdit',
    SUBMIT_EDIT: 'submitEdit',
    CANCEL_EDIT: 'cancelEdit',
    ROLLBACK_ALL: 'rollbackAll',

    // 树命令
    EXPAND: 'expand',
    COLLAPSE: 'collapse',
    MOVE_NODE: 'moveNode',
    REMOVE_NODE: 'removeNode',
    SYNC_CHILDREN: 'syncChildren',
    REFRESH_VIEW: 'refreshView',

    // 词典命令
    LOAD_DICTIONARY: 'loadDictionary',
} as const;

// ============================================
// 权限事件（CoreEntityManager 触发）
// ============================================
export const ENTITY_PERMISSION_EVENTS = {
    /** 权限拒绝 */
    PERMISSION_DENIED: 'permissionDenied',
} as const;

// ============================================
// 请求状态事件（BaseEntityManager.fetch 触发）
//
// 格式为 {action}:{status}，action 来自 ENTITY_ACTION 枚举，
// status 为 loading / success / error。
// 例如：list:loading, create:success, update:error
// ============================================
export const ENTITY_REQUEST_STATUS = {
    /** 加载中（后缀） */
    LOADING: 'loading',
    /** 加载成功（后缀） */
    SUCCESS: 'success',
    /** 加载失败（后缀） */
    ERROR: 'error',
} as const;

/**
 * 构建请求状态事件名
 *
 * @param action - 实体动作，如 'list', 'create', 'update', 'delete', 'toggle'
 * @param status - 请求状态，取自 ENTITY_REQUEST_STATUS
 * @returns 事件名字符串，如 'list:loading', 'create:success'
 *
 * @example
 * ```ts
 * import { buildRequestEvent, ENTITY_REQUEST_STATUS } from '@qimenjs/events';
 *
 * this.emit(buildRequestEvent('list', ENTITY_REQUEST_STATUS.LOADING), true);
 * this.emit(buildRequestEvent('create', ENTITY_REQUEST_STATUS.SUCCESS), ctx);
 * ```
 */
export function buildRequestEvent(action: string, status: string): string {
    return `${action}:${status}`;
}
