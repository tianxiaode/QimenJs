/**
 * StyleAbility — 样式属性
 *
 * 只处理 StyleProps（className / style），
 * PositionProps 的 flush 已拆分到 PositionPxAbility / PositionRawAbility / PositionBoolAbility 中。
 *
 * setter 只写 this.props + this.markDirty(key)，
 * flushStyle() 由 ComponentBase.flush() 调用，只处理 dirtySet 中自己负责的脏 key。
 */

import type { AbilityDefinition } from '@/composable';

export const StyleAbility: AbilityDefinition = {
    flushStyle() {
        const dirty = this.dirtySet;
        const p = this.props;

        if (dirty.has('className')) {
            const value = p.className;
            if (value !== undefined) this.el.className = value;
        }

        if (dirty.has('style')) {
            const value = p.style;
            if (typeof value === 'string') {
                this.el.style.cssText = value;
            } else if (value) {
                Object.assign(this.el.style, value);
            }
        }
    },

    // ── StyleProps ──

    className: {
        get() { return this.props.className ?? ''; },
        set(v: string) { this.props.className = v; this.markDirty('className'); },
    },

    style: {
        get() { return this.props.style; },
        set(v: Record<string, string> | string | undefined) { this.props.style = v; this.markDirty('style'); },
    },
};
