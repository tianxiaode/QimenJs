/**
 * LayoutAbility 布局能力
 *
 * 提供 gap/align/justify 属性，映射到 AtomicCSS class
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const LayoutAbility: AbilityDefinition = {
    /**
     * gap getter/setter
     */
    gap: {
        get(): string {
            return this.abilityState('LayoutAbility:gap', () => '');
        },
        set(value: string): void {
            const oldGap = this.gap;
            if (oldGap) this.removeClass(`q-gap-${oldGap}`);
            this.setAbilityState('LayoutAbility:gap', value);
            if (value) this.addClass(`q-gap-${value}`);
        },
    },

    /**
     * align getter/setter
     */
    align: {
        get(): string {
            return this.abilityState('LayoutAbility:align', () => '');
        },
        set(value: string): void {
            const oldAlign = this.align;
            if (oldAlign) this.removeClass(`q-items-${oldAlign}`);
            this.setAbilityState('LayoutAbility:align', value);
            if (value) this.addClass(`q-items-${value}`);
        },
    },

    /**
     * justify getter/setter
     */
    justify: {
        get(): string {
            return this.abilityState('LayoutAbility:justify', () => '');
        },
        set(value: string): void {
            const oldJustify = this.justify;
            if (oldJustify) this.removeClass(`q-justify-${oldJustify}`);
            this.setAbilityState('LayoutAbility:justify', value);
            if (value) this.addClass(`q-justify-${value}`);
        },
    },
};
