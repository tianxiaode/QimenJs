import type { PermissionEntry, PermissionTransformerOptions } from '@/permission/types';

const PERMISSION_SEPARATOR = ':';
const ROLE_PREFIX = 'ROLE_';

/**
 * Spring 权限转换器
 *
 * 将 Spring 风格权限码转为系统格式：
 * - "ROLE_USER_CREATE" → "user:create"
 * - "ROLE_PRODUCT_ORDER_EXPORT" → "product:order:export"
 * - "ADMIN" → "admin"（无 ROLE_ 前缀视为全局权限）
 *
 * Spring 权限码使用 UPPER_SNAKE_CASE + ROLE_ 前缀，转换规则：
 * 1. 去除 ROLE_ 前缀
 * 2. 整体转小写
 * 3. 下划线替换为冒号
 *
 * @param rawCodes - Spring 返回的原始权限码列表
 * @param options - 转换选项
 * @returns 可直接传给 registerBatch 的 PermissionEntry 数组
 *
 * @example
 * ```typescript
 * const entries = transformSpringPermissions(['ROLE_USER_CREATE', 'ROLE_ADMIN'], {
 *     domain: 'spring',
 *     onUnmatched: (code) => {
 *         if (code === 'CUSTOM_ROLE') return { domain: 'spring', codes: ['custom'] };
 *     }
 * });
 * registrar.registerBatch(entries);
 * ```
 */
export function transformSpringPermissions(
    rawCodes: string[],
    options?: PermissionTransformerOptions
): PermissionEntry[] {
    const domain = options?.domain ?? 'default';
    const onUnmatched = options?.onUnmatched;
    const codes: string[] = [];

    for (const raw of rawCodes) {
        if (!raw) continue;

        let code = raw;
        if (code.startsWith(ROLE_PREFIX)) {
            code = code.substring(ROLE_PREFIX.length);
        }

        if (code.includes('_')) {
            codes.push(code.toLowerCase().replace(/_/g, PERMISSION_SEPARATOR));
        } else if (onUnmatched && !code.includes('_')) {
            const result = onUnmatched(raw);
            if (result) {
                const entries: PermissionEntry[] = [];
                if (codes.length > 0) entries.push({ domain, codes });
                entries.push(result);
                return entries;
            }
            codes.push(code.toLowerCase());
        } else {
            codes.push(code.toLowerCase());
        }
    }

    const entries: PermissionEntry[] = [];
    if (codes.length > 0) {
        entries.push({ domain, codes });
    }
    return entries;
}