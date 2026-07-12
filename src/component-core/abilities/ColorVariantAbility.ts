/**
 * ColorVariantAbility — 语义颜色变体能力
 *
 * 为组件提供两个颜色属性：
 * - colorVariant：设置语义变体，同时应用背景色 + 前景色（全套）
 * - colorVariantText：仅设置前景色，不改背景色
 *
 * 前景色自动搭配，无需手动配置。
 *
 * @example
 * ```typescript
 * // 全套：背景 + 前景
 * component.colorVariant = 'error';  // 背景变红，文字变白
 *
 * // 仅前景色
 * component.colorVariantText = 'error';  // 只改文字为 on-error 色，背景不变
 * ```
 *
 * @example
 * ```typescript
 * // LayoutNode 声明式
 * { type: 'Toast', colorVariant: 'success' }           // 全套
 * { type: 'Label', colorVariantText: 'error' }          // 仅前景色
 * ```
 */

import type { AbilityDefinition } from '@/composable';
import { COLOR_VARIANT_MAP, type ColorVariant } from '@qimenjs/theme';

export type ColorVariantKey = 'colorVariant' | 'colorVariantText';

export const ColorVariantAbility: AbilityDefinition = {
    // ── flush ──

    flushColorVariant(): void {
        const variant: ColorVariant | undefined = this.props.colorVariant;
        if (variant !== undefined) {
            const mapping = COLOR_VARIANT_MAP[variant];
            if (mapping) {
                this.el.style.setProperty('background-color', `var(${mapping.bg})`);
                this.el.style.setProperty('color', `var(${mapping.fg})`);
            }
        }

        const textVariant: ColorVariant | undefined = this.props.colorVariantText;
        if (textVariant !== undefined) {
            const mapping = COLOR_VARIANT_MAP[textVariant];
            if (mapping) {
                this.el.style.setProperty('color', `var(${mapping.fg})`);
            }
        }
    },

    // ── getter/setter ──

    colorVariant: {
        get(): ColorVariant | undefined { return this.props.colorVariant; },
        set(v: ColorVariant) { this.setProp('colorVariant', v); },
    },

    colorVariantText: {
        get(): ColorVariant | undefined { return this.props.colorVariantText; },
        set(v: ColorVariant) { this.setProp('colorVariantText', v); },
    },
};
