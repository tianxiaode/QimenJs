import type { TplNode } from '@/component-core/types/tpl-node-types';

export const INDICATOR_TPL: TplNode = {
    tag: 'div',
    cls: 'q-indicator',
    children: [
        {
            tag: 'div',
            name: 'prevBtn',
            cls: 'q-indicator__arrow q-indicator__arrow--prev',
            hidden: true,
        },
        { tag: 'div', name: 'itemContainer', cls: 'q-indicator__items' },
        {
            tag: 'div',
            name: 'nextBtn',
            cls: 'q-indicator__arrow q-indicator__arrow--next',
            hidden: true,
        },
    ],
};
