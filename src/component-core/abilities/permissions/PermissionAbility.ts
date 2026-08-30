/**
 * PermissionAbility — 组件权限能力
 *
 * 组件根据自身的 permission option 控制可见性：
 *   - permission === null/undefined: 无权限限制，始终显示
 *   - permission === false: 无权限，隐藏组件
 *   - permission === string | string[]: 检查权限，无权限时隐藏
 *
 * 权限变化时触发 onPermissionChange(data)，data 包含：
 *   - { hasPermission: boolean } - 是否有权限
 */

import type { AbilityDefinition } from '@/composable';
import { SYSTEM_EVENTS } from '@/events';

const PERMISSION_SEPARATOR = ':';

export const PermissionAbility: AbilityDefinition = {
    /**
     * 检查组件当前用户是否有权限
     * @returns 是否有权限（无权限配置时默认有权限）
     */
    hasPermission(): boolean {
        const permission = this.permission;
        if (permission === null || permission === undefined) return true;
        if (permission === false) return false;

        const entityKey = this.entityKey as string | undefined;
        const domain = this.domain as string | undefined;

        const permissions = Array.isArray(permission) ? permission : [permission];
        return permissions.some(p => {
            const query = this._resolvePermissionQuery(p, entityKey, domain);
            return this.checkPermission(query);
        });
    },

    /**
     * 应用权限 — 根据组件自己的 permission option 控制可见性
     */
    _applyPermission(): void {
        const hasPermission = this.hasPermission();
        if (hasPermission) {
            this.hidden = false;
        } else {
            this.hidden = true;
        }
        this.onPermissionChange?.({ hasPermission });
    },

    /**
     * 初始化权限
     */
    _initPermission(): void {
        const permission = this.permission;
        if (permission === null || permission === undefined) return;
        this.systemOn(SYSTEM_EVENTS.PERMISSION_CHANGE, () => this._applyPermission());
        this._applyPermission();
    },

    /**
     * 将权限配置解析为结构化查询参数
     */
    _resolvePermissionQuery(permission: string, entityKey?: string, domain?: string) {
        const parts = permission.split(PERMISSION_SEPARATOR);

        switch (parts.length) {
            case 1:
                return { action: parts[0], entityKey, domain };
            case 2:
                return { action: parts[1], entityKey: parts[0], domain };
            case 3:
                return { action: parts[2], entityKey: parts[1], domain: parts[0] };
            default:
                return { action: permission, entityKey, domain };
        }
    },
} satisfies AbilityDefinition;
