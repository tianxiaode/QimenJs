/**
 * 权限系统类型定义
 */

/**
 * 权限变更事件名称
 */
export const PERMISSION_CHANGE_EVENT = 'permission:change' as const;

/**
 * 权限码分隔符
 *
 * 权限码格式：域:权限码，如 system:user:create
 */
export const PERMISSION_SEPARATOR = ':' as const;

/**
 * 权限注册项
 *
 * 批量注册时的数据结构
 */
export interface PermissionEntry {
    /** 域名称 */
    domain: string;
    /** 权限码列表 */
    codes: string[];
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
