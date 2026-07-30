import type { TplNode } from '@/component-core/types/tpl-node-types';

export const TREE_NAV_ITEM_TPL: TplNode = {
    tag: 'div',
    cls: 'q-tree-nav-item',
    children: [
        {
            tag: 'div',
            name: 'content',
            cls: 'q-tree-nav-item__content',
            children: [
                { tag: 'i', name: 'icon', cls: 'q-tree-nav-item__icon' },
                { tag: 'span', name: 'text', cls: 'q-tree-nav-item__text' },
                { tag: 'span', name: 'expand', cls: 'q-tree-nav-item__expand' },
            ],
        },
        {
            tag: 'div',
            name: 'children',
            cls: 'q-tree-nav-item__children',
            hidden: true,
        },
    ],
};
