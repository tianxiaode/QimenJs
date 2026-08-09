/**
 * 权限定义
 *
 * - 'role:admin' → 角色
 * - 'users:delete' → 权限标识
 * - ['role:admin', 'role:editor'] → 任一
 */
export type PermissionDef = string | string[];

/**
 * 权限节点集合
 */
export type PermissionNodes = Record<string, PermissionDef>;
