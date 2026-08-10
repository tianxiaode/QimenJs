import type { TplNode } from '@/component-core';

export const TOAST_TEMPLATE: TplNode = {
    tag: 'div',
    cls: 'q-toast',
    children: [
        { tag: 'div', name: 'icon', cls: 'q-toast__icon', hidden: true },
        { tag: 'div', name: 'body', cls: 'q-toast__body' },
        { tag: 'div', name: 'close', cls: 'q-toast__close' },
    ],
};

export const TOAST_NOTIFICATION_TEMPLATE: TplNode = {
    tag: 'div',
    cls: 'q-notification',
    children: [
        { tag: 'div', name: 'icon', cls: 'q-notification__icon', hidden: true },
        { tag: 'div', name: 'body', cls: 'q-notification__body' },
        { tag: 'div', name: 'close', cls: 'q-notification__close' },
    ],
};
