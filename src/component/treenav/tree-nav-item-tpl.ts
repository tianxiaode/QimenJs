import type { TemplateDecl } from '@/component-core';

export const TREE_NAV_ITEM_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-tree-nav-item',
    children: [
        {
            tag: 'div',
            name: 'content',
            classes: 'q-tree-nav-item__content',
            children: [
                { tag: 'i', name: 'icon', classes: 'q-tree-nav-item__icon' },
                { tag: 'span', name: 'text', classes: 'q-tree-nav-item__text' },
                { tag: 'span', name: 'expand', classes: 'q-tree-nav-item__expand' },
            ],
        },
        { tag: 'div', name: 'children', classes: 'q-tree-nav-item__children hidden' },
    ],
};
