import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const TOGGLE_ICON_TPL: TplNode = {
    tag: 'div',
    cls: 'q-toggle-icon',
    children: [{ tag: 'i', name: 'icon', cls: 'q-toggle-icon__icon' }],
};

export const TOGGLE_ICON_EVENTS: TplEvents = {
    '': { click: { handler: true, emits: ['toggle'] } },
};
