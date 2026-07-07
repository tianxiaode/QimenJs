/**
 * ColumnAbility 列定义能力
 *
 * 提供 columns getter/setter
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const ColumnAbility: AbilityDefinition = {
    /**
     * columns getter/setter
     */
    columns: {
        get(): any[] {
            return this.abilityState('ColumnAbility:columns', () => []);
        },
        set(value: any[]): void {
            this.setAbilityState('ColumnAbility:columns', value);
            this.markDirty();
        },
    },
};
