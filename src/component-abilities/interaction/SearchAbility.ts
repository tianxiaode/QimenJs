/**
 * SearchAbility 搜索能力
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
