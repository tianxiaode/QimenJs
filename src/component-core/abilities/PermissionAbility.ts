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

import type { ComposableBase } from '../ComposableBase';
import { ABILITY_INIT_PROPS } from '../ComposableBase';
import { AbilityBase } from './AbilityBase';
import type { PermissionProps } from '../../layout/LayoutNode';

const STATE_KEY = 'PermissionAbility';

const permissionDescriptors: PropertyDescriptorMap = {
    permission: {
        get(this: ComposableBase) { return this.abilityState(`${STATE_KEY}:permission`); },
        set(this: ComposableBase, v: PermissionProps['permission']) {
            this.abilityState(`${STATE_KEY}:permission`, v);
            if (v) {
                applyPermission(this, v);
            }
        },
        configurable: true, enumerable: true,
    },
};

export class PermissionAbility extends AbilityBase {
    static install(component: ComposableBase, config?: Record<string, any>): void {
        Object.defineProperties(component, permissionDescriptors);
        component.abilityState(`${STATE_KEY}:instance`, new PermissionAbility());
    }

    [ABILITY_INIT_PROPS](_props: Record<string, any>): void {
        // 无操作，赋值在阶段 4
    }
}

/**
 * 应用权限控制
 * TODO: 对接权限检查服务
 */
function applyPermission(component: ComposableBase, permission: NonNullable<PermissionProps['permission']>): void {
    const { behavior = 'hidden', defaultBehavior = 'visible' } = permission;

    // 占位：实际需要对接权限检查服务
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
function checkPermission(permission: NonNullable<PermissionProps['permission']>): boolean {
    // 默认返回 true，等待对接权限服务
    return true;
}
