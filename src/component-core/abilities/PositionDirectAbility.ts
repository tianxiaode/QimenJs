/**
 * PositionDirectAbility — 直接操作 DOM 的属性
 *
 * 这些属性在 setter 中直接操作 DOM，不需要走 flush 流程：
 * visible, hideMode, focused, tabIndex
 */

import type { AbilityDefinition } from '@/composable';

export const PositionDirectAbility: AbilityDefinition = {
    // ── 隐藏模式 ──

    hideMode: {
        get() { return this.props.hideMode ?? 'display'; },
        set(v: 'display' | 'visibility' | 'opacity') { this.props.hideMode = v; },
    },

    // ── 显隐 ──

    visible: {
        get() { return this.props.visible ?? true; },
        set(v: boolean | string) {
            this.props.visible = v;
            if (typeof v === 'boolean') {
                const mode = this.props.hideMode ?? 'display';
                if (v) {
                    switch (mode) {
                        case 'display': this.el.style.display = ''; break;
                        case 'visibility': this.el.style.visibility = 'visible'; break;
                        case 'opacity': this.el.style.opacity = '1'; break;
                    }
                } else {
                    switch (mode) {
                        case 'display': this.el.style.display = 'none'; break;
                        case 'visibility': this.el.style.visibility = 'hidden'; break;
                        case 'opacity': this.el.style.opacity = '0'; break;
                    }
                }
            }
            // string 表达式 — TODO: 运行时求值
        },
    },

    // ── 焦点 ──

    focused: {
        get() { return this.props.focused ?? false; },
        set(v: boolean) { this.props.focused = v; if (v) this.el.focus(); },
    },

    // ── 其他 ──

    tabIndex: {
        get() { return this.props.tabIndex; },
        set(v: number | undefined) { this.props.tabIndex = v; if (v !== undefined) this.el.tabIndex = v; },
    },
};
