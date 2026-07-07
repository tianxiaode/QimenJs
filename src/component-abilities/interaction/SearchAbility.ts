/**
 * SearchAbility 搜索能力
 *
 * @deprecated 请使用 toolbar/SearchAbility，支持简单搜索/复杂搜索两种模式、
 * 防抖 change 触发、搜索按钮、事件发射等完整功能。
 * 本文件仅为 SelectComponent 等现有使用方保留兼容。
 *
 * 提供 keyword 和 onSearch 回调
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const SearchAbility: AbilityDefinition = {
    /**
     * keyword getter/setter
     */
    keyword: {
        get(): string {
            return this.abilityState('SearchAbility:keyword', () => '');
        },
        set(value: string): void {
            this.setAbilityState('SearchAbility:keyword', value);
        },
    },

    /**
     * 搜索回调
     */
    onSearch: {
        get(): ((keyword: string) => void) | undefined {
            return this.abilityState('SearchAbility:onSearch', () => undefined);
        },
        set(handler: (keyword: string) => void): void {
            this.setAbilityState('SearchAbility:onSearch', handler);
        },
    },
};
