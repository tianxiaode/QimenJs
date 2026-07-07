/**
 * SortAbility 排序能力
 *
 * 提供 sortField/sortOrder 和 onSortChange 回调
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const SortAbility: AbilityDefinition = {
    /**
     * sortField getter/setter
     */
    sortField: {
        get(): string {
            return this.abilityState('SortAbility:field', () => '');
        },
        set(value: string): void {
            this.setAbilityState('SortAbility:field', value);
        },
    },

    /**
     * sortOrder getter/setter
     */
    sortOrder: {
        get(): 'asc' | 'desc' | '' {
            return this.abilityState('SortAbility:order', () => '');
        },
        set(value: 'asc' | 'desc' | ''): void {
            this.setAbilityState('SortAbility:order', value);
        },
    },

    /**
     * 排序变更回调
     */
    onSortChange: {
        get(): ((field: string, order: string) => void) | undefined {
            return this.abilityState('SortAbility:onSortChange', () => undefined);
        },
        set(handler: (field: string, order: string) => void): void {
            this.setAbilityState('SortAbility:onSortChange', handler);
        },
    },
};
