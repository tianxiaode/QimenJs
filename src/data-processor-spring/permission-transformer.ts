import type { PermissionTransformerOptions } from '@/permission/types';

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
 * @param rawCodes - Spring 返回的原始权限码列表
 * @param options - 转换选项
 * @returns 可直接传给 registerDomain 的 permissions 字段
 *
 * @example
 * ```typescript
 * const permissions = transformSpringPermissions(['ROLE_USER_CREATE', 'ROLE_ADMIN']);
 * registrar.registerDomain('spring', { permissions });
 * ```
 */
export function transformSpringPermissions(
    rawCodes: string[],
    options?: PermissionTransformerOptions
): string[] {
    const onUnmatched = options?.onUnmatched;
    const result: string[] = [];

    for (const raw of rawCodes) {
        if (!raw) continue;

        let code = raw;
        if (code.startsWith(ROLE_PREFIX)) {
            code = code.substring(ROLE_PREFIX.length);
        }

        if (code.includes('_')) {
            result.push(code.toLowerCase().replace(/_/g, PERMISSION_SEPARATOR));
        } else if (onUnmatched) {
            const transformed = onUnmatched(raw);
            if (transformed) {
                result.push(transformed);
            }
        } else {
            result.push(code.toLowerCase());
        }
    }

    return result;
}
