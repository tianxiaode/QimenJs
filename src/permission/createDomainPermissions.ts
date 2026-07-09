import { PERMISSION_SEPARATOR } from './types';

/**
 * 创建域级权限定义工厂
 *
 * 返回一个函数，调用时自动为权限码添加域前缀。
 * 统一返回数组，无论传入多少个权限码。
 *
 * @param domain - 域名称
 * @returns 权限码工厂函数，接受任意数量的权限码，返回带域前缀的权限码数组
 *
 * @example
 * ```ts
 * const sys = createDomainPermissions('system');
 * const biz = createDomainPermissions('business');
 *
 * sys('user:create')                    // → ['system:user:create']
 * sys('user:create', 'user:delete')     // → ['system:user:create', 'system:user:delete']
 * biz('order:approve', 'order:export')  // → ['business:order:approve', 'business:order:export']
 *
 * // 在 LayoutNode 中使用
 * {
 *     type: ComponentTypes.BUTTON,
 *     permission: {
 *         code: sys('user:delete'),
 *         behavior: 'hidden',
 *     }
 * }
 * ```
 */
export function createDomainPermissions(domain: string): (...codes: string[]) => string[] {
    return (...codes: string[]) => codes.map(code => `${domain}${PERMISSION_SEPARATOR}${code}`);
}
