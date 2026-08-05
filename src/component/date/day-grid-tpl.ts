import type { TplNode } from '@/component-core';

/** 日网格模板定义 */
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
