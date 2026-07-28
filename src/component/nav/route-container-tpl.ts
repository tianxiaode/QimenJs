import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const ROUTE_CONTAINER_TPL: TplNode = {
    tag: 'div',
    cls: 'q-route-container',
    children: [{ tag: 'div', name: 'content', cls: 'q-route-container__content' }],
};

export const ROUTE_CONTAINER_EVENTS: TplEvents = {};
