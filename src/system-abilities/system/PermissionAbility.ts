/**
 * PermissionAbility — 全局权限能力（系统级）
 *
 * 封装 PermissionRegistrar 单例，为所有组件提供统一的权限校验入口。
 * 组件通过 this.checkPermission(query) 调用，无需直接引用 PermissionRegistrar。
 */

import type { AbilityDefinition } from '@/composable';
import { PermissionRegistrar } from '@/permission';
import type { PermissionQuery } from '@/permission';

export const PermissionAbility = {
    /**
     * 结构化权限查询
     *
     * @param query - { action, entityKey?, domain? }
     * @returns 是否拥有权限
     */
    checkPermission(query: PermissionQuery): boolean {
        const registrar = PermissionRegistrar.getInstance();
        return registrar.hasPermission(query);
    },
} satisfies AbilityDefinition;
