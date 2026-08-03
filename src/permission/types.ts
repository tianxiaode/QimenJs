/**
 * 权限系统类型定义
 */

/**
 * 权限变更事件名称
 */
export const PERMISSION_CHANGE_EVENT = 'permission:change' as const;

/**
 * 权限码分隔符
 */
export const PERMISSION_SEPARATOR = ':' as const;

/**
 * 权限查询 — 结构化参数，零字符串拼接
 */
export interface PermissionQuery {
    /** 权限动作（create / read / update / delete 等） */
    action: string;
    /** 实体键（从组件 entityKey 推导） */
    entityKey?: string;
    /** 域（从组件 domain 推导） */
    domain?: string;
}

/**
 * 权限验证函数 — 开发者自定义域的匹配逻辑
 *
 * @param query - 结构化查询参数
 * @param granted - 该域已授予的权限码集合
 * @returns 是否拥有权限
 */
export type PermissionValidator = (query: PermissionQuery, granted: Set<string>) => boolean;

/**
 * 域配置 — 注册域时传入
 */
export interface DomainConfig {
    /** 该域已授予的权限码列表 */
    permissions: string[];
    /** 自定义验证函数（不传则用默认匹配） */
    validate?: PermissionValidator;
}

/**
 * 域存储条目 — 内部使用
 */
export interface DomainEntry {
    /** 已授予的权限码集合 */
    permissions: Set<string>;
    /** 自定义验证函数 */
    validate?: PermissionValidator;
}

/**
 * 权限变更事件载荷
 */
export interface PermissionChangePayload {
    /** 变更的域列表 */
    domains: string[];
    /** 变更类型 */
    type: 'register' | 'unregister' | 'clear' | 'load';
}

/**
 * 权限转换器 — 将后端原始权限码转为系统格式
 *
 * @param rawCodes - 后端返回的原始权限码列表
 * @returns 权限码数组
 */
export type PermissionTransformer = (rawCodes: string[]) => string[];

/**
 * 权限转换器选项
 */
export interface PermissionTransformerOptions {
    /** 目标域，默认 'default' */
    domain?: string;
    /** 自定义回调：对无法按默认规则转换的权限码做自定义处理 */
    onUnmatched?: (code: string) => string | undefined;
}
