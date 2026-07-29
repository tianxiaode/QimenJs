import type { TplNode } from '@/component-core';

export const ALERT_TPL: TplNode = {
    tag: 'div',
    cls: 'q-alert',
    attrs: { role: 'alert' },
    children: [
        { tag: 'i', name: 'icon', cls: 'q-alert__icon' },
        {
            tag: 'div',
            cls: 'q-alert__body',
            children: [
                { tag: 'div', name: 'title', cls: 'q-alert__title', hidden: true },
                { tag: 'div', name: 'text', cls: 'q-alert__text' },
            ],
        },
        {
            tag: 'span',
            name: 'closeBtn',
            cls: 'q-alert__close',
            hidden: true,
        },
    ],
};
