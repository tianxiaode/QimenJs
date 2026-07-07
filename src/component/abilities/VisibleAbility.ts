/**
 * VisibleAbility 可见性能力
 *
 * 控制 el.style.display 实现显示/隐藏
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const VisibleAbility: AbilityDefinition = {
    /**
     * visible getter/setter
     */
    visible: {
        get(): boolean {
            return this.abilityState('VisibleAbility:visible', () => true);
        },
        set(value: boolean): void {
            this.setAbilityState('VisibleAbility:visible', value);
            if (this.el) {
                this.el.style.display = value ? '' : 'none';
            }
        },
    },

    /**
     * 显示组件
     */
    show(): void {
        this.visible = true;
    },

    /**
     * 隐藏组件
     */
    hide(): void {
        this.visible = false;
    },

    /**
     * 切换可见性
     */
    toggle(): void {
        this.visible = !this.visible;
    },
};
