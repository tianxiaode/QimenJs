import type { TemplateDecl } from '@/component-core';

export const MSGBOX_TPL: TemplateDecl = {
    tag: 'div',
    classes: 'q-msgbox',
    children: [
        {
            tag: 'div',
            name: 'header',
            classes: 'q-msgbox__header',
            children: [
                { tag: 'div', name: 'title', classes: 'q-msgbox__title' },
                {
                    tag: 'div',
                    name: 'close',
                    classes: 'q-msgbox__close',
                },
            ],
        },
        {
            tag: 'div',
            name: 'body',
            classes: 'q-msgbox__body',
            children: [
                { tag: 'div', name: 'content', classes: 'q-msgbox__content' },
                {
                    tag: 'input',
                    name: 'field',
                    classes: 'q-msgbox__input hidden',
                    style: { display: 'none' },
                },
            ],
        },
        {
            tag: 'div',
            name: 'footer',
            classes: 'q-msgbox__footer',
            children: [
                {
                    tag: 'button',
                    name: 'cancel',
                    options: { action: 'cancel' },
                    classes: 'q-button q-button--default q-size--md',
                },
                {
                    tag: 'button',
                    name: 'confirm',
                    options: { action: 'confirm' },
                    classes: 'q-button q-button--success q-size--md',
                },
            ],
        },
    ],
};
