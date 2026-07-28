import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const DAY_GRID_TPL: TplNode = {
    tag: 'div',
    cls: 'q-dtpanel__day-container',
    children: [
        {
            tag: 'div',
            name: 'weekdayRow',
            cls: 'q-dtpanel__weekday-row',
        },
        {
            tag: 'div',
            name: 'dayGrid',
            cls: 'q-dtpanel__day-grid',
        },
    ],
};

export const DAY_GRID_EVENTS: TplEvents = {
    dayGrid: { click: { handler: true, emits: ['daySelect'] } },
};
