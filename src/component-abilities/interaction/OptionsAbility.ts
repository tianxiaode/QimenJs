/**
 * OptionsAbility 选项能力
 *
 * 提供 options 和 selectedOption 管理
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const OptionsAbility: AbilityDefinition = {
    /**
     * options getter/setter
     */
    options: {
        get(): any[] {
            return this.abilityState('OptionsAbility:options', () => []);
        },
        set(value: any[]): void {
            this.setAbilityState('OptionsAbility:options', value);
            this.markDirty();
        },
    },

    /**
     * selectedOption getter
     */
    selectedOption: {
        get(): any {
            return this.abilityState('OptionsAbility:selected', () => undefined);
        },
    },
};
