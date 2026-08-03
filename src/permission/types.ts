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

/**
 * 权限转换器 — 将后端原始权限码转为系统格式
 *
 * @param rawCodes - 后端返回的原始权限码列表
 * @returns 可直接传给 registerBatch 的 PermissionEntry 数组
 */
export type PermissionTransformer = (rawCodes: string[]) => PermissionEntry[];

/**
 * 权限转换器选项
 */
export interface PermissionTransformerOptions {
    /** 目标域，默认 'default' */
    domain?: string;
    /** 自定义回调：对无法按默认规则转换的权限码做自定义处理 */
    onUnmatched?: (code: string) => PermissionEntry | undefined;
}
