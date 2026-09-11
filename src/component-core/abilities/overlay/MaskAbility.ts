/**
 * MaskAbility — 遮罩能力
 *
 * 为浮动组件提供遮罩层管理。通过 mask option 控制是否显示遮罩：
 * - false/null — 不显示遮罩
 * - true — 显示全局遮罩
 * - 'scoped' — 显示 scoped 遮罩（只覆盖 anchor 区域）
 * - { color, scoped } — 自定义遮罩
 *
 * 浮动组件通过 OverlayAbility.show() 自动联动 showMask()，
 * hide() 自动联动 hideMask()，无需手动调用。
 *
 * @example
 * // 在组件 options 中声明
 * mask: true
 * mask: 'scoped'
 * mask: { color: 'rgba(0,0,0,0.5)', scoped: true }
 */

import type { AbilityDefinition } from '@/composable';
import { MaskComponent } from '../../overlay/mask';

export const MaskAbility: AbilityDefinition = {
    _onMaskOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (!this._templateInitialized) return;

        if (value) {
            this._initMask();
        } else {
            this._disposeMask();
        }
    },

    _initMask(): void {
        const existing = this.abilityState('MaskAbility:instance');
        if (existing) return;

        const maskOption = this.mask;
        let scoped = false;
        let color: string | undefined;

        if (typeof maskOption === 'string') {
            scoped = maskOption === 'scoped';
        } else if (typeof maskOption === 'object' && maskOption !== null) {
            scoped = maskOption.scoped ?? false;
            color = maskOption.color;
        }

        const zIndex = this.el?.style.zIndex ? Number(this.el.style.zIndex) - 1 : 1;
        const mask = new MaskComponent({ scoped, color, zIndex });
        mask.mount();
        mask.hide();
        this.setAbilityState('MaskAbility:instance', mask);
        this.onCleanup(() => this._disposeMask());
    },

    _disposeMask(): void {
        const mask = this.abilityState('MaskAbility:instance');
        if (mask) {
            mask.dispose();
            this.setAbilityState('MaskAbility:instance', null);
        }
    },

    showMask(): void {
        const mask = this.abilityState('MaskAbility:instance');
        if (mask) {
            mask.show();
            const anchor = this.anchor;
            if (anchor) {
                mask.updatePosition(anchor.getBoundingClientRect());
            }
        }
    },

    hideMask(): void {
        const mask = this.abilityState('MaskAbility:instance');
        if (mask) {
            mask.hide();
        }
    },

    updateMaskPosition(anchor?: HTMLElement): void {
        const mask = this.abilityState('MaskAbility:instance');
        if (mask) {
            const actualAnchor = anchor ?? this.anchor;
            if (actualAnchor) {
                mask.updatePosition(actualAnchor.getBoundingClientRect());
            }
        }
    },
} satisfies AbilityDefinition;
