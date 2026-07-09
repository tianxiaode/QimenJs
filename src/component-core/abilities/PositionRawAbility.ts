/**
 * PositionRawAbility — 原始值属性
 *
 * 处理直接赋值到 style 的属性（无需 px 转换）：
 * margin, padding, shadow, zIndex
 *
 * setter 只写 this.props + this.markDirty(key)，
 * flushPositionRaw() 由 ComponentBase.flush() 调用。
 */

import type { AbilityDefinition } from '@/composable';

type RawKey = 'margin' | 'padding' | 'shadow' | 'zIndex';

const RAW_MAP: Record<RawKey, string> = {
    margin: 'margin', padding: 'padding',
    shadow: 'boxShadow', zIndex: 'zIndex',
};

export const PositionRawAbility: AbilityDefinition = {
    flushPositionRaw() {
        const dirty = this.dirtySet;
        const p = this.props;
        const s = this.el.style;

        for (const key in RAW_MAP) {
            if (!dirty.has(key)) continue;

            const value = p[key];
            if (value === undefined) continue;

            (s as any)[RAW_MAP[key as RawKey]] = key === 'zIndex' ? String(value) : value;
        }
    },

    // ── 间距 ──

    margin: {
        get() { return this.props.margin; },
        set(v: string | undefined) { this.props.margin = v; this.markDirty('margin'); },
    },

    padding: {
        get() { return this.props.padding; },
        set(v: string | undefined) { this.props.padding = v; this.markDirty('padding'); },
    },

    // ── 视觉 ──

    shadow: {
        get() { return this.props.shadow; },
        set(v: string | undefined) { this.props.shadow = v; this.markDirty('shadow'); },
    },

    // ── 层叠 ──

    zIndex: {
        get() { return this.props.zIndex; },
        set(v: number | undefined) { this.props.zIndex = v; this.markDirty('zIndex'); },
    },
};
