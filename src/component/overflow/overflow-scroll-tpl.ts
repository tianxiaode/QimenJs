import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const OVERFLOW_SCROLL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-overflow-scroll-overlay',
    children: [
        {
            tag: 'div',
            name: 'prevIcon',
            cls: 'q-overflow-arrow q-overflow-arrow--prev',
            hidden: true,
        },
        {
            tag: 'div',
            name: 'nextIcon',
            cls: 'q-overflow-arrow q-overflow-arrow--next',
            hidden: true,
        },
    ],
};

export const OVERFLOW_SCROLL_EVENTS: TplEvents = {
    prevIcon: { click: { handler: true } },
    nextIcon: { click: { handler: true } },
};
