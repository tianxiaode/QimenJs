import type { TemplateDecl } from '@/component-core';

/** 切换模板定义 */
export const TOGGLE_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-toggle',
    children: [
        { tag: 'i', name: 'icon', classes: 'q-toggle__icon hidden' },
        { tag: 'span', name: 'text', classes: 'q-toggle__text' },
    ],
};