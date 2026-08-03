import type { PermissionEntry, PermissionTransformerOptions } from '@/permission/types';

const PERMISSION_SEPARATOR = ':';

/**
 * ABP 权限转换器
 *
 * 将 ABP 风格权限码转为系统格式：
 * - "Users.Create" → "users:create"
 * - "Products.Order.Export" → "products:order:export"
 *
 * ABP 权限码使用 PascalCase + 点号分隔，转换规则：
 * 1. 整体转小写
 * 2. 点号替换为冒号
 *
 * @param rawCodes - ABP 返回的原始权限码列表
 * @param options - 转换选项
 * @returns 可直接传给 registerBatch 的 PermissionEntry 数组
 *
 * @example
 * ```typescript
 * const entries = transformAbpPermissions(['Users.Create', 'Products.Export'], {
 *     domain: 'abp',
 *     onUnmatched: (code) => {
 *         if (code === 'SPECIAL_ADMIN') return { domain: 'abp', codes: ['admin'] };
 *     }
 * });
 * registrar.registerBatch(entries);
 * ```
 */
export function transformAbpPermissions(
    rawCodes: string[],
    options?: PermissionTransformerOptions
): PermissionEntry[] {
    const domain = options?.domain ?? 'default';
    const onUnmatched = options?.onUnmatched;
    const codes: string[] = [];
    const unmatched: string[] = [];

    for (const raw of rawCodes) {
        if (raw && raw.includes('.')) {
            codes.push(raw.toLowerCase().replace(/\./g, PERMISSION_SEPARATOR));
        } else if (raw && onUnmatched) {
            const result = onUnmatched(raw);
            if (result) {
                return [{ domain, codes }, ...([result] as PermissionEntry[])];
            }
            unmatched.push(raw);
        } else if (raw) {
            codes.push(raw.toLowerCase());
        }
    }

    const entries: PermissionEntry[] = [];
    if (codes.length > 0) {
        entries.push({ domain, codes });
    }
    return entries;
}