import type { TplNode } from '@/component-core';

export const DATE_PANEL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-dtpanel',
    children: [
        {
            tag: 'div',
            name: 'nav',
            cls: 'q-dtpanel__nav',
            children: [
                {
                    tag: 'button',
                    name: 'prevFieldBtn',
                    cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--prev',
                },
                {
                    tag: 'div',
                    name: 'dateNav',
                    cls: 'q-dtpanel__date-nav',
                    children: [
                        {
                            tag: 'button',
                            name: 'prev10y',
                            cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--prev',
                        },
                        {
                            tag: 'button',
                            name: 'prev1y',
                            cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--up',
                        },
                        {
                            tag: 'button',
                            name: 'prev1m',
                            cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--down',
                        },
                        { tag: 'span', name: 'dateLabel', cls: 'q-dtpanel__date-nav-label' },
                        {
                            tag: 'button',
                            name: 'next1m',
                            cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--up',
                        },
                        {
                            tag: 'button',
                            name: 'next1y',
                            cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--down',
                        },
                        {
                            tag: 'button',
                            name: 'next10y',
                            cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--next',
                        },
                    ],
                },
                {
                    tag: 'button',
                    name: 'confirmBtn',
                    cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--confirm q-dtpanel__nav-confirm',
                },
                {
                    tag: 'button',
                    name: 'cancelBtn',
                    cls: 'q-dtpanel__nav-btn q-dtpanel__nav-btn--cancel q-dtpanel__nav-cancel',
                },
            ],
        },
        {
            name: 'dayGrid',
            type: 'DayGrid',
        },
        {
            tag: 'div',
            name: 'quickRow',
            cls: 'q-dtpanel__quick-row',
            children: [
                {
                    tag: 'button',
                    name: 'yesterdayBtn',
                    cls: 'q-dtpanel__quick-btn',
                    i18n: 'yesterday',
                },
                { tag: 'button', name: 'todayBtn', cls: 'q-dtpanel__quick-btn', i18n: 'today' },
                {
                    tag: 'button',
                    name: 'tomorrowBtn',
                    cls: 'q-dtpanel__quick-btn',
                    i18n: 'tomorrow',
                },
            ],
        },
    ],
};
