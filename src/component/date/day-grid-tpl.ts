import type { TemplateDecl } from '@/component-core';

/** 日网格模板定义 */
export const DAY_GRID_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-dtpanel__day-container',
    children: [
        {
            tag: 'div',
            name: 'weekdayRow',
            classes: 'q-dtpanel__weekday-row',
        },
        {
            tag: 'div',
            name: 'dayGrid',
            classes: 'q-dtpanel__day-grid',
        },
    ],
};
