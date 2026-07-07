/**
 * OpenableAbility 可打开能力
 *
 * 提供 open/close 方法和 isOpen 状态
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const OpenableAbility: AbilityDefinition = {
    /**
     * isOpen getter
     */
    isOpen: {
        get(): boolean {
            return this.abilityState('OpenableAbility:isOpen', () => false);
        },
    },

    /**
     * 打开
     */
    open(): void {
        this.setAbilityState('OpenableAbility:isOpen', true);
        this.visible = true;
    },

    /**
     * 关闭
     */
    close(): void {
        this.setAbilityState('OpenableAbility:isOpen', false);
        this.visible = false;
    },
};
