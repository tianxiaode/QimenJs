import type { TplNode } from '@/component-core/types/tpl-node-types';
import type { TplEvents } from '@/component-core/types/tpl-events';

export const YEAR_PANEL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-dtpanel',
    children: [
        {
            tag: 'div',
            name: 'nav',
            cls: 'q-dtpanel__nav',
            children: [
                { tag: 'button', name: 'backBtn', cls: 'q-dtpanel__nav-btn', i18n: 'back' },
                { tag: 'button', name: 'prevBtn', cls: 'q-dtpanel__nav-btn', i18n: 'prev' },
                { tag: 'span', name: 'title', cls: 'q-dtpanel__nav-title', i18n: 'selectYear' },
                {
                    tag: 'button',
                    name: 'confirmBtn',
                    cls: 'q-dtpanel__nav-btn q-dtpanel__nav-confirm',
                    i18n: 'confirm',
                },
            ],
        },
        {
            tag: 'div',
            name: 'thousandsRow',
            cls: 'q-dtpanel__high-row',
        },
        {
            tag: 'div',
            name: 'digitGroups',
            cls: 'q-dtpanel__digit-groups',
        },
    ],
};

export const YEAR_PANEL_EVENTS: TplEvents = {
    backBtn: { click: { handler: true } },
    prevBtn: { click: { handler: true } },
    confirmBtn: { click: { handler: true, emits: ['confirm'] } },
    thousandsRow: { click: { handler: true } },
    digitGroups: { click: { handler: true } },
};
