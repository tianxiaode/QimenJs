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
                    i18n: { title: 'common:close' },
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
                    i18n: { text: 'common:cancel', hint: 'common:cancel' },
                    options: { action: 'cancel' },
                    classes: 'q-btn q-btn--default',
                },
                {
                    tag: 'button',
                    name: 'confirm',
                    i18n: { text: 'common:confirm', hint: 'common:confirm' },
                    options: { action: 'confirm' },
                    classes: 'q-btn q-btn--primary',
                },
            ],
        },
    ],
};
