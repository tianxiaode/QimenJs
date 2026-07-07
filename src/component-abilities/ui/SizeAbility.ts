/**
 * SizeAbility 尺寸能力
 *
 * 设置组件尺寸（sm/md/lg），添加 BEM class
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const SizeAbility: AbilityDefinition = {
    /**
     * size getter/setter
     */
    size: {
        get(): string {
            return this.abilityState('SizeAbility:size', () => 'md');
        },
        set(value: string): void {
            const oldSize = this.size;
            this.setAbilityState('SizeAbility:size', value);

            if (this.el) {
                // 移除旧尺寸 class
                if (oldSize) {
                    this.removeClass(`q-${this.type}--${oldSize}`);
                }
                // 添加新尺寸 class
                this.addClass(`q-${this.type}--${value}`);
            }
        },
    },
};
