/**
 * PositionBoolAbility — 布尔属性
 *
 * 处理布尔类型的布局/视觉属性：
 * scrollable, center, alwaysOnTop, fullscreen
 *
 * setter 只写 this.props + this.markDirty(key)，
 * flushPositionBool() 由 ComponentBase.flush() 调用。
 */

import type { AbilityDefinition } from '@/composable';

type BoolKey = 'scrollable' | 'center' | 'alwaysOnTop' | 'fullscreen';

const BOOL_HANDLERS: Record<BoolKey, (el: HTMLElement, v: boolean) => void> = {
    scrollable: (el, v) => { el.style.overflow = v ? 'auto' : 'hidden'; },
    center: (el, v) => {
        if (v) { el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.justifyContent = 'center'; }
    },
    alwaysOnTop: (el, v) => { if (v) el.style.zIndex = '9999'; },
    fullscreen: (el, v) => {
        if (v) { el.style.position = 'fixed'; el.style.inset = '0'; el.style.width = '100%'; el.style.height = '100%'; }
    },
};

export const PositionBoolAbility: AbilityDefinition = {
    flushPositionBool() {
        const dirty = this.dirtySet;
        const p = this.props;

        for (const key in BOOL_HANDLERS) {
            if (!dirty.has(key)) continue;

            const value = p[key];
            if (value === undefined) continue;

            BOOL_HANDLERS[key as BoolKey](this.el, value);
        }
    },

    // ── 滚动 ──

    scrollable: {
        get() { return this.props.scrollable ?? false; },
        set(v: boolean) { this.setProp('scrollable', v); },
    },

    // ── 居中 ──

    center: {
        get() { return this.props.center ?? false; },
        set(v: boolean) { this.setProp('center', v); },
    },

    // ── 层叠与全屏 ──

    alwaysOnTop: {
        get() { return this.props.alwaysOnTop ?? false; },
        set(v: boolean) { this.setProp('alwaysOnTop', v); },
    },

    fullscreen: {
        get() { return this.props.fullscreen ?? false; },
        set(v: boolean) { this.setProp('fullscreen', v); },
    },
};
