/**
 * DisableAbility 禁用能力
 *
 * 设置 disabled 状态，添加 BEM class + aria-disabled
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const DisableAbility: AbilityDefinition = {
    /**
     * disabled getter/setter
     */
    disabled: {
        get(): boolean {
            return this.abilityState('DisableAbility:disabled', () => false);
        },
        set(value: boolean): void {
            this.setAbilityState('DisableAbility:disabled', value);
            if (this.el) {
                if (value) {
                    this.addClass(`q-${this.type}--disabled`);
                    this.el.setAttribute('aria-disabled', 'true');
                } else {
                    this.removeClass(`q-${this.type}--disabled`);
                    this.el.removeAttribute('aria-disabled');
                }
            }
        },
    },
};
