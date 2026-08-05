/**
 * Tab 单个标签模板
 *
 * 结构：icon + label + close（可选）
 */

import type { TplNode } from '@/component-core';

/** 标签页模板定义 */
export const TAB_TPL: TplNode = {
    tag: 'div',
    cls: 'q-tab',
    attrs: { role: 'tab' },
    children: [
        { tag: 'span', name: 'icon', cls: 'q-tab__icon', hidden: true },
        { tag: 'span', name: 'label', cls: 'q-tab__label' },
        { tag: 'span', name: 'close', cls: 'q-tab__close', hidden: true },
    ],
};
