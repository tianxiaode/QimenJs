import type { TplNode } from '@/component-core/types/tpl-node-types';

export const NAV_ITEM_TPL: TplNode = {
    tag: 'div',
    cls: 'q-nav-item',
    children: [
        {
            tag: 'div',
            name: 'content',
            cls: 'q-nav-item__content',
            children: [
                { tag: 'i', name: 'icon', cls: 'q-nav-item__icon' },
                { tag: 'span', name: 'text', cls: 'q-nav-item__text' },
                { tag: 'span', name: 'expand', cls: 'q-nav-item__expand' },
            ],
        },
    ],
};
