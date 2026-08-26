import type { TemplateDecl } from '@/component-core';

export const MSGBOX_TEMPLATE: TemplateDecl = {
    tag: 'div',
    classes: 'q-msgbox',
    children: [
        {
            tag: 'div',
            name: 'header',
            classes: 'q-msgbox__header',
            children: [
                { tag: 'div', name: 'msgbox:text', classes: 'q-msgbox__title' },
                { tag: 'div', name: 'msgbox:close', classes: 'q-msgbox__close' },
            ],
        },
        {
            tag: 'div',
            name: 'body',
            classes: 'q-msgbox__body',
            children: [
                { tag: 'div', name: 'msgbox:content', classes: 'q-msgbox__content' },
                { tag: 'input', name: 'msgbox:field', classes: 'q-msgbox__input', style: { display: 'none' } },
            ],
        },
        {
            tag: 'div',
            name: 'footer',
            classes: 'q-msgbox__footer',
            children: [
                { tag: 'button', name: 'msgbox:cancel', classes: 'q-btn q-btn--default' },
                { tag: 'button', name: 'msgbox:confirm', classes: 'q-btn q-btn--primary' },
            ],
        },
    ],
};