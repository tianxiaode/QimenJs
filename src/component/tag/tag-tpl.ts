import type { TemplateDecl } from '@/component-core';

/** 标签模板定义 */
export const TAG_TPL: TemplateDecl = {
    tag: 'span',
    classes: 'q-tag',
    children: [
        { tag: 'i', name: 'icon', classes: 'q-tag__icon hidden' },
        { tag: 'span', name: 'text', classes: 'q-tag__text' },
        { tag: 'span', name: 'closeBtn', classes: 'q-tag__close hidden' },
    ],
};