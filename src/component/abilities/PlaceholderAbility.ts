/**
 * PlaceholderAbility 占位符能力
 *
 * 提供 placeholder getter/setter
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const PlaceholderAbility: AbilityDefinition = {
    /**
     * placeholder getter/setter
     */
    placeholder: {
        get(): string {
            return this.abilityState('PlaceholderAbility:placeholder', () => '');
        },
        set(value: string): void {
            this.setAbilityState('PlaceholderAbility:placeholder', value);
            // 更新 DOM
            if (this.el) {
                const input = this.el.querySelector('input, textarea') as HTMLInputElement | null;
                if (input) {
                    input.placeholder = value;
                }
            }
        },
    },
};
