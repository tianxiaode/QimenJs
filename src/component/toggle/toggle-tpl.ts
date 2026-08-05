import type { TplNode } from '@/component-core';

/** 切换模板定义 */
export const TOGGLE_TPL: TplNode = {
    tag: 'div',
    cls: 'q-toggle',
    children: [
        { tag: 'i', name: 'icon', cls: 'q-toggle__icon', hidden: true },
        { tag: 'span', name: 'text', cls: 'q-toggle__text' },
    ],
};
