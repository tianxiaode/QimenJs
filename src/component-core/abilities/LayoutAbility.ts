/**
 * LayoutAbility — 布局能力
 *
 * 根据 layout 属性值自动为根元素添加对应的 CSS 类，
 * 支持 fit / hbox / vbox / grid / center 五种布局模式。
 *
 * setter 只写 this.props + this.markDirty(key)，
 * flushLayout() 由 TemplateComponent.flush() 调用。
 */

import type { AbilityDefinition } from '@/composable';

export const LAYOUT_FIT = 'fit';
export const LAYOUT_HBOX = 'hbox';
export const LAYOUT_VBOX = 'vbox';
export const LAYOUT_GRID = 'grid';
export const LAYOUT_CENTER = 'center';

export type LayoutType = typeof LAYOUT_FIT | typeof LAYOUT_HBOX | typeof LAYOUT_VBOX | typeof LAYOUT_GRID | typeof LAYOUT_CENTER;

const LAYOUT_CLASS_MAP: Record<LayoutType, string> = {
    [LAYOUT_FIT]: 'layout-fit',
    [LAYOUT_HBOX]: 'layout-hbox',
    [LAYOUT_VBOX]: 'layout-vbox',
    [LAYOUT_GRID]: 'layout-grid',
    [LAYOUT_CENTER]: 'layout-center',
};

export const LayoutAbility: AbilityDefinition = {
    flushLayout() {
        const dirty = this.dirtySet;
        if (!dirty.has('layout')) return;

        const value = this.props.layout;
        const el = this.el;

        // 移除旧的布局类
        for (const cls of Object.values(LAYOUT_CLASS_MAP)) {
            el.classList.remove(cls);
        }

        // 添加新的布局类
        if (value && value in LAYOUT_CLASS_MAP) {
            el.classList.add(LAYOUT_CLASS_MAP[value as LayoutType]);
        }
    },

    // ── LayoutProps ──

    layout: {
        get() { return this.props.layout; },
        set(v: LayoutType | undefined) { this.setProp('layout', v); },
    },
};
