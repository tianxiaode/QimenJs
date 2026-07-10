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
 *
 * 声明 permission 后自动注册 permission:change 事件监听，
 * 权限变更时重新检查并控制组件可见性/可用性。
 */

import type { AbilityDefinition } from '@/composable';
import type { PermissionProps } from '@/layout/LayoutNode';
import { globalEventBus } from '@qimenjs/events';
import { PERMISSION_CHANGE_EVENT } from '@/permission/types';

export const PermissionAbility: AbilityDefinition = {
    permission: {
        get(): PermissionProps['permission'] { return this.props.permission; },
        set(v: PermissionProps['permission']) {
            this.setProp('permission', v);
            if (v) {
                applyPermission(this, v);
                this._listenPermissionChange();
            }
        },
    },

    /**
     * 注册权限变更监听器
     *
     * 仅在 permission 被赋值时调用，监听 GlobalEventBus 的 permission:change 事件。
     * 组件销毁时通过 onCleanup 自动解绑。
     */
    _listenPermissionChange(): void {
        // 避免重复注册
        if (this._permissionListening) return;
        this._permissionListening = true;

        const off = globalEventBus.on(PERMISSION_CHANGE_EVENT, () => {
            const perm = this.props.permission;
            if (perm) {
                applyPermission(this, perm);
            }
        });

        this.onCleanup(off);
    },

    /** 防止重复注册监听器 */
    _permissionListening: false,
};

/**
 * 应用权限控制
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
    } else {
        // 有权限时恢复默认状态
        switch (behavior) {
            case 'hidden':
                component.el.style.display = '';
                break;
            case 'disable':
                (component.el as any).disabled = false;
                component.el.removeAttribute('aria-disabled');
                break;
        }
    }

    if (permission.onPermissionChange) {
        permission.onPermissionChange(hasPermission);
    }
}

/**
 * 权限检查
 * TODO: 对接 PermissionRegistrar.has()
 */
function checkPermission(_permission: NonNullable<PermissionProps['permission']>): boolean {
    return true;
}
