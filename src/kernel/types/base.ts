export type CRUD_ACTION =
    | 'list' // GET_LIST
    | 'all' // GET_ALL
    | 'detail' // GET_DETAIL
    | 'create' // CREATE
    | 'update' // UPDATE
    | 'delete' // DELETE
    | 'batchDelete' // BATCH_DELETE
    | 'toggle'; // TOGGLE

export type ENTITY_ACTION = CRUD_ACTION | string;

/**
 * 处理器类别：定义处理器的核心职责
 */
export enum ActionCategory {
    // === 前置阶段 (9000+) ===
    PREPARE = 9000,   // BaseUrl, UUID
    ENRICH = 8000,    // Headers, Token

    // === 拦截阶段 (7000+) ===
    GUARD = 7000,     // 权限, 防抖
    VALIDATE = 6000,  // Schema 校验

    // === 执行阶段 (5000) ===
    IO = 5000,        // 网络请求

    // === 后置阶段 (3000+) ===
    TRANSFORM = 3000, // 数据脱敏, 格式化
    FALLBACK = 2000,  // 错误兜底

    // === 副作用阶段 (1000-) ===
    EFFECT = 1000     // 日志, 通知
}

