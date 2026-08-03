import type { PermissionTransformerOptions } from '@/permission/types';

const PERMISSION_SEPARATOR = ':';

/**
 * ABP 权限转换器
 *
 * 将 ABP 风格权限码转为系统格式：
 * - "Users.Create" → "users:create"
 * - "Products.Order.Export" → "products:order:export"
 *
 * @param rawCodes - ABP 返回的原始权限码列表
 * @param options - 转换选项
 * @returns 可直接传给 registerDomain 的 permissions 字段
 *
 * @example
 * ```typescript
 * const permissions = transformAbpPermissions(['Users.Create', 'Products.Export']);
 * registrar.registerDomain('abp', { permissions });
 * ```
 */
export function transformAbpPermissions(
    rawCodes: string[],
    options?: PermissionTransformerOptions
): string[] {
    const onUnmatched = options?.onUnmatched;
    const result: string[] = [];

    for (const raw of rawCodes) {
        if (!raw) continue;

        if (raw.includes('.')) {
            result.push(raw.toLowerCase().replace(/\./g, PERMISSION_SEPARATOR));
        } else if (onUnmatched) {
            const transformed = onUnmatched(raw);
            if (transformed) {
                result.push(transformed);
            }
        } else {
            result.push(raw.toLowerCase());
        }
    }

    return result;
}
