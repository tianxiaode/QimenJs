import type { TemplateDecl } from '@/component-core';

export const TOAST_TEMPLATE: TemplateDecl = {
    tag: 'div',
    classes: 'q-toast',
    children: [
        { tag: 'div', name: 'toast:icon', classes: 'q-toast__icon', style: { display: 'none' } },
        {
            tag: 'div',
            name: 'toast:body',
            classes: 'q-toast__body',
            children: [
                { tag: 'div', name: 'toast:message', classes: 'q-toast__message' },
            ],
        },
        { tag: 'div', name: 'toast:close', classes: 'q-toast__close' },
    ],
};

export const TOAST_NOTIFICATION_TEMPLATE: TemplateDecl = {
    tag: 'div',
    classes: 'q-notification',
    children: [
        { tag: 'div', name: 'toast:icon', classes: 'q-notification__icon', style: { display: 'none' } },
        {
            tag: 'div',
            name: 'toast:body',
            classes: 'q-notification__body',
            children: [
                { tag: 'div', name: 'toast:message', classes: 'q-notification__message' },
                { tag: 'div', name: 'toast:text', classes: 'q-notification__text' },
            ],
        },
        { tag: 'div', name: 'toast:close', classes: 'q-notification__close' },
    ],
};