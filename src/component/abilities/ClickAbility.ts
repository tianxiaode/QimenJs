/**
 * ClickAbility 点击能力
 *
 * 提供 onClick 回调和 click() 方法
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const ClickAbility: AbilityDefinition = {
    /**
     * 点击回调
     */
    onClick: {
        get(): ((event: Event) => void) | undefined {
            return this.abilityState('ClickAbility:onClick', () => undefined);
        },
        set(handler: (event: Event) => void): void {
            this.setAbilityState('ClickAbility:onClick', handler);
        },
    },

    /**
     * 触发点击
     */
    click(): void {
        if (typeof this.onClick === 'function') {
            this.onClick(new Event('click'));
        }
    },
};
