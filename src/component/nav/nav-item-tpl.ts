import type { TemplateDecl } from '@/component-core';

export const NAV_ITEM_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-nav-item',
    children: [
        {
            tag: 'div',
            name: 'content',
            classes: 'q-nav-item__content',
            children: [
                { tag: 'i', name: 'icon', classes: 'q-nav-item__icon' },
                { tag: 'span', name: 'text', classes: 'q-nav-item__text' },
                { tag: 'span', name: 'expand', classes: 'q-nav-item__expand' },
            ],
        },
    ],
};
