/**
 * PositionPxAbility — px 数值定位/尺寸属性
 *
 * 处理需要转换为 px 单位的定位和尺寸属性：
 * x, y, top, left, bottom, right,
 * width, height, minWidth, maxWidth, minHeight, maxHeight
 *
 * setter 只写 this.props + this.markDirty(key)，
 * flushPositionPx() 由 ComponentBase.flush() 调用。
 */

import type { AbilityDefinition } from '@/composable';

type PxKey = 'x' | 'y' | 'top' | 'left' | 'bottom' | 'right' | 'width' | 'height'
    | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight';

const PX_MAP: Record<PxKey, string> = {
    x: 'left', y: 'top',
    top: 'top', left: 'left', bottom: 'bottom', right: 'right',
    width: 'width', height: 'height',
    minWidth: 'minWidth', maxWidth: 'maxWidth',
    minHeight: 'minHeight', maxHeight: 'maxHeight',
};

export const PositionPxAbility: AbilityDefinition = {
    flushPositionPx() {
        const dirty = this.dirtySet;
        const p = this.props;
        const s = this.el.style;

        for (const key in PX_MAP) {
            if (!dirty.has(key)) continue;

            const value = p[key];
            if (value === undefined) continue;

            (s as any)[PX_MAP[key as PxKey]] = `${value}px`;
        }
    },

    // ── 定位 ──

    x: {
        get() { return this.props.x ?? 0; },
        set(v: number) { this.props.x = v; this.markDirty('x'); },
    },

    y: {
        get() { return this.props.y ?? 0; },
        set(v: number) { this.props.y = v; this.markDirty('y'); },
    },

    top: {
        get() { return this.props.top; },
        set(v: number | undefined) { this.props.top = v; this.markDirty('top'); },
    },

    left: {
        get() { return this.props.left; },
        set(v: number | undefined) { this.props.left = v; this.markDirty('left'); },
    },

    bottom: {
        get() { return this.props.bottom; },
        set(v: number | undefined) { this.props.bottom = v; this.markDirty('bottom'); },
    },

    right: {
        get() { return this.props.right; },
        set(v: number | undefined) { this.props.right = v; this.markDirty('right'); },
    },

    // ── 尺寸 ──

    width: {
        get() { return this.props.width; },
        set(v: number | undefined) { this.props.width = v; this.markDirty('width'); },
    },

    height: {
        get() { return this.props.height; },
        set(v: number | undefined) { this.props.height = v; this.markDirty('height'); },
    },

    // ── 约束 ──

    minWidth: {
        get() { return this.props.minWidth; },
        set(v: number | undefined) { this.props.minWidth = v; this.markDirty('minWidth'); },
    },

    maxWidth: {
        get() { return this.props.maxWidth; },
        set(v: number | undefined) { this.props.maxWidth = v; this.markDirty('maxWidth'); },
    },

    minHeight: {
        get() { return this.props.minHeight; },
        set(v: number | undefined) { this.props.minHeight = v; this.markDirty('minHeight'); },
    },

    maxHeight: {
        get() { return this.props.maxHeight; },
        set(v: number | undefined) { this.props.maxHeight = v; this.markDirty('maxHeight'); },
    },
};
