import type { TemplateDecl } from '@/component-core';

export const TOAST_TEMPLATE: TemplateDecl = {
    tag: 'div',
    classes: 'q-toast',
    children: [
        { tag: 'div', name: 'icon', classes: 'q-toast__icon', style: { display: 'none' } },
        {
            tag: 'div',
            name: 'body',
            classes: 'q-toast__body',
            children: [
                { tag: 'div', name: 'message', classes: 'q-toast__message' },
                { tag: 'div', name: 'text', classes: 'q-toast__text', style: { display: 'none' } },
            ],
        },
        { tag: 'div', name: 'closeBtn', classes: 'q-toast__close' },
    ],
};
