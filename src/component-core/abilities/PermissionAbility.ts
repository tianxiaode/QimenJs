/**
 * PermissionAbility — 组件权限能力
 *
 * 提供节点权限的只读查询与可见性控制：
 *   getPermission(name) → 获取节点的权限配置（只读）
 *   hasPermission(name) → 检查当前用户是否有权限（委托到全局 checkPermission）
 *   show(name) / hide(name) → 根据权限控制隐藏/显示
 *
 * 权限配置来自模板编译期缓存的 _tplCache.nodes[name].permission，
 * 不支持动态修改，仅通过 hide/show 控制 DOM 可见性。
 * 权限校验委托给系统级 PermissionAbility.checkPermission()。
 */

import type { AbilityDefinition } from '@/composable';
import type { PermissionOptions } from '../types';
import { SYSTEM_EVENTS } from '@/events';

const PERMISSION_SEPARATOR = ':';

export const PermissionAbility: AbilityDefinition = {
    /**
     * 获取节点的权限配置（只读）
     * @param nodeName - 节点名称
     * @returns 权限配置，未配置时返回 undefined
     */
    getPermission(nodeName: string): PermissionOptions | undefined {
        const nodeMeta = this.getNode(nodeName);
        return nodeMeta?.permission;
    },

    /**
     * 检查当前用户是否有权限访问指定节点
     * @param nodeName - 节点名称
     * @returns 是否有权限（无权限配置时默认有权限）
     */
    hasPermission(nodeName: string): boolean {
        const permission = this.getPermission(nodeName);
        if (permission === undefined) return true;

        const entityKey = this.entityKey as string | undefined;
        const domain = this.domain as string | undefined;

        const permissions = Array.isArray(permission) ? permission : [permission];
        return permissions.some(p => {
            const query = this._resolvePermissionQuery(p, entityKey, domain);
            return this.checkPermission(query);
        });
    },

    /**
     * 隐藏节点
     * @param nodeName - 节点名称
     */
    hide(nodeName: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        el.style.display = 'none';
    },

    /**
     * 显示节点
     * @param nodeName - 节点名称
     */
    show(nodeName: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        el.style.display = '';
    },

    /**
     * 应用权限 — 遍历所有权限节点，根据权限控制可见性
     */
    _applyPermission(): void {
        const names = this._tplCache.permissions || [];
        for (const name of names) {
            if (this.hasPermission(name)) {
                this.show(name);
            } else {
                this.hide(name);
            }
        }
    },

    /**
     * 初始化权限
     */
    _initPermission(): void {
        const names = this._tplCache.permissions || [];
        if (names.length === 0) return;
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
