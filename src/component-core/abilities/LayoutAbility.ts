/**
 * LayoutAbility — 布局能力
 *
 * 提供语义化的布局快捷方式，组件只需声明 layout 属性即可获得布局能力。
 * 自动生成内联 flex 样式，不依赖外部 CSS。
 *
 * 支持：
 * - layout: 'hbox' | 'vbox' | 'fit' | 'grid' | 'center'
 * - gap: 数值或字符串（如 8, '8px', '1rem'）
 * - align: 'start' | 'center' | 'end' | 'stretch'
 * - pack: 'start' | 'center' | 'end' | 'between' | 'around'
 * - wrap: true | false
 * - flex: 字符串（如 '1', '0 0 200px'）
 *
 * @example
 * ```ts
 * // 水平布局，间距8px，垂直居中
 * { layout: 'hbox', gap: 8, align: 'center' }
 *
 * // 垂直布局，两端对齐
 * { layout: 'vbox', pack: 'between' }
 *
 * // 自适应填充
 * { layout: 'fit' }
 * ```
 */

import type { AbilityDefinition } from '@/composable';

// ─── 布局类型 ───

export const LAYOUT_FIT = 'fit';
export const LAYOUT_HBOX = 'hbox';
export const LAYOUT_VBOX = 'vbox';
export const LAYOUT_GRID = 'grid';
export const LAYOUT_CENTER = 'center';

export type LayoutType = typeof LAYOUT_FIT | typeof LAYOUT_HBOX | typeof LAYOUT_VBOX | typeof LAYOUT_GRID | typeof LAYOUT_CENTER;

// ─── 对齐/分布映射 ───

const ALIGN_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
};

const PACK_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
};

// ─── 工具函数 ───

function toGapValue(v: number | string | undefined): string | undefined {
    if (v === undefined) return undefined;
    if (typeof v === 'number') return `${v}px`;
    return v;
}

// ─── Ability 定义 ───

export const LayoutAbility: AbilityDefinition = {
    flushLayout(): void {
        const dirty = this.dirtySet;
        if (!dirty.has('layout') && !dirty.has('gap') && !dirty.has('align') &&
            !dirty.has('pack') && !dirty.has('wrap') && !dirty.has('flex')) return;

        const el = this.el;
        if (!el) return;

        const layout = this.props.layout;
        const gap = toGapValue(this.props.gap);
        const align = this.props.align;
        const pack = this.props.pack;
        const wrap = this.props.wrap;
        const flex = this.props.flex;

        // ─── fit: 绝对定位填满父容器 ───
        if (layout === LAYOUT_FIT) {
            el.style.position = 'relative';
            // 子元素需要绝对定位，通过 CSS 类处理
            el.classList.add('layout-fit');
            el.classList.remove('layout-hbox', 'layout-vbox', 'layout-grid', 'layout-center');
            el.style.removeProperty('display');
            el.style.removeProperty('flex-direction');
            el.style.removeProperty('gap');
            el.style.removeProperty('align-items');
            el.style.removeProperty('justify-content');
            el.style.removeProperty('flex-wrap');
            return;
        }

        // ─── center: 居中 ───
        if (layout === LAYOUT_CENTER) {
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.classList.remove('layout-fit', 'layout-hbox', 'layout-vbox', 'layout-grid', 'layout-center');
            el.classList.add('layout-center');
            if (gap) el.style.gap = gap; else el.style.removeProperty('gap');
            el.style.removeProperty('flex-direction');
            el.style.removeProperty('flex-wrap');
            return;
        }

        // ─── hbox / vbox / grid: flex 布局 ───
        el.classList.remove('layout-fit', 'layout-hbox', 'layout-vbox', 'layout-grid', 'layout-center');

        if (layout === LAYOUT_HBOX || layout === LAYOUT_VBOX || layout === LAYOUT_GRID) {
            el.style.display = 'flex';
            el.classList.add(`layout-${layout}`);

            // 方向
            if (layout === LAYOUT_HBOX) {
                el.style.flexDirection = 'row';
            } else if (layout === LAYOUT_VBOX) {
                el.style.flexDirection = 'column';
            } else {
                el.style.flexDirection = 'row';
                el.style.flexWrap = 'wrap';
            }

            // 间距
            if (gap) {
                el.style.gap = gap;
            } else {
                el.style.removeProperty('gap');
            }

            // 对齐（交叉轴）
            if (align && ALIGN_MAP[align]) {
                el.style.alignItems = ALIGN_MAP[align];
            } else {
                el.style.removeProperty('align-items');
            }

            // 分布（主轴）
            if (pack && PACK_MAP[pack]) {
                el.style.justifyContent = PACK_MAP[pack];
            } else {
                el.style.removeProperty('justify-content');
            }

            // 换行
            if (wrap !== undefined) {
                el.style.flexWrap = wrap ? 'wrap' : 'nowrap';
            } else if (layout !== LAYOUT_GRID) {
                el.style.removeProperty('flex-wrap');
            }

            return;
        }

        // ─── 无布局：清除所有布局样式 ───
        el.classList.remove('layout-fit', 'layout-hbox', 'layout-vbox', 'layout-grid', 'layout-center');
        el.style.removeProperty('display');
        el.style.removeProperty('flex-direction');
        el.style.removeProperty('gap');
        el.style.removeProperty('align-items');
        el.style.removeProperty('justify-content');
        el.style.removeProperty('flex-wrap');
    },

    // ─── LayoutProps ───

    layout: {
        get() { return this.props.layout; },
        set(v: LayoutType | undefined) { this.setProp('layout', v); },
    },

    gap: {
        get() { return this.props.gap; },
        set(v: number | string | undefined) { this.setProp('gap', v); },
    },

    align: {
        get() { return this.props.align; },
        set(v: string | undefined) { this.setProp('align', v); },
    },

    pack: {
        get() { return this.props.pack; },
        set(v: string | undefined) { this.setProp('pack', v); },
    },

    wrap: {
        get() { return this.props.wrap; },
        set(v: boolean | undefined) { this.setProp('wrap', v); },
    },

    flex: {
        get() { return this.props.flex; },
        set(v: string | undefined) { this.setProp('flex', v); },
    },
};
