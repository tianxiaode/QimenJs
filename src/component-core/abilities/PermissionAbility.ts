/**
 * PermissionAbility — 权限控制
 *
 * 对应 LayoutNode 的 PermissionProps 字段：permission
 *
 * permission 配置：
 * - code: string[] — 权限码列表
 * - matchMode: 'all' | 'any' — 匹配模式
 * - behavior: 'disable' | 'hidden' | 'removed' — 无权限时的行为
 * - defaultBehavior: 'visible' | 'disable' | 'hidden' | 'removed' — 默认行为
 * - noPermissionTip: string — 无权限提示
 * - onPermissionChange: (hasPermission: boolean) => boolean | void — 权限变化回调
 */

import type { AbilityDefinition } from '@/composable';
import type { PermissionProps } from '@/layout/LayoutNode';

export const PermissionAbility: AbilityDefinition = {
    permission: {
        get(): PermissionProps['permission'] { return this.props.permission; },
        set(v: PermissionProps['permission']) {
            this.setProp('permission', v);
            if (v) {
                applyPermission(this, v);
            }
        },
    },
};

/**
 * 应用权限控制
 * TODO: 对接权限检查服务
 */
function applyPermission(component: any, permission: NonNullable<PermissionProps['permission']>): void {
    const { behavior = 'hidden' } = permission;

    const hasPermission = checkPermission(permission);

    if (!hasPermission) {
        switch (behavior) {
            case 'hidden':
                component.el.style.display = 'none';
                break;
            case 'disable':
                (component.el as any).disabled = true;
                component.el.setAttribute('aria-disabled', 'true');
                break;
            case 'removed':
                component.el.remove();
                break;
        }
    }

    if (permission.onPermissionChange) {
        permission.onPermissionChange(hasPermission);
    }
}

/**
 * 权限检查（占位）
 * TODO: 对接实际权限服务
 */
function checkPermission(_permission: NonNullable<PermissionProps['permission']>): boolean {
    return true;
}
