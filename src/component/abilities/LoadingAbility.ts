/**
 * LoadingAbility 加载能力
 *
 * 显示/隐藏加载指示器
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const LoadingAbility: AbilityDefinition = {
    /**
     * loading getter/setter
     */
    loading: {
        get(): boolean {
            return this.abilityState('LoadingAbility:loading', () => false);
        },
        set(value: boolean): void {
            this.setAbilityState('LoadingAbility:loading', value);
            if (this.el) {
                if (value) {
                    this.addClass(`q-${this.type}--loading`);
                    this.el.setAttribute('aria-busy', 'true');
                } else {
                    this.removeClass(`q-${this.type}--loading`);
                    this.el.removeAttribute('aria-busy');
                }
            }
        },
    },
};
