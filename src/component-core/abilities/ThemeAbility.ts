/**
 * ThemeAbility 主题感知能力
 *
 * 主题切换的核心机制是 CSS 变量，:root 更新后所有组件自动生效，零 JS 开销。
 * 只有组件类声明了 static themeAware = true 的才会注册 GlobalEventBus 监听器，
 * 避免所有组件都注册监听导致事件风暴。
 *
 * @example
 * ```typescript
 * // 组件类声明
 * class ButtonComponent extends ComponentBase {
 *     static themeAware = true;
 *
 *     onThemeChange(event) {
 *         // 主题切换时重新计算样式
 *     }
 * }
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { globalEventBus } from '@qimenjs/events';
import { THEME_CHANGE_EVENT } from '@qimenjs/theme';

export const ThemeAbility: AbilityDefinition = {
    /**
     * 初始化主题感知
     *
     * 读取组件类的 static themeAware，为 true 时注册 GlobalEventBus 监听器。
     * 未声明或为 false 的组件完全零开销（CSS 变量已自动生效）。
     */
    __init__: '_initTheme',

    _initTheme(): void {
        const themeAware = (this.constructor as any).themeAware;
        if (!themeAware) return;

        const off = globalEventBus.on(THEME_CHANGE_EVENT, (event: any) => {
            if (typeof this.onThemeChange === 'function') {
                this.onThemeChange(event);
            }
        });

        this.onCleanup(off);
    },
};
