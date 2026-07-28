import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

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
        { tag: 'div', name: 'items', cls: 'q-indicator__items' },
        {
            tag: 'div',
            name: 'nextBtn',
            cls: 'q-indicator__arrow q-indicator__arrow--next',
            hidden: true,
        },
    ],
};

export const INDICATOR_EVENTS: TplEvents = {
    prevBtn: { click: { handler: true } },
    nextBtn: { click: { handler: true } },
};
