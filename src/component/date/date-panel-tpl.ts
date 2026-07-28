import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const DATE_PANEL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-dtpanel',
    children: [
        {
            tag: 'div',
            name: 'nav',
            cls: 'q-dtpanel__nav',
            children: [
                { tag: 'button', name: 'backBtn', cls: 'q-dtpanel__nav-btn', i18n: 'back' },
                {
                    tag: 'div',
                    name: 'dateNav',
                    cls: 'q-dtpanel__date-nav',
                    children: [
                        {
                            tag: 'button',
                            name: 'prev10y',
                            cls: 'q-dtpanel__nav-btn',
                            i18n: 'prev10y',
                        },
                        {
                            tag: 'button',
                            name: 'prev1y',
                            cls: 'q-dtpanel__nav-btn',
                            i18n: 'prev1y',
                        },
                        {
                            tag: 'button',
                            name: 'prev1m',
                            cls: 'q-dtpanel__nav-btn',
                            i18n: 'prev1m',
                        },
                        { tag: 'span', name: 'dateLabel', cls: 'q-dtpanel__date-nav-label' },
                        {
                            tag: 'button',
                            name: 'next1m',
                            cls: 'q-dtpanel__nav-btn',
                            i18n: 'next1m',
                        },
                        {
                            tag: 'button',
                            name: 'next1y',
                            cls: 'q-dtpanel__nav-btn',
                            i18n: 'next1y',
                        },
                        {
                            tag: 'button',
                            name: 'next10y',
                            cls: 'q-dtpanel__nav-btn',
                            i18n: 'next10y',
                        },
                    ],
                },
                {
                    tag: 'button',
                    name: 'confirmBtn',
                    cls: 'q-dtpanel__nav-btn q-dtpanel__nav-confirm',
                    i18n: 'confirm',
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

export const DATE_PANEL_EVENTS: TplEvents = {
    backBtn: { click: { handler: true } },
    confirmBtn: { click: { handler: true, emits: ['confirm'] } },
    prev10y: { click: { handler: true } },
    prev1y: { click: { handler: true } },
    prev1m: { click: { handler: true } },
    next1m: { click: { handler: true } },
    next1y: { click: { handler: true } },
    next10y: { click: { handler: true } },
    yesterdayBtn: { click: { handler: true, emits: ['daySelect'] } },
    todayBtn: { click: { handler: true, emits: ['daySelect'] } },
    tomorrowBtn: { click: { handler: true, emits: ['daySelect'] } },
    dateLabel: { click: { handler: true } },
};
