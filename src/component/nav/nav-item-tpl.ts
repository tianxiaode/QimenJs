import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

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

export const NAV_ITEM_EVENTS: TplEvents = {
    '': { enter: { handler: true }, leave: { handler: true } },
    content: { click: { handler: true, emits: ['click'] } },
};
