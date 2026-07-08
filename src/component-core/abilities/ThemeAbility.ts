/**
 * ThemeAbility 主题感知能力
 *
 * 组件自动感知主题变更，监听 ThemeManager 的 theme:change 事件
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { ThemeManager } from '@qimenjs/theme';

export const ThemeAbility: AbilityDefinition = {
    /**
     * 初始化主题感知
     *
     * 监听 ThemeManager 的 theme:change 事件，调用组件的 onThemeChange() 方法
     */
    __init__: '_initTheme',

    _initTheme(): void {
        const tm = ThemeManager.getInstance();

        const off = tm.onThemeChange((event: any) => {
            if (typeof this.onThemeChange === 'function') {
                this.onThemeChange(event);
            }
        });

        // 组件销毁时自动解绑
        this.onCleanup(off);
    },
};
