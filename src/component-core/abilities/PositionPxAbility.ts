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
        set(v: number) { this.setProp('x', v); },
    },

    y: {
        get() { return this.props.y ?? 0; },
        set(v: number) { this.setProp('y', v); },
    },

    top: {
        get() { return this.props.top; },
        set(v: number | undefined) { this.setProp('top', v); },
    },

    left: {
        get() { return this.props.left; },
        set(v: number | undefined) { this.setProp('left', v); },
    },

    bottom: {
        get() { return this.props.bottom; },
        set(v: number | undefined) { this.setProp('bottom', v); },
    },

    right: {
        get() { return this.props.right; },
        set(v: number | undefined) { this.setProp('right', v); },
    },

    // ── 尺寸 ──

    width: {
        get() { return this.props.width; },
        set(v: number | undefined) { this.setProp('width', v); },
    },

    height: {
        get() { return this.props.height; },
        set(v: number | undefined) { this.setProp('height', v); },
    },

    // ── 约束 ──

    minWidth: {
        get() { return this.props.minWidth; },
        set(v: number | undefined) { this.setProp('minWidth', v); },
    },

    maxWidth: {
        get() { return this.props.maxWidth; },
        set(v: number | undefined) { this.setProp('maxWidth', v); },
    },

    minHeight: {
        get() { return this.props.minHeight; },
        set(v: number | undefined) { this.setProp('minHeight', v); },
    },

    maxHeight: {
        get() { return this.props.maxHeight; },
        set(v: number | undefined) { this.setProp('maxHeight', v); },
    },
};
