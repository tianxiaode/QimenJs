import type { TplNode } from '@/component-core/types/tpl-node-types';

export const ITEMGROUP_BASE_TPL: TplNode = {
    tag: 'div',
    cls: 'q-itemgroup',
    children: [
        {
            tag: 'div',
            name: 'overflowPrev',
            cls: 'q-itemgroup__overflow-prev',
            hidden: true,
        },
        { tag: 'div', name: 'itemContainer', cls: 'q-itemgroup__items' },
        {
            tag: 'div',
            name: 'overflowNext',
            cls: 'q-itemgroup__overflow-next',
            hidden: true,
        },
        {
            tag: 'div',
            name: 'overflowMore',
            cls: 'q-itemgroup__overflow-more',
            hidden: true,
        },
    ],
};
