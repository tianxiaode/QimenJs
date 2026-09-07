import type { TemplateDecl } from '@/component-core';
import { DayGridComponent } from './DayGridComponent';

/** 日期面板模板定义 */
export const DATE_PANEL_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-dtpanel',
    children: [
        {
            tag: 'div',
            name: 'nav',
            classes: 'q-dtpanel__nav',
            children: [
                {
                    tag: 'button',
                    name: 'prevFieldBtn',
                    classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--prev',
                },
                {
                    tag: 'div',
                    name: 'dateNav',
                    classes: 'q-dtpanel__date-nav',
                    children: [
                        {
                            tag: 'button',
                            name: 'prev10y',
                            classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--prev',
                        },
                        {
                            tag: 'button',
                            name: 'prev1y',
                            classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--up',
                        },
                        {
                            tag: 'button',
                            name: 'prev1m',
                            classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--down',
                        },
                        { tag: 'span', name: 'dateLabel', classes: 'q-dtpanel__date-nav-label' },
                        {
                            tag: 'button',
                            name: 'next1m',
                            classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--up',
                        },
                        {
                            tag: 'button',
                            name: 'next1y',
                            classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--down',
                        },
                        {
                            tag: 'button',
                            name: 'next10y',
                            classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--next',
                        },
                    ],
                },
                {
                    tag: 'button',
                    name: 'confirmBtn',
                    classes:
                        'q-dtpanel__nav-btn q-dtpanel__nav-btn--confirm q-dtpanel__nav-confirm',
                },
                {
                    tag: 'button',
                    name: 'cancelBtn',
                    classes: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--cancel q-dtpanel__nav-cancel',
                },
            ],
        },
        {
            name: 'dayGrid',
            type: DayGridComponent,
        },
        {
            tag: 'div',
            name: 'quickRow',
            classes: 'q-dtpanel__quick-row',
            children: [
                {
                    tag: 'button',
                    name: 'yesterdayBtn',
                    classes: 'q-dtpanel__quick-btn',
                },
                { tag: 'button', name: 'todayBtn', classes: 'q-dtpanel__quick-btn' },
                {
                    tag: 'button',
                    name: 'tomorrowBtn',
                    classes: 'q-dtpanel__quick-btn',
                },
            ],
        },
    ],
};
